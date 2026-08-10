import "server-only";

import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { openaiService } from "@/server/services/openai.service";
import { clientService } from "@/server/services/client.service";
import { projectService } from "@/server/services/project.service";
import { documentNumberService } from "@/server/services/document-number.service";
import { AppError } from "@/server/errors";
import { DOC_TYPE_META } from "@/lib/document-display";
import { buildClauseSections } from "@/lib/contract-clauses";
import { computeSowMilestones, buildGoverningTermsNote, type SowContent } from "@/lib/sow-generation";
import type { GenerateSowInput } from "@/server/validation/sow-generation.schema";
import type { Document } from "@/server/db/schema";

export const sowGenerationService = {
  async generate(
    userId: string,
    input: GenerateSowInput
  ): Promise<{ document: Document; creditsRemaining: number }> {
    if (input.clientId) {
      const client = await clientService.verifyOwnership(userId, input.clientId);
      if (!client) {
        throw AppError.badRequest("Client not found.", "client_not_found");
      }
    }

    let linkedProposalNumber: string | null = null;
    if (input.relatedProposalId) {
      const related = await documentRepository.getByIdForUser(input.relatedProposalId, userId);
      if (!related) {
        throw AppError.badRequest("Linked proposal not found.", "related_document_not_found");
      }
      linkedProposalNumber = related.docNumber ?? null;
    }

    let linkedContractNumber: string | null = null;
    if (input.relatedContractId) {
      const related = await documentRepository.getByIdForUser(input.relatedContractId, userId);
      if (!related) {
        throw AppError.badRequest("Linked contract not found.", "related_document_not_found");
      }
      linkedContractNumber = related.docNumber ?? null;
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
      const docNumber = await documentNumberService.generate(userId, "sow", profile?.businessName);

      const sections = await openaiService.generateSowSections({
        businessName: profile?.businessName ?? null,
        clientName: input.clientName,
        projectName: input.projectName,
        linkedContractNumber,
        overviewNotes: input.overviewNotes,
        scopeNotes: input.scopeNotes,
      });

      const content: SowContent = {
        docType: "sow",
        docTypeLabel: DOC_TYPE_META.sow.label,
        docNumber,
        version: input.version,
        linkedProposalNumber,
        linkedContractNumber,
        businessName: profile?.businessName ?? "",
        businessAddress: profile?.businessAddress ?? null,
        clientName: input.clientName,
        clientCompany: input.clientCompany || null,
        projectName: input.projectName,
        purpose: sections.purpose,
        projectOverview: sections.projectOverview,
        scopeOfWork: sections.scopeOfWork,
        outOfScope: input.outOfScope,
        deliverables: input.deliverables,
        clientResponsibilities: input.clientResponsibilities,
        assumptions: input.assumptions,
        budget: input.budget,
        milestones: computeSowMilestones(input.milestones, input.budget),
        clauses: input.clauses,
        clauseSections: buildClauseSections(input.clauses),
        governingTermsNote: buildGoverningTermsNote(linkedContractNumber),
        generatedAt: new Date().toISOString(),
      };

      const projectId = await projectService.findOrCreateForDocument(userId, {
        clientId: input.clientId,
        clientName: input.clientName,
        name: input.projectName,
      });

      document = await documentRepository.create({
        userId,
        docType: "sow",
        clientName: input.clientName,
        clientId: input.clientId ?? null,
        projectName: input.projectName,
        projectId,
        content,
        docNumber,
        // documents.relatedDocumentId is a single FK slot, but a SOW can
        // cross-reference both a Proposal and a Contract — the contract
        // (the more legally significant link) takes the FK slot; both
        // numbers are preserved regardless as a snapshot inside content.
        relatedDocumentId: input.relatedContractId ?? input.relatedProposalId ?? null,
      });
    } catch (error) {
      await userRepository.refundCredit(userId);
      throw error;
    }

    return { document, creditsRemaining: afterDecrement.creditsRemaining };
  },
};
