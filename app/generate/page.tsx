import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { clientController } from "@/server/controllers/client.controller";
import { templateController } from "@/server/controllers/template.controller";
import { clauseBundleController } from "@/server/controllers/clause-bundle.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { GenerateFlow } from "@/components/generate/GenerateFlow";

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

  const [profile, clients, bundles, initialTemplate] = await Promise.all([
    userService.getProfile(user.id),
    clientController.listForUser(user.id),
    clauseBundleController.listForUser(user.id),
    templateId ? templateController.getForUser(user.id, templateId).catch(() => null) : null,
  ]);

  return (
    <GenerateFlow
      initialCredits={profile?.creditsRemaining ?? 0}
      clients={clients}
      bundles={bundles}
      initialTemplate={initialTemplate}
      businessName={profile?.businessName}
      logoUrl={profile?.logoUrl}
    />
  );
}
