"use client";

/*
 * Interactive hero mockup — the tabs actually switch content now, one mock
 * per document type, deliberately shaped like that type's real structure
 * (SOW's deliverables checklist, Proposal's investment summary, Invoice's
 * line-item ledger) rather than reusing the Contract's milestone ledger for
 * all four. Still purely presentational: no live data, no generation.
 */
import { useState } from "react";

type DocKey = "sow" | "contract" | "proposal" | "invoice";

const TABS: { key: DocKey; label: string }[] = [
  { key: "sow", label: "Scope of Work" },
  { key: "contract", label: "Contract" },
  { key: "proposal", label: "Proposal" },
  { key: "invoice", label: "Invoice" },
];

function InterestBadge() {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full bg-gold-soft px-[9px] py-[3px] text-[11px] font-semibold text-gold">
      0% interest
    </span>
  );
}

function SkeletonLines({ widths }: { widths: string[] }) {
  return (
    <div className="mb-[22px] flex flex-col gap-[7px]">
      {widths.map((w, i) => (
        <div key={i} className="h-1.5 rounded-[3px] bg-white/[0.06]" style={{ width: w }} />
      ))}
    </div>
  );
}

function CheckDot() {
  return (
    <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path
          d="M1.5 5.2L4 7.5L8.5 2.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function SignatureRow() {
  return (
    <div className="mt-5 flex gap-6">
      <div className="flex-1">
        <div className="mb-[7px] h-px bg-white/[0.14]" />
        <div className="text-[10.5px] text-fg-muted">Client signature</div>
      </div>
      <div className="flex-1">
        <div className="mb-[7px] h-px bg-white/[0.14]" />
        <div className="text-[10.5px] text-fg-muted">Consultant signature</div>
      </div>
    </div>
  );
}

const MILESTONES = [
  { label: "Discovery & scope", pct: "20%", amount: "$1,800", active: true },
  { label: "Design sign-off", pct: "25%", amount: "$2,250", active: false },
  { label: "Build & integration", pct: "35%", amount: "$3,150", active: false },
  { label: "Launch & handover", pct: "20%", amount: "$1,800", active: false },
];

function MilestoneSchedule() {
  return (
    <div className="rounded-[11px] border border-line-soft bg-white/[0.015] p-4 pb-1.5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold tracking-[0.005em] text-[#cfd6dd]">
          Payment schedule
        </span>
        <InterestBadge />
      </div>

      <div className="relative">
        <div className="absolute bottom-[26px] left-[5.5px] top-2 w-[1.5px] bg-white/[0.09]" />
        {MILESTONES.map((m) => (
          <div key={m.label} className="relative flex items-start gap-3.5 pb-[15px]">
            <span
              className={`relative z-[1] mt-px h-3 w-3 shrink-0 rounded-full border-2 border-panel ${
                m.active ? "bg-gold shadow-[0_0_0_1.5px_rgba(212,176,106,0.14)]" : "bg-[#2a323d]"
              }`}
            />
            <div className="flex flex-1 items-baseline justify-between gap-2.5">
              <span className="text-[13px] font-[450] text-fg-label">{m.label}</span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="text-xs text-[#7d8590]">{m.pct}</span>
                <span className="font-display text-[13px] font-semibold text-fg">{m.amount}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="ml-[26px] flex items-center justify-between border-t border-line-soft pb-2.5 pt-3">
        <span className="text-[12.5px] font-medium text-fg-secondary">Project total</span>
        <span className="font-display text-[15px] font-bold text-gold">$9,000</span>
      </div>
    </div>
  );
}

const DELIVERABLES = [
  "Homepage & 4 interior page templates",
  "CMS-driven blog with 3 content types",
  "Analytics + SEO baseline configured",
  "1 round of revisions after handover",
];

function DeliverablesChecklist() {
  return (
    <div className="rounded-[11px] border border-line-soft bg-white/[0.015] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold tracking-[0.005em] text-[#cfd6dd]">
          Deliverables & acceptance
        </span>
        <span className="text-[11px] text-fg-muted">4 items</span>
      </div>
      <div className="flex flex-col gap-[11px]">
        {DELIVERABLES.map((d) => (
          <div key={d} className="flex items-center gap-2.5">
            <CheckDot />
            <span className="text-[12.5px] leading-[1.4] text-fg-label">{d}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
        <span className="text-[12.5px] font-medium text-fg-secondary">Timeline</span>
        <span className="text-[12.5px] font-semibold text-fg">6 weeks · 4 milestones</span>
      </div>
    </div>
  );
}

function InvestmentSummary() {
  return (
    <div className="rounded-[11px] border border-line-soft bg-white/[0.015] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold tracking-[0.005em] text-[#cfd6dd]">
          Investment summary
        </span>
        <InterestBadge />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] text-fg-secondary">Total project investment</span>
        <span className="font-display text-lg font-bold text-gold">$9,000</span>
      </div>
      <div className="mt-1.5 text-[11.5px] text-fg-muted">
        Optional add-ons priced separately
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-line-soft pt-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-fg-muted">Proposal valid until</span>
          <span className="font-medium text-fg-label">Aug 20, 2026</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-fg-muted">Payment terms</span>
          <span className="font-medium text-fg-label">Milestone-based, interest-free</span>
        </div>
      </div>
    </div>
  );
}

const LINE_ITEMS = [
  { label: "Design sign-off", sub: "Milestone 2 of 4", amount: "$2,250" },
];

function InvoiceLedger() {
  return (
    <div className="rounded-[11px] border border-line-soft bg-white/[0.015] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold tracking-[0.005em] text-[#cfd6dd]">
          Charges
        </span>
        <InterestBadge />
      </div>
      <div className="flex flex-col gap-3 border-b border-line-soft pb-3">
        {LINE_ITEMS.map((item) => (
          <div key={item.label} className="flex items-start justify-between">
            <div>
              <div className="text-[13px] font-[450] text-fg-label">{item.label}</div>
              <div className="text-[11px] text-fg-muted">{item.sub}</div>
            </div>
            <span className="font-display text-[13px] font-semibold text-fg">{item.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[12px] text-fg-muted">
          <span>Subtotal</span>
          <span>$2,250</span>
        </div>
        <div className="flex items-center justify-between text-[12px] text-fg-muted">
          <span>Tax (19%)</span>
          <span>$428</span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-line-soft pt-2">
          <span className="text-[12.5px] font-medium text-fg-secondary">Total due</span>
          <span className="font-display text-[15px] font-bold text-gold">$2,678</span>
        </div>
      </div>
    </div>
  );
}

const DOC_META: Record<
  DocKey,
  { kicker: string; title: string; scopeSkeleton: string[] }
> = {
  sow: {
    kicker: "Scope of Work · v1",
    title: "Website Redesign — SOW",
    scopeSkeleton: ["w-full", "w-[88%]", "w-[64%]"],
  },
  contract: {
    kicker: "Contract · v1",
    title: "Web Development Agreement",
    scopeSkeleton: ["w-full", "w-[92%]", "w-[70%]"],
  },
  proposal: {
    kicker: "Proposal · v1",
    title: "Website Redesign — Proposal",
    scopeSkeleton: ["w-full", "w-[80%]", "w-[55%]"],
  },
  invoice: {
    kicker: "Invoice · DDL-INV-2026-014",
    title: "Website Redesign — Invoice",
    scopeSkeleton: ["w-full", "w-[60%]"],
  },
};

export function DocPreviewCard() {
  const [active, setActive] = useState<DocKey>("contract");
  const meta = DOC_META[active];

  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-line-soft bg-panel shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
      <div className="flex gap-0.5 border-b border-line-faint bg-white/[0.015] px-2.5 pt-2.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`flex-1 cursor-pointer whitespace-nowrap rounded-t-[7px] border-b-2 bg-transparent px-1 py-[9px] text-center text-[11.5px] font-medium tracking-[0.01em] transition-colors ${
              active === tab.key
                ? "border-gold bg-panel text-[#eef1f4]"
                : "border-transparent text-fg-muted hover:text-fg-soft"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-[26px] pb-6 pt-[26px]">
        <div className="mb-[18px] flex items-center justify-between">
          <div>
            <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.12em] text-fg-muted">
              {meta.kicker}
            </div>
            <div className="font-display text-[17px] font-semibold tracking-[-0.01em] text-[#eef1f4]">
              {meta.title}
            </div>
          </div>
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-line-input text-[11px] text-fg-muted">
            PDF
          </div>
        </div>

        <SkeletonLines widths={meta.scopeSkeleton} />

        {active === "sow" && <DeliverablesChecklist />}
        {active === "contract" && <MilestoneSchedule />}
        {active === "proposal" && <InvestmentSummary />}
        {active === "invoice" && <InvoiceLedger />}

        {(active === "sow" || active === "contract") && <SignatureRow />}
      </div>
    </div>
  );
}
