import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { documentService } from "@/server/services/document.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { SowFlow } from "@/components/generate/sow/SowFlow";
import { userService } from "@/server/services/user.service";

export default async function GenerateSowPage() {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const [profile, clients, linkableDocuments] = await Promise.all([
    userService.getProfile(user.id),
    clientController.listForUser(user.id),
    documentService.listLinkableForSOW(user.id),
  ]);

  return (
    <SowFlow
      initialCredits={profile?.creditsRemaining ?? 0}
      clients={clients}
      linkableDocuments={linkableDocuments}
    />
  );
}
