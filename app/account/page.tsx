import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { billingService } from "@/server/services/billing.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { updateEmail, updatePassword, updateBranding, updateBusinessDetails } from "./actions";
import { formatPackagePrice } from "@/lib/credit-packages";

export default async function AccountPage({
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
  const updated = typeof params.updated === "string" ? params.updated : null;
  const error = typeof params.error === "string" ? params.error : null;

  const [profile, purchases] = await Promise.all([
    userService.getProfile(user.id),
    billingService.listPurchases(user.id),
  ]);

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
          Account settings
        </span>
      </header>

      <main className="mx-auto max-w-[560px] px-6 py-14">
        {updated === "email" && (
          <Banner tone="ok">
            Check your new inbox for a confirmation link — your email won&apos;t change until you
            click it.
          </Banner>
        )}
        {updated === "password" && <Banner tone="ok">Your password has been updated.</Banner>}
        {updated === "branding" && <Banner tone="ok">Your branding has been updated.</Banner>}
        {updated === "business-details" && (
          <Banner tone="ok">Your business details have been updated.</Banner>
        )}
        {error && <Banner tone="warn">{error}</Banner>}

        <Section title="Email" description="Changing your email requires confirming the new address.">
          <form action={updateEmail} className="flex flex-col gap-3">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">
                Current: {user.email}
              </span>
              <input
                className="ms-field"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="new@address.dev"
              />
            </label>
            <button type="submit" className="inline-flex cursor-pointer items-center gap-2 self-start rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft">
              Update email
            </button>
          </form>
        </Section>

        <Section title="Password" description="Choose a new password for your account.">
          <form action={updatePassword} className="flex flex-col gap-3">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">
                New password
              </span>
              <input
                className="ms-field"
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </label>
            <button type="submit" className="inline-flex cursor-pointer items-center gap-2 self-start rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft">
              Update password
            </button>
          </form>
        </Section>

        <Section
          title="Branding"
          description="Shown on your generated documents instead of Milestoned's — your document, your business."
        >
          <form action={updateBranding} className="flex flex-col gap-4">
            {profile?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logoUrl}
                alt="Current logo"
                className="h-12 w-auto rounded-[8px] border border-line-soft bg-white/[0.02] object-contain p-1.5"
              />
            )}
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">
                Business name
              </span>
              <input
                className="ms-field"
                type="text"
                name="businessName"
                maxLength={80}
                defaultValue={profile?.businessName ?? ""}
                placeholder="e.g. Northwind Consulting"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Logo</span>
              <input
                className="ms-field cursor-pointer"
                type="file"
                name="logo"
                accept="image/png,image/jpeg"
              />
              <span className="mt-1.5 block text-[12px] text-fg-muted">PNG or JPG, up to 2MB.</span>
            </label>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 self-start rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft"
            >
              Save branding
            </button>
          </form>
        </Section>

        <Section
          title="Business details"
          description="Your own billing details — shown verbatim on generated invoices."
        >
          <form action={updateBusinessDetails} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">
                Business address
              </span>
              <textarea
                className="ms-field"
                name="businessAddress"
                rows={2}
                maxLength={300}
                defaultValue={profile?.businessAddress ?? ""}
                placeholder="e.g. 123 Market St, Bamberg, Germany"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-fg-label">
                  Tax / VAT ID
                </span>
                <input
                  className="ms-field"
                  type="text"
                  name="taxId"
                  maxLength={60}
                  defaultValue={profile?.taxId ?? ""}
                  placeholder="e.g. DE123456789"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-fg-label">
                  Company registration no.
                </span>
                <input
                  className="ms-field"
                  type="text"
                  name="companyRegistration"
                  maxLength={60}
                  defaultValue={profile?.companyRegistration ?? ""}
                  placeholder="e.g. HRB 12345"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">
                Payment instructions
              </span>
              <textarea
                className="ms-field"
                name="paymentInstructions"
                rows={3}
                maxLength={500}
                defaultValue={profile?.paymentInstructions ?? ""}
                placeholder="e.g. Bank transfer — IBAN DE00 0000 0000 0000 00, BIC XXXXXX. Or a Stripe/PayPal link."
              />
              <span className="mt-1.5 block text-[12px] text-fg-muted">
                Shown exactly as written — free text, since payment details vary by country and method.
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 self-start rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft"
            >
              Save business details
            </button>
          </form>
        </Section>

        <Section title="Billing history" description="Every credit top-up you've purchased.">
          {purchases.length === 0 ? (
            <div className="rounded-[10px] border border-line-soft bg-white/[0.015] px-4 py-6 text-center text-sm text-fg-muted">
              No purchases yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-line-soft">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between border-b border-line-faint bg-white/[0.008] px-4 py-3 last:border-b-0"
                >
                  <div>
                    <div className="text-sm font-medium text-fg-bright">
                      {purchase.creditsPurchased} credits
                    </div>
                    <div className="text-[12.5px] text-fg-muted">
                      {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <span className="font-display text-sm font-semibold text-fg-heading">
                    {formatPackagePrice(purchase.amountCents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}

function Banner({ tone, children }: { tone: "ok" | "warn"; children: React.ReactNode }) {
  return (
    <div
      className={`mb-8 rounded-[11px] border px-4 py-3.5 text-sm leading-[1.5] ${
        tone === "ok"
          ? "border-gold-border bg-gold-soft text-fg-label"
          : "border-line-strong bg-white/[0.02] text-fg-soft"
      }`}
    >
      {children}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 border-b border-line-faint pb-10 last:border-b-0 last:pb-0">
      <h2 className="mb-1 font-display text-lg font-semibold tracking-[-0.01em] text-fg-heading">
        {title}
      </h2>
      <p className="mb-5 text-[13.5px] text-fg-tertiary">{description}</p>
      {children}
    </div>
  );
}
