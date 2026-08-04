import "server-only";

import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { clientService } from "@/server/services/client.service";
import { documentNumberService } from "@/server/services/document-number.service";
import { AppError } from "@/server/errors";
import { DOC_TYPE_META } from "@/lib/document-display";
import { computeInvoiceTotals, type InvoiceContent } from "@/lib/invoice-generation";
import type { GenerateInvoiceInput } from "@/server/validation/invoice-generation.schema";
import type { Document } from "@/server/db/schema";

/*
 * Unlike the Contract/SOW/Proposal generator, this never calls the AI
 * service — an invoice's content is identification, parties, a charge, and
 * payment terms, all either user-entered or computed. Consistent with the
 * rest of the app's monetization model, generating one still spends a
 * credit like any other document.
 */
export const invoiceGenerationService = {
  async generate(
    userId: string,
    input: GenerateInvoiceInput
  ): Promise<{ document: Document; creditsRemaining: number }> {
    if (input.clientId) {
      const client = await clientService.verifyOwnership(userId, input.clientId);
      if (!client) {
        throw AppError.badRequest("Client not found.", "client_not_found");
      }
    }

    let relatedDocNumber: string | null = null;
    if (input.relatedDocumentId) {
      const related = await documentRepository.getByIdForUser(input.relatedDocumentId, userId);
      if (!related) {
        throw AppError.badRequest("Linked document not found.", "related_document_not_found");
      }
      relatedDocNumber = related.docNumber ?? null;
    }

    const afterDecrement = await userRepository.decrementCreditsIfAvailable(userId);
    if (!afterDecrement) {
      throw AppError.paymentRequired(
        "You're out of generation credits. Top up to keep generating.",
        "no_credits"
      );
    }

    let document: Document;
    try {
      const profile = await userRepository.findById(userId);
      const docNumber = await documentNumberService.generate(
        userId,
        "invoice",
        profile?.businessName
      );
      const { subtotal, taxAmount, total } = computeInvoiceTotals(
        input.lineItems,
        input.taxRatePct
      );

      const content: InvoiceContent = {
        docType: "invoice",
        docTypeLabel: DOC_TYPE_META.invoice.label,
        docNumber,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate || null,
        paymentTermsLabel: input.paymentTermsLabel,
        relatedDocNumber,
        businessName: profile?.businessName ?? "",
        businessAddress: profile?.businessAddress ?? null,
        taxId: profile?.taxId ?? null,
        companyRegistration: profile?.companyRegistration ?? null,
        clientName: input.clientName,
        clientCompany: input.clientCompany || null,
        clientBillingAddress: input.clientBillingAddress || null,
        projectName: input.projectName,
        lineItems: input.lineItems.map((item) => ({
          description: item.description,
          milestoneLabel: item.milestoneLabel || null,
          amount: item.amount,
        })),
        milestoneProgress: input.milestoneProgress ?? null,
        subtotal,
        taxRatePct: input.taxRatePct,
        taxAmount,
        total,
        currency: input.currency,
        paymentInstructions: profile?.paymentInstructions ?? null,
        poNumber: input.poNumber || null,
        thankYouNote: input.thankYouNote || null,
        generatedAt: new Date().toISOString(),
      };

      document = await documentRepository.create({
        userId,
        docType: "invoice",
        clientName: input.clientName,
        clientId: input.clientId ?? null,
        projectName: input.projectName,
        content,
        docNumber,
        relatedDocumentId: input.relatedDocumentId ?? null,
      });
    } catch (error) {
      await userRepository.refundCredit(userId);
      throw error;
    }

    return { document, creditsRemaining: afterDecrement.creditsRemaining };
  },
};
