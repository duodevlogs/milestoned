import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { documentService } from "@/server/services/document.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { SowFlow } from "@/components/generate/sow/SowFlow";
import { userService } from "@/server/services/user.service";
import { toSowDraft, type ProposalContent } from "@/lib/proposal-generation";

export default async function GenerateSowPage({
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
  const fromProposalId = typeof params.fromProposal === "string" ? params.fromProposal : null;

  const [profile, clients, linkableDocuments, proposalDoc] = await Promise.all([
    userService.getProfile(user.id),
    clientController.listForUser(user.id),
    documentService.listLinkableForSOW(user.id),
    fromProposalId ? documentService.getForUser(user.id, fromProposalId).catch(() => null) : null,
  ]);

  // Only an accepted (status "signed") Proposal can seed a SOW draft —
  // silently ignored otherwise, same as the Contract flow's page.
  const initialFromProposal =
    proposalDoc && proposalDoc.docType === "proposal" && proposalDoc.status === "signed"
      ? toSowDraft(proposalDoc.content as ProposalContent, proposalDoc.clientId, proposalDoc.id)
      : null;

  return (
    <SowFlow
      initialCredits={profile?.creditsRemaining ?? 0}
      clients={clients}
      linkableDocuments={linkableDocuments}
      initialFromProposal={initialFromProposal}
    />
  );
}
