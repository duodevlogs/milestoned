import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/LogoMark";

export const metadata: Metadata = { title: "Privacy Policy — Milestoned" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy text-fg">
      <div className="mx-auto max-w-[720px] px-6 py-14">
        <Link href="/" className="mb-10 flex items-center gap-[11px]">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-bright">
            Milestoned
          </span>
        </Link>

        <h1 className="mb-2 font-display text-3xl font-semibold tracking-[-0.02em] text-fg-heading">
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm text-fg-muted">Last updated: July 2026</p>

        <div className="mb-8 rounded-[10px] border border-gold-border bg-gold-soft px-4 py-3.5 text-sm leading-[1.6] text-fg-label">
          This is a plain-language starting point, not a substitute for legal advice. Before
          launch, have it reviewed by a lawyer for your jurisdiction — Milestoned is operated
          out of the EU, so GDPR requirements apply.
        </div>

        <Section title="What we collect">
          <p>
            When you sign up, we collect your email address and password (stored securely by
            our authentication provider, Supabase — we never see your password in plain text).
            When you use the product, we store the client documents you generate (client names,
            project details, budgets, and the document content itself) so you can access them
            later.
          </p>
        </Section>

        <Section title="Payments">
          <p>
            Payments are processed by Stripe. We never see or store your card details —
            Stripe handles that directly, and we only receive confirmation that a payment
            succeeded and how many credits it purchased.
          </p>
        </Section>

        <Section title="How we use your data">
          <p>
            Your data is used solely to operate Milestoned: generating your documents,
            managing your account and credits, and emailing you about your account (password
            resets, receipts, and — if you sign up before launch — a notice when the product
            opens up). We don&apos;t sell your data, and we don&apos;t use your document
            content to train any model.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use a single session cookie to keep you signed in. No advertising or
            cross-site tracking cookies are set.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can request a copy of your data, ask us to correct it, or ask us to delete
            your account and everything tied to it at any time by emailing us below. If
            you&apos;re in the EU, this includes the rights guaranteed to you under GDPR.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or your data:{" "}
            <span className="text-fg-label">collab@duodevlogs.com</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-2.5 font-display text-lg font-semibold tracking-[-0.01em] text-fg-heading">
        {title}
      </h2>
      <div className="text-[14.5px] leading-[1.65] text-fg-secondary">{children}</div>
    </div>
  );
}
