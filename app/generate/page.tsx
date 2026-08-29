import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { clientController } from "@/server/controllers/client.controller";
import { templateController } from "@/server/controllers/template.controller";
import { clauseBundleController } from "@/server/controllers/clause-bundle.controller";
import { documentService } from "@/server/services/document.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { GenerateFlow } from "@/components/generate/GenerateFlow";
import { toContractDraft, type ProposalContent } from "@/lib/proposal-generation";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const params = await searchParams;
  const templateId = typeof params.template === "string" ? params.template : null;
  const fromProposalId = typeof params.fromProposal === "string" ? params.fromProposal : null;

  const [profile, clients, bundles, initialTemplate, proposalDoc] = await Promise.all([
    userService.getProfile(user.id),
    clientController.listForUser(user.id),
    clauseBundleController.listForUser(user.id),
    templateId ? templateController.getForUser(user.id, templateId).catch(() => null) : null,
    fromProposalId ? documentService.getForUser(user.id, fromProposalId).catch(() => null) : null,
  ]);

  // Only an accepted (status "signed") Proposal can seed a Contract draft —
  // silently ignored otherwise (stale link, wrong doc type, not yet
  // accepted) rather than erroring the whole page.
  const initialFromProposal =
    proposalDoc && proposalDoc.docType === "proposal" && proposalDoc.status === "signed"
      ? toContractDraft(proposalDoc.content as ProposalContent, proposalDoc.clientId)
      : null;

  return (
    <GenerateFlow
      initialCredits={profile?.creditsRemaining ?? 0}
      clients={clients}
      bundles={bundles}
      initialTemplate={initialTemplate}
      initialFromProposal={initialFromProposal}
      businessName={profile?.businessName}
      logoUrl={profile?.logoUrl}
    />
  );
}
