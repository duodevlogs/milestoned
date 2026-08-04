import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

/*
 * Where a fresh pre-launch signup lands after confirming their email — see
 * app/page.tsx, which only points the signup CTA here while isPrelaunch is
 * true. Once the app launches, new signups go straight to /dashboard again;
 * this page is never wired into that path, so nothing needs to be reverted
 * by hand.
 */
export default function WelcomePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:26px_26px]" />

      <div className="relative w-full max-w-[440px] text-center">
        <div className="mb-8 flex items-center justify-center gap-[11px]">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-bright">
            Milestoned
          </span>
        </div>

        <div className="rounded-2xl border border-line-soft bg-panel p-10 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M4 11.5L9 16.5L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.015em] text-fg-heading">
            You&apos;re in.
          </h1>
          <p className="mb-1.5 text-[15px] leading-[1.6] text-fg-secondary">
            Thanks for signing up — your founding pricing is locked in.
          </p>
          <p className="text-[15px] leading-[1.6] text-fg-secondary">
            Milestoned isn&apos;t open yet. We&apos;ll email you the moment it is.
          </p>
        </div>

        <Link href="/" className="mt-6 inline-block text-[13.5px] font-medium text-fg-muted">
          ← Back to the homepage
        </Link>
      </div>
    </div>
  );
}
