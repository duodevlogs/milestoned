import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { CreditsRing } from "@/components/dashboard/CreditsRing";
import { DocumentRow } from "@/components/dashboard/DocumentRow";
import { signOut } from "@/app/login/actions";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { documentService } from "@/server/services/document.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { greetingForHour, displayNameFromEmail, initialsFromName } from "@/lib/user-display";

const TOPUP_BANNERS: Record<string, { text: string; tone: "ok" | "warn" }> = {
  success: {
    text: "Payment received. Your credits have been added.",
    tone: "ok",
  },
  cancelled: {
    text: "Checkout cancelled. You can top up whenever you're ready.",
    tone: "warn",
  },
  error: {
    text: "Something went wrong starting checkout. Please try again.",
    tone: "warn",
  },
};

export default async function DashboardPage({
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
  const topup = typeof params.topup === "string" ? params.topup : null;
  const banner = topup ? TOPUP_BANNERS[topup] : null;

  const [profile, documents] = await Promise.all([
    userService.getProfile(user.id),
    documentService.listForUser(user.id),
  ]);

  const displayName = displayNameFromEmail(user.email ?? "there");
  const initials = initialsFromName(displayName);
  const greeting = greetingForHour(new Date().getHours());
  const creditsLeft = profile?.creditsRemaining ?? 0;
  const creditsTotal = profile?.creditsTotalPurchased ?? 0;

  return (
    <div className="flex min-h-screen bg-navy text-fg">
      <Sidebar creditsLeft={creditsLeft} creditsTotal={creditsTotal} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[5] flex items-center justify-between gap-3 border-b border-line-faint bg-navy/85 px-4 py-4 backdrop-blur-[8px] sm:px-6 md:px-10 md:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav creditsLeft={creditsLeft} creditsTotal={creditsTotal} />
            <div className="min-w-0">
              <div className="mb-[3px] truncate text-[13px] text-fg-muted">
                {greeting}, {displayName}
              </div>
              <div className="font-display text-xl font-semibold tracking-[-0.01em] text-fg-bright">
                Documents
              </div>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-white/[0.09] bg-white/[0.02] font-display text-[13px] font-semibold text-fg-label"
            >
              {initials}
            </button>
          </form>
        </header>

        <div className="w-full max-w-[1080px] px-4 pb-10 pt-6 sm:px-6 md:px-10 md:pb-[60px] md:pt-9">
          {banner && (
            <div
              className={`mb-6 rounded-[11px] border px-4 py-3.5 text-sm leading-[1.5] ${
                banner.tone === "ok"
                  ? "border-gold-border bg-gold-soft text-fg-label"
                  : "border-line-strong bg-white/[0.02] text-fg-soft"
              }`}
            >
              {banner.text}
            </div>
          )}

          <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap md:mb-10">
            <div className="flex min-w-[260px] flex-[1_1_340px] items-center justify-between gap-4 rounded-[14px] border border-line-soft bg-white/[0.015] px-5 py-5 sm:gap-5 sm:px-7 sm:py-6">
              <div>
                <div className="mb-2.5 text-[13px] uppercase tracking-[0.02em] text-fg-tertiary">
                  Generation credits
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-4xl font-semibold leading-none tracking-[-0.02em] text-gold sm:text-[52px]">
                    {creditsLeft}
                  </span>
                  <span className="text-[15px] text-fg-tertiary">of {creditsTotal} left</span>
                </div>
              </div>
              <CreditsRing left={creditsLeft} total={creditsTotal} />
            </div>

            <Link
              href="/generate"
              className="flex flex-none items-center justify-center gap-[11px] rounded-[14px] bg-gold px-7 py-4 font-display text-[1.02rem] font-semibold tracking-[-0.005em] text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_24px_rgba(0,0,0,0.3)] transition-transform duration-150 hover:-translate-y-px sm:py-0"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 3.5V14.5M3.5 9H14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              New Document
            </Link>
          </div>

          <div className="mb-3.5 flex items-center justify-between">
            <span className="font-display text-[15px] font-semibold text-fg">
              Recent documents
            </span>
            <span className="text-[13px] text-fg-muted">{documents.length} total</span>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
            <div className="hidden grid-cols-[1fr_150px_130px_140px_20px] gap-4 border-b border-line-faint px-[22px] py-3 text-[11.5px] uppercase tracking-[0.06em] text-fg-muted lg:grid">
              <span>Document</span>
              <span>Type</span>
              <span>Date</span>
              <span>Status</span>
              <span />
            </div>

            {documents.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-fg-muted sm:px-[22px]">
                No documents yet. Create your first one to see it here.
              </div>
            ) : (
              documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
