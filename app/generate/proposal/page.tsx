import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { ProposalFlow } from "@/components/generate/proposal/ProposalFlow";
import { userService } from "@/server/services/user.service";

export default async function GenerateProposalPage() {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const [profile, clients] = await Promise.all([
    userService.getProfile(user.id),
    clientController.listForUser(user.id),
  ]);

  return <ProposalFlow initialCredits={profile?.creditsRemaining ?? 0} clients={clients} />;
}
