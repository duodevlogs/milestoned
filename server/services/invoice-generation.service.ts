import "server-only";

import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { clientService } from "@/server/services/client.service";
import { projectService } from "@/server/services/project.service";
import { documentNumberService } from "@/server/services/document-number.service";
import { AppError } from "@/server/errors";
import { DOC_TYPE_META } from "@/lib/document-display";
import { computeInvoiceTotals, type InvoiceContent } from "@/lib/invoice-generation";
import type { GenerateInvoiceInput } from "@/server/validation/invoice-generation.schema";
import { formatPaymentMethod, type SavedPaymentMethod } from "@/lib/payment-methods";
import type { Document } from "@/server/db/schema";

type InvoiceProfile = {
  businessName: string | null;
  businessAddress: string | null;
  taxId: string | null;
  companyRegistration: string | null;
  paymentMethods: SavedPaymentMethod[];
} | null;

/** Shared by generate and update — the invoice body is identical either way, only docNumber/generatedAt differ. */
/** Turns the ticked ids into printable snapshots, in the account's own order. An unknown id is an error, never silently dropped — that would print an invoice with no way to pay. */
function resolvePaymentMethods(
  profile: InvoiceProfile,
  ids: string[]
): { methodId: string; title: string; lines: string[] }[] {
  const saved = profile?.paymentMethods ?? [];
  for (const id of ids) {
    if (!saved.some((m) => m.id === id)) {
      throw AppError.badRequest(
        "A selected payment method no longer exists. Reload and pick again.",
        "payment_method_not_found"
      );
    }
  }
  return saved
    .filter((m) => ids.includes(m.id))
    .map((m) => ({ methodId: m.id, ...formatPaymentMethod(m) }));
}

function buildInvoiceContent(
  input: GenerateInvoiceInput,
  profile: InvoiceProfile,
  docNumber: string,
  relatedDocNumber: string | null,
  generatedAt: string
): InvoiceContent {
  const { subtotal, taxAmount, total } = computeInvoiceTotals(
    input.lineItems,
    input.taxRatePct,
    input.discountAmount
  );

  return {
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
    discountAmount: input.discountAmount,
    taxRatePct: input.taxRatePct,
    taxExemptionNote: input.taxExemptionNote || null,
    lateFeeNote: input.lateFeeNote || null,
    serviceDate: input.serviceDate || null,
    clientTaxId: input.clientTaxId || null,
    taxAmount,
    total,
    currency: input.currency,
    paymentInstructions: null,
    paymentMethods: resolvePaymentMethods(profile, input.paymentMethodIds),
    customPaymentDetails: input.customPaymentDetails || null,
    poNumber: input.poNumber || null,
    thankYouNote: input.thankYouNote || null,
    additionalDetails: input.additionalDetails || null,
    generatedAt,
  };
}

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
      const content = buildInvoiceContent(input, profile, docNumber, relatedDocNumber, new Date().toISOString());

      const projectId = await projectService.findOrCreateForDocument(userId, {
        clientId: input.clientId,
        clientName: input.clientName,
        name: input.projectName,
      });

      document = await documentRepository.create({
        userId,
        docType: "invoice",
        clientName: input.clientName,
        clientId: input.clientId ?? null,
        projectName: input.projectName,
        projectId,
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

  /**
   * Edits an already-generated invoice in place — same id, number, project
   * link, and shared status. No credit is spent: there's no AI call, and
   * fixing a mistake shouldn't cost anything. The business details on the
   * invoice are re-read from the current profile, so an edit picks up
   * details added since it was first generated (e.g. payment instructions).
   */
  async update(
    userId: string,
    documentId: string,
    input: GenerateInvoiceInput
  ): Promise<{ document: Document }> {
    const existing = await documentRepository.getByIdForUser(documentId, userId);
    if (!existing || existing.docType !== "invoice") {
      throw AppError.notFound("Invoice not found.", "document_not_found");
    }

    if (input.clientId) {
      const client = await clientService.verifyOwnership(userId, input.clientId);
      if (!client) {
        throw AppError.badRequest("Client not found.", "client_not_found");
      }
    }

    let relatedDocNumber: string | null = null;
    if (input.relatedDocumentId) {
      if (input.relatedDocumentId === documentId) {
        throw AppError.badRequest("An invoice can't reference itself.", "related_document_invalid");
      }
      const related = await documentRepository.getByIdForUser(input.relatedDocumentId, userId);
      if (!related) {
        throw AppError.badRequest("Linked document not found.", "related_document_not_found");
      }
      relatedDocNumber = related.docNumber ?? null;
    }

    const profile = await userRepository.findById(userId);
    const previous = existing.content as InvoiceContent;
    const content = buildInvoiceContent(
      input,
      profile,
      existing.docNumber ?? previous.docNumber,
      relatedDocNumber,
      previous.generatedAt
    );

    const projectId = await projectService.findOrCreateForDocument(userId, {
      clientId: input.clientId,
      clientName: input.clientName,
      name: input.projectName,
    });

    const document = await documentRepository.updateContentForUser(documentId, userId, {
      clientName: input.clientName,
      clientId: input.clientId ?? null,
      projectName: input.projectName,
      projectId,
      relatedDocumentId: input.relatedDocumentId ?? null,
      content,
    });
    if (!document) {
      throw AppError.notFound("Invoice not found.", "document_not_found");
    }
    return { document };
  },
};
