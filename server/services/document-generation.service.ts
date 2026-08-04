import "server-only";

import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { openaiService } from "@/server/services/openai.service";
import { clientService } from "@/server/services/client.service";
import { AppError } from "@/server/errors";
import { DOC_TYPE_META } from "@/lib/document-display";
import { computeMilestoneAmounts, type GeneratedDocumentContent } from "@/lib/document-generation";
import { ACCEPTANCE_CLAUSE, buildClauseSections } from "@/lib/contract-clauses";
import type { GenerateDocumentInput } from "@/server/validation/document-generation.schema";
import type { Document } from "@/server/db/schema";

/*
 * Per-hour rate limiting on this endpoint is Phase 8 in the build order —
 * deliberately not implemented here. Only the credit check gates generation
 * for now.
 */
export const documentGenerationService = {
  async generate(
    userId: string,
    input: GenerateDocumentInput
  ): Promise<{ document: Document; creditsRemaining: number }> {
    // Verify a submitted clientId really belongs to this user BEFORE
    // spending a credit — never trust it just because it parsed as a uuid.
    if (input.clientId) {
      const client = await clientService.verifyOwnership(userId, input.clientId);
      if (!client) {
        throw AppError.badRequest("Client not found.", "client_not_found");
      }
    }

    const afterDecrement = await userRepository.decrementCreditsIfAvailable(userId);
    if (!afterDecrement) {
      throw AppError.paymentRequired(
        "You're out of generation credits. Top up to keep generating.",
        "no_credits"
      );
    }

    let sections;
    try {
      sections = await openaiService.generateDocumentSections({
        docType: input.docType,
        clientName: input.clientName,
        projectName: input.projectName,
        budget: input.budget,
        scope: input.scope,
        deliverables: input.deliverables ?? "",
      });
    } catch (error) {
      await userRepository.refundCredit(userId);
      throw error;
    }

    const content: GeneratedDocumentContent = {
      docType: input.docType,
      docTypeLabel: DOC_TYPE_META[input.docType].label,
      clientName: input.clientName,
      projectName: input.projectName,
      budget: input.budget,
      scope: input.scope,
      deliverables: input.deliverables ?? "",
      startDate: input.startDate || null,
      deliveryDate: input.deliveryDate || null,
      milestones: computeMilestoneAmounts(input.milestones, input.budget),
      // Plain titles — numbering is computed at render time, not baked in
      // here, since the clause count varies per document.
      sections: [
        { title: "Parties & Purpose", body: sections.partiesAndPurpose },
        { title: "Scope of Work", body: sections.scopeOfWork },
        ...buildClauseSections(input.clauses), // fixed templates, no AI involved
        ACCEPTANCE_CLAUSE, // always included, same for every document
      ],
      clauses: input.clauses,
      generatedAt: new Date().toISOString(),
    };

    let document: Document;
    try {
      document = await documentRepository.create({
        userId,
        docType: input.docType,
        clientName: input.clientName,
        clientId: input.clientId ?? null,
        projectName: input.projectName,
        content,
      });
    } catch (error) {
      await userRepository.refundCredit(userId);
      throw error;
    }

    return { document, creditsRemaining: afterDecrement.creditsRemaining };
  },
};
