import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import {
  CREDIT_PACKAGES,
  priceCentsFor,
  formatPackagePrice,
  type CreditPackage,
} from "@/lib/credit-packages";

export default async function TopUpPage() {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const profile = await userService.getProfile(user.id);
  const creditsLeft = profile?.creditsRemaining ?? 0;
  const isFoundingMember = profile?.isFoundingMember ?? false;

  return (
    <div className="min-h-screen bg-navy text-fg">
      <header className="flex items-center gap-4 border-b border-line-faint px-8 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[13.5px] text-fg-tertiary">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M9.5 3L5 7.5L9.5 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Documents
        </Link>
        <span className="h-[18px] w-px bg-line-input" />
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
          Top up credits
        </span>
      </header>

      <main className="mx-auto max-w-[640px] px-6 py-14">
        <div className="mb-10 text-center">
          <div className="mb-2 text-[13px] text-fg-tertiary">
            You have <span className="font-semibold text-gold">{creditsLeft}</span> generation
            credit{creditsLeft === 1 ? "" : "s"} left
          </div>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.015em] text-fg-heading">
            Buy more credits
          </h1>
          <p className="mx-auto mt-2 max-w-[440px] text-sm text-fg-tertiary">
            Each document you generate uses one credit. Top up whenever you&apos;re running low — no
            subscription, no expiry.
          </p>
          {isFoundingMember && (
            <span className="mt-4 inline-flex items-center rounded-full bg-gold-soft px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-gold">
              Founding member pricing applied
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PackageCard pkg={CREDIT_PACKAGES.small} isFoundingMember={isFoundingMember} />
          <PackageCard pkg={CREDIT_PACKAGES.large} isFoundingMember={isFoundingMember} featured />
        </div>
      </main>
    </div>
  );
}

function PackageCard({
  pkg,
  isFoundingMember,
  featured = false,
}: {
  pkg: CreditPackage;
  isFoundingMember: boolean;
  featured?: boolean;
}) {
  const priceCents = priceCentsFor(pkg, isFoundingMember);

  return (
    <div
      className={`flex flex-col rounded-[16px] border p-6 ${
        featured ? "border-gold-soft bg-gold-soft" : "border-line-soft bg-white/[0.015]"
      }`}
    >
      {featured && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-gold-soft px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-gold">
          Best value
        </span>
      )}
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-fg-heading">
          {formatPackagePrice(priceCents)}
        </span>
        {isFoundingMember && (
          <span className="text-sm text-fg-muted line-through">
            {formatPackagePrice(pkg.regularPriceCents)}
          </span>
        )}
      </div>
      <div className="mb-6 text-sm text-fg-tertiary">{pkg.credits} generation credits</div>
      <form action="/api/checkout/top-up" method="POST" className="mt-auto">
        <input type="hidden" name="package" value={pkg.id} />
        <button
          type="submit"
          className={`w-full cursor-pointer rounded-[10px] px-5 py-3 font-display text-sm font-semibold transition-transform hover:-translate-y-px ${
            featured
              ? "bg-gold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]"
              : "border border-line-strong bg-transparent text-fg-bright"
          }`}
        >
          Buy {pkg.credits} credits
        </button>
      </form>
    </div>
  );
}
