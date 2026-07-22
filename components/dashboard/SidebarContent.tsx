import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

function DocumentsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gold">
      <path d="M4 2.5h5l3 3v8H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 2.5v3h3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function TemplatesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-fg-muted">
      <rect x="2.5" y="2.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-fg-muted">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-fg-muted">
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/*
 * Templates/Clients/Account settings and "Top up credits" aren't in the
 * 8-phase build plan (top-up is Phase 7; the other three aren't scoped at
 * all), so they're rendered as inert, dimmed items rather than dead links —
 * matches the design visually without implying a feature that isn't there.
 *
 * Rendered via a Fragment (no wrapping element) so it drops straight into
 * whichever flex-col parent hosts it — the desktop <aside> or the mobile
 * drawer panel — and `mt-auto` on the credits box still pushes correctly
 * to the bottom of either.
 */
export function SidebarContent({
  creditsLeft,
  creditsTotal,
  onNavigate,
}: {
  creditsLeft: number;
  creditsTotal: number;
  onNavigate?: () => void;
}) {
  const creditsUsed = Math.max(creditsTotal - creditsLeft, 0);
  const pct = creditsTotal > 0 ? Math.round((creditsUsed / creditsTotal) * 100) : 0;

  return (
    <>
      <div className="flex items-center gap-[11px] px-2 pb-[22px]">
        <LogoMark />
        <span className="font-display text-[17px] font-semibold tracking-[-0.01em] text-fg-bright">
          Milestoned
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-[11px] rounded-lg bg-white/[0.04] px-2.5 py-[9px] text-sm font-medium text-fg-bright"
        >
          <DocumentsIcon />
          Documents
        </Link>
        <span className="flex cursor-default items-center gap-[11px] rounded-lg px-2.5 py-[9px] text-sm font-[450] text-fg-secondary opacity-60">
          <TemplatesIcon />
          Templates
        </span>
        <span className="flex cursor-default items-center gap-[11px] rounded-lg px-2.5 py-[9px] text-sm font-[450] text-fg-secondary opacity-60">
          <ClientsIcon />
          Clients
        </span>
        <span className="flex cursor-default items-center gap-[11px] rounded-lg px-2.5 py-[9px] text-sm font-[450] text-fg-secondary opacity-60">
          <SettingsIcon />
          Account settings
        </span>
      </nav>

      <div className="mt-auto rounded-[11px] border border-line-soft bg-white/[0.015] p-3.5">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-[0.02em] text-fg-tertiary">Credits</span>
          <span className="font-display text-[13px] font-medium text-fg-label">
            {creditsUsed} used
          </span>
        </div>
        <div className="mb-[11px] h-[5px] overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
        </div>
        <span className="block cursor-default rounded-lg border border-gold-soft py-1.5 text-center text-[13px] font-medium text-gold opacity-70">
          Top up credits
        </span>
      </div>
    </>
  );
}
