/*
 * Static document mock from the Landing design — tabs, skeleton lines,
 * milestone payment schedule, signature lines. Purely presentational.
 */
const TABS = [
  { label: "Scope of Work", active: false },
  { label: "Contract", active: true },
  { label: "Proposal", active: false },
  { label: "Invoice", active: false },
];

const MILESTONES = [
  { label: "Discovery & scope", pct: "20%", amount: "$1,800", active: true },
  { label: "Design sign-off", pct: "25%", amount: "$2,250", active: false },
  { label: "Build & integration", pct: "35%", amount: "$3,150", active: false },
  { label: "Launch & handover", pct: "20%", amount: "$1,800", active: false },
];

export function DocPreviewCard() {
  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-line-soft bg-panel shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
      <div className="flex gap-0.5 border-b border-line-faint bg-white/[0.015] px-2.5 pt-2.5">
        {TABS.map((tab) => (
          <div
            key={tab.label}
            className={`flex-1 whitespace-nowrap rounded-t-[7px] border-b-2 px-1 py-[9px] text-center text-[11.5px] font-medium tracking-[0.01em] ${
              tab.active
                ? "border-gold bg-panel text-[#eef1f4]"
                : "border-transparent bg-transparent text-fg-muted"
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="px-[26px] pb-6 pt-[26px]">
        <div className="mb-[18px] flex items-center justify-between">
          <div>
            <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.12em] text-fg-muted">
              Contract · v1
            </div>
            <div className="font-display text-[17px] font-semibold tracking-[-0.01em] text-[#eef1f4]">
              Web Development Agreement
            </div>
          </div>
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-line-input text-[11px] text-fg-muted">
            PDF
          </div>
        </div>

        <div className="mb-[22px] flex flex-col gap-[7px]">
          <div className="h-1.5 w-full rounded-[3px] bg-white/[0.06]" />
          <div className="h-1.5 w-[92%] rounded-[3px] bg-white/[0.06]" />
          <div className="h-1.5 w-[70%] rounded-[3px] bg-white/[0.06]" />
        </div>

        <div className="rounded-[11px] border border-line-soft bg-white/[0.015] p-4 pb-1.5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[12.5px] font-semibold tracking-[0.005em] text-[#cfd6dd]">
              Payment schedule
            </span>
            <span className="inline-flex items-center gap-[5px] rounded-full bg-gold-soft px-[9px] py-[3px] text-[11px] font-semibold text-gold">
              0% interest
            </span>
          </div>

          <div className="relative">
            <div className="absolute bottom-[26px] left-[5.5px] top-2 w-[1.5px] bg-white/[0.09]" />
            {MILESTONES.map((m) => (
              <div
                key={m.label}
                className="relative flex items-start gap-3.5 pb-[15px]"
              >
                <span
                  className={`relative z-[1] mt-px h-3 w-3 shrink-0 rounded-full border-2 border-panel ${
                    m.active
                      ? "bg-gold shadow-[0_0_0_1.5px_rgba(212,176,106,0.14)]"
                      : "bg-[#2a323d]"
                  }`}
                />
                <div className="flex flex-1 items-baseline justify-between gap-2.5">
                  <span className="text-[13px] font-[450] text-fg-label">
                    {m.label}
                  </span>
                  <span className="flex items-baseline gap-2 whitespace-nowrap">
                    <span className="text-xs text-[#7d8590]">{m.pct}</span>
                    <span className="font-display text-[13px] font-semibold text-fg">
                      {m.amount}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="ml-[26px] flex items-center justify-between border-t border-line-soft pb-2.5 pt-3">
            <span className="text-[12.5px] font-medium text-fg-secondary">
              Project total
            </span>
            <span className="font-display text-[15px] font-bold text-gold">
              $9,000
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-6">
          <div className="flex-1">
            <div className="mb-[7px] h-px bg-white/[0.14]" />
            <div className="text-[10.5px] text-fg-muted">Client signature</div>
          </div>
          <div className="flex-1">
            <div className="mb-[7px] h-px bg-white/[0.14]" />
            <div className="text-[10.5px] text-fg-muted">
              Consultant signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
