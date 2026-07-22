import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { DocPreviewCard } from "@/components/landing/DocPreviewCard";

const PERKS = [
  "Locked-in founding price",
  "Guaranteed access at launch",
  "Generation credits included",
];

const BANNERS: Record<string, { text: string; tone: "ok" | "warn" }> = {
  success: {
    text: "Payment received. Check your inbox — we've sent your founding-member confirmation.",
    tone: "ok",
  },
  cancelled: {
    text: "Checkout cancelled. You can become a founding member whenever you're ready.",
    tone: "warn",
  },
  error: {
    text: "Something went wrong starting checkout. Please try again.",
    tone: "warn",
  },
};

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
      <path
        d="M1.5 5.2L4 7.5L8.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const checkout =
    typeof params.checkout === "string" ? params.checkout : null;
  const banner = checkout ? BANNERS[checkout] : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy text-fg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)]" />

      <div className="relative mx-auto max-w-[1200px] px-10">
        <header className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <LogoMark />
            <span className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-bright">
              Milestoned
            </span>
          </div>
          <Link href="/login" className="text-[14.5px] font-[450] text-fg-tertiary">
            Sign in
          </Link>
        </header>

        {banner && (
          <div
            className={`mb-2 rounded-[11px] border px-4 py-3.5 text-sm leading-[1.5] ${
              banner.tone === "ok"
                ? "border-gold-border bg-gold-soft text-fg-label"
                : "border-line-strong bg-white/[0.02] text-fg-soft"
            }`}
          >
            {banner.text}
          </div>
        )}

        <main className="flex flex-wrap items-center gap-[72px] pb-24 pt-[72px]">
          <div className="min-w-[320px] flex-[1_1_460px]">
            <div className="mb-[30px] inline-flex items-center gap-[9px] rounded-full border border-white/[0.09] bg-white/[0.02] py-1.5 pl-[11px] pr-[13px]">
              <span className="h-1.5 w-1.5 animate-ms-pulse rounded-full bg-gold" />
              <span className="text-[13px] font-medium tracking-[0.01em] text-fg-soft">
                Now inviting founding members
              </span>
            </div>

            <h1 className="mb-[26px] font-display text-[clamp(2.4rem,4.6vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-fg-heading text-balance">
              You lose a day to paperwork
              <br />
              before the project even starts.
            </h1>

            <p className="mb-[38px] max-w-[560px] text-[1.19rem] font-normal leading-[1.62] text-fg-secondary text-pretty">
              Milestoned drafts the four documents every web project needs —{" "}
              <span className="text-[#d5dce3]">
                Scope of Work, Contract, Proposal, and Invoice
              </span>{" "}
              — written for dev consultants, with milestone-based, interest-free
              payment terms built into every one.
            </p>

            <div className="flex flex-col items-start gap-[18px]">
              <form action="/api/checkout/founding-member" method="POST">
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-[11px] rounded-[11px] bg-gold px-[26px] py-4 font-display text-[1.02rem] font-semibold tracking-[-0.005em] text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-150 hover:-translate-y-px"
                >
                  Become a Founding Member — $7
                  <span className="translate-y-[0.5px] text-[1.1em] leading-none">
                    →
                  </span>
                </button>
              </form>
              <span className="text-[13.5px] text-fg-muted">
                One-time — no subscription until launch. Secure checkout via
                Stripe.
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-line-faint pt-8">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-[9px]">
                  <span className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
                    <CheckIcon />
                  </span>
                  <span className="text-sm font-[450] text-fg-soft">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-[320px] flex-[1_1_420px] justify-center">
            <DocPreviewCard />
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line-faint pb-10 pt-6">
          <span className="text-[13px] text-fg-muted">© 2026 Milestoned</span>
          <span className="text-[13px] text-fg-muted">
            Built for people who ship client work.
          </span>
        </footer>
      </div>
    </div>
  );
}
