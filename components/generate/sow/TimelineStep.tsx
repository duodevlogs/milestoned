import type { SowMilestoneInput } from "@/lib/stores/sow-form.store";

function RemoveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M2.5 3.5h8M5 3V2h3v1M4 3.5l0.5 7h4l0.5-7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TimelineStep({
  budget,
  milestones,
  onBudget,
  onMilestoneLabel,
  onMilestonePct,
  onMilestoneTargetDate,
  onAddMilestone,
  onRemoveMilestone,
}: {
  budget: string;
  milestones: SowMilestoneInput[];
  onBudget: (value: string) => void;
  onMilestoneLabel: (index: number, value: string) => void;
  onMilestonePct: (index: number, value: string) => void;
  onMilestoneTargetDate: (index: number, value: string) => void;
  onAddMilestone: () => void;
  onRemoveMilestone: (index: number) => void;
}) {
  const totalPct = milestones.reduce((sum, m) => sum + (Number(m.pct) || 0), 0);
  const totalOk = totalPct === 100;

  return (
    <div className="flex flex-col gap-6">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Total project value
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-fg-tertiary">
            $
          </span>
          <input
            className="ms-field ms-num pl-6"
            type="number"
            min="0"
            placeholder="9000"
            value={budget}
            onChange={(e) => onBudget(e.target.value)}
          />
        </div>
      </label>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-fg-label">
            Timeline &amp; payment milestones
          </span>
        </div>
        <div className="flex flex-col gap-[9px]">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-[9px]">
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gold-soft font-display text-[11px] font-semibold text-gold">
                {i + 1}
              </span>
              <input
                className="ms-field flex-1 px-3 py-[9px]"
                type="text"
                placeholder="Milestone name"
                value={m.label}
                onChange={(e) => onMilestoneLabel(i, e.target.value)}
              />
              <input
                className="ms-field w-[140px] shrink-0 py-[9px] [color-scheme:dark]"
                type="date"
                value={m.targetDate}
                onChange={(e) => onMilestoneTargetDate(i, e.target.value)}
              />
              <div className="relative w-[78px] shrink-0">
                <input
                  className="ms-field ms-num py-[9px] pl-3 pr-[22px] text-right"
                  type="number"
                  min="0"
                  max="100"
                  value={m.pct}
                  onChange={(e) => onMilestonePct(i, e.target.value)}
                />
                <span className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[13px] text-fg-tertiary">
                  %
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveMilestone(i)}
                disabled={milestones.length <= 1}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line-input text-fg-muted transition-colors hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RemoveIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onAddMilestone}
            className="inline-flex cursor-pointer items-center gap-[7px] border-none bg-transparent p-0 text-[13.5px] font-medium text-gold"
          >
            <PlusIcon />
            Add milestone
          </button>
          <span
            className={`text-[13px] font-medium ${totalOk ? "text-status-signed" : "text-[#d0a24a]"}`}
          >
            Total: {totalPct}%
          </span>
        </div>
        <span className="mt-2 block text-[12px] text-fg-muted">
          Target dates are optional, but power the Timeline &amp; Milestones table — the same list
          also becomes the Payment Schedule table.
        </span>
      </div>
    </div>
  );
}
