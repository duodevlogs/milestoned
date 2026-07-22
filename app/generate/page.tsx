import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { GenerateFlow } from "@/components/generate/GenerateFlow";

export default async function GeneratePage() {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await userService.getProfile(user.id);

  return <GenerateFlow initialCredits={profile?.creditsRemaining ?? 0} />;
}
