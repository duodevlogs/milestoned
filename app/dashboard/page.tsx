import { redirect } from "next/navigation";
import { LogoMark } from "@/components/LogoMark";
import { signOut } from "@/app/login/actions";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";

// Placeholder — the full Dashboard design is built in Phase 4.
export default async function DashboardPage() {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await userService.getProfile(user.id);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-10">
      <div className="flex items-center gap-[11px]">
        <LogoMark />
        <span className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-bright">
          Milestoned
        </span>
      </div>

      <p className="text-[14.5px] text-fg-secondary">
        Signed in as <span className="text-fg">{user.email}</span>
      </p>
      <p className="text-sm text-fg-tertiary">
        Credits remaining:{" "}
        <span className="font-display font-semibold text-gold">
          {profile?.creditsRemaining ?? 0}
        </span>
      </p>
      <p className="text-[13px] text-fg-muted">Dashboard design lands in Phase 4.</p>

      <form action={signOut}>
        <button
          type="submit"
          className="cursor-pointer rounded-[9px] border border-line-strong bg-transparent px-[15px] py-[9px] text-[13.5px] font-medium text-fg-soft"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
