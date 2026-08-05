import Link from "next/link";
import { connection } from "next/server";
import { LogoMark } from "@/components/LogoMark";
import { DocPreviewCard } from "@/components/landing/DocPreviewCard";
import { appSettingsService } from "@/server/services/app-settings.service";
import { CREDIT_PACKAGES, formatPackagePrice } from "@/lib/credit-packages";

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

export default async function Home() {
  // Reads live launch state on every request — without this, Next tries to
  // statically prerender "/" at build time (no cookies()/headers() usage to
  // force dynamic rendering on its own), which both fails when DATABASE_URL
  // isn't set at build time AND would freeze prelaunch copy/pricing into a
  // static page that a later launch-state flip couldn't update without a
  // fresh deploy.
  await connection();
  const isPrelaunch = await appSettingsService.isPrelaunch();

  const perks = isPrelaunch
    ? ["Free to sign up", "$3.50/$6 pricing locked in forever", "No charge until you generate"]
    : ["Free to sign up", "Pay only for what you generate", "Credits never expire"];

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

        <main className="flex flex-wrap items-center gap-[72px] pb-24 pt-[56px]">
          <div className="min-w-[320px] flex-[1_1_460px]">
            {isPrelaunch && (
              <div className="mb-[30px] inline-flex items-center gap-[9px] rounded-full border border-white/[0.09] bg-white/[0.02] py-1.5 pl-[11px] pr-[13px]">
                <span className="h-1.5 w-1.5 animate-ms-pulse rounded-full bg-gold" />
                <span className="text-[13px] font-medium tracking-[0.01em] text-fg-soft">
                  Pre-launch — sign up free, lock in founding pricing
                </span>
              </div>
            )}

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
              <Link
                href={
                  isPrelaunch
                    ? "/login?mode=signup&next=%2Fwelcome"
                    : "/login?mode=signup"
                }
                className="inline-flex cursor-pointer items-center gap-[11px] rounded-[11px] bg-gold px-[26px] py-4 font-display text-[1.02rem] font-semibold tracking-[-0.005em] text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-150 hover:-translate-y-px"
              >
                {isPrelaunch ? "Sign up free — lock in founding pricing" : "Sign up free"}
                <span className="translate-y-[0.5px] text-[1.1em] leading-none">→</span>
              </Link>
              <span className="text-[13.5px] text-fg-muted">
                No payment required to sign up. You only pay when you generate documents.
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-line-faint pt-8">
              {perks.map((perk) => (
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

        <PricingSection isPrelaunch={isPrelaunch} />

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line-faint pb-10 pt-6">
          <span className="text-[13px] text-fg-muted">© 2026 Milestoned</span>
          <div className="flex items-center gap-5">
            <Link href="/impressum" className="text-[13px] text-fg-muted">
              Impressum
            </Link>
            <Link href="/privacy" className="text-[13px] text-fg-muted">
              Privacy
            </Link>
            <Link href="/terms" className="text-[13px] text-fg-muted">
              Terms
            </Link>
            <span className="text-[13px] text-fg-muted">
              Built for people who ship client work.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PricingSection({ isPrelaunch }: { isPrelaunch: boolean }) {
  const small = CREDIT_PACKAGES.small;
  const large = CREDIT_PACKAGES.large;

  return (
    <section className="border-t border-line-faint py-16">
      <div className="mx-auto max-w-[720px] text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Pricing
        </span>
        <h2 className="mb-3 mt-2 font-display text-[1.7rem] font-semibold tracking-[-0.015em] text-fg-heading">
          Pay per document, not per month
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-[1.02rem] leading-[1.6] text-fg-secondary">
          There&apos;s no subscription. One credit generates one document, credits
          never expire, and you buy more only when you actually need them.
        </p>
      </div>

      <div className="mx-auto grid max-w-[720px] grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-[16px] border border-line-soft bg-white/[0.015] p-6">
          <div className="mb-1 text-sm font-medium text-fg-tertiary">10 credits</div>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold text-fg-heading">
              {formatPackagePrice(small.regularPriceCents)}
            </span>
            {isPrelaunch && (
              <span className="text-sm text-fg-muted">
                or {formatPackagePrice(small.foundingPriceCents)} as a founding member
              </span>
            )}
          </div>
          <div className="text-[13.5px] text-fg-tertiary">Standard rate, after launch</div>
        </div>
        <div className="rounded-[16px] border border-gold-soft bg-gold-soft p-6">
          <div className="mb-1 text-sm font-medium text-fg-tertiary">20 credits</div>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold text-fg-heading">
              {formatPackagePrice(large.regularPriceCents)}
            </span>
            {isPrelaunch && (
              <span className="text-sm text-fg-muted">
                or {formatPackagePrice(large.foundingPriceCents)} as a founding member
              </span>
            )}
          </div>
          <div className="text-[13.5px] text-fg-tertiary">Standard rate, after launch</div>
        </div>
      </div>

      {isPrelaunch && (
        <p className="mx-auto mt-8 max-w-[560px] text-center text-sm leading-[1.6] text-fg-tertiary">
          Sign up before launch and you&apos;re a founding member —{" "}
          {formatPackagePrice(small.foundingPriceCents)} for 10 credits and{" "}
          {formatPackagePrice(large.foundingPriceCents)} for 20, locked in for as long as you
          have an account. After launch, new signups pay the standard rate above.
        </p>
      )}
    </section>
  );
}
