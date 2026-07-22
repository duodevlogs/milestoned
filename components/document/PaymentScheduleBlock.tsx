import { formatCurrency, type MilestoneAmount } from "@/lib/document-generation";

export function PaymentScheduleBlock({
  number,
  milestones,
  budget,
}: {
  number: number;
  milestones: MilestoneAmount[];
  budget: number;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-xs font-semibold uppercase tracking-[0.04em] text-[#14151a]">
          {number} · Payment schedule
        </div>
        <span className="rounded-full bg-paper-badge px-2.5 py-[3px] text-[10.5px] font-semibold text-paper-badge-text">
          0% interest
        </span>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-paper-border">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-paper-row bg-paper px-[15px] py-[11px]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-badge font-display text-[10px] font-semibold text-paper-badge-text">
                {i + 1}
              </span>
              <span className="truncate text-[13px] text-[#2b2d34]">
                {m.label || `Milestone ${i + 1}`}
              </span>
            </span>
            <span className="flex flex-shrink-0 items-baseline gap-2.5">
              <span className="text-[11.5px] text-paper-muted">{m.pct}%</span>
              <span className="min-w-[64px] text-right font-display text-[13px] font-semibold text-[#14151a]">
                {formatCurrency(m.amount)}
              </span>
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between bg-paper-total px-[15px] py-3">
          <span className="text-[12.5px] font-semibold text-[#2b2d34]">Total project value</span>
          <span className="font-display text-[15px] font-bold text-paper-badge-text">
            {formatCurrency(budget)}
          </span>
        </div>
      </div>
    </div>
  );
}
