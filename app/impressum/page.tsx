import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/LogoMark";

export const metadata: Metadata = { title: "Impressum — Milestoned" };

export default function ImpressumPage() {
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
          Impressum
        </h1>
        <p className="mb-10 text-sm text-fg-muted">Legal notice per § 5 DDG (Germany)</p>

        <Section title="Operator">
          <p>
            Ishraq Haider Chowdhury
            <br />
            trading as Duo Dev Logs
            <br />
            Gereuthstr 28
            <br />
            96050 Bamberg, Germany
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Phone: +49 177 2989934
            <br />
            Email: collab@duodevlogs.com
          </p>
        </Section>

        <Section title="VAT">
          <p>VAT ID (Umsatzsteuer-IdNr.) per § 27a UStG: DE405997965</p>
        </Section>

        <Section title="Responsible for this site's content">
          <p>Ishraq Haider Chowdhury, address as above.</p>
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
