import "server-only";

import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { openaiService } from "@/server/services/openai.service";
import { clientService } from "@/server/services/client.service";
import { projectService } from "@/server/services/project.service";
import { documentNumberService } from "@/server/services/document-number.service";
import { AppError } from "@/server/errors";
import { DOC_TYPE_META } from "@/lib/document-display";
import { computeMilestoneAmounts } from "@/lib/document-generation";
import {
  addDays,
  DEFAULT_PROPOSAL_NEXT_STEPS,
  type ProposalContent,
} from "@/lib/proposal-generation";
import type { GenerateProposalInput } from "@/server/validation/proposal-generation.schema";
import type { Document } from "@/server/db/schema";

export const proposalGenerationService = {
  async generate(
    userId: string,
    input: GenerateProposalInput
  ): Promise<{ document: Document; creditsRemaining: number }> {
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

    let document: Document;
    try {
      const profile = await userRepository.findById(userId);
      const docNumber = await documentNumberService.generate(
        userId,
        "proposal",
        profile?.businessName
      );

      const sections = await openaiService.generateProposalSections({
        businessName: profile?.businessName ?? null,
        clientName: input.clientName,
        projectName: input.projectName,
        budget: input.budget,
        problemNotes: input.problemNotes,
        approachNotes: input.approachNotes,
        whyUsNotes: input.whyUsNotes,
      });

      const dateIssued = new Date().toISOString().slice(0, 10);

      const content: ProposalContent = {
        docType: "proposal",
        docTypeLabel: DOC_TYPE_META.proposal.label,
        docNumber,
        dateIssued,
        validityDays: input.validityDays,
        validUntil: addDays(dateIssued, input.validityDays),
        businessName: profile?.businessName ?? "",
        businessAddress: profile?.businessAddress ?? null,
        clientName: input.clientName,
        clientCompany: input.clientCompany || null,
        projectName: input.projectName,
        executiveSummary: sections.executiveSummary,
        understandingClientNeeds: sections.understandingClientNeeds,
        proposedApproach: sections.proposedApproach,
        whyUs: sections.whyUs,
        scopeOverview: input.scopeOverview,
        timelineOverview: input.timelineOverview,
        budget: input.budget,
        milestones: computeMilestoneAmounts(input.milestones, input.budget),
        addOns: input.addOns,
        paymentTermsLabel: "Milestone-based",
        assumptionsExclusions: input.assumptionsExclusions,
        nextSteps: input.nextSteps?.trim() || DEFAULT_PROPOSAL_NEXT_STEPS,
        includeAcceptanceSignature: input.includeAcceptanceSignature,
        generatedAt: new Date().toISOString(),
      };

      const projectId = await projectService.findOrCreateForDocument(userId, {
        clientId: input.clientId,
        clientName: input.clientName,
        name: input.projectName,
      });

      document = await documentRepository.create({
        userId,
        docType: "proposal",
        clientName: input.clientName,
        clientId: input.clientId ?? null,
        projectName: input.projectName,
        projectId,
        content,
        docNumber,
      });
    } catch (error) {
      await userRepository.refundCredit(userId);
      throw error;
    }

    return { document, creditsRemaining: afterDecrement.creditsRemaining };
  },
};
