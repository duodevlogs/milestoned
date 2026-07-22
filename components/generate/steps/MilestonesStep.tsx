import type { MilestoneInput } from "@/lib/stores/generate-form.store";

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

export function MilestonesStep({
  milestones,
  startDate,
  deliveryDate,
  onLabel,
  onPct,
  onAdd,
  onRemove,
  onStartDate,
  onDeliveryDate,
}: {
  milestones: MilestoneInput[];
  startDate: string;
  deliveryDate: string;
  onLabel: (index: number, value: string) => void;
  onPct: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onStartDate: (value: string) => void;
  onDeliveryDate: (value: string) => void;
}) {
  const totalPct = milestones.reduce((sum, m) => sum + (Number(m.pct) || 0), 0);
  const totalOk = totalPct === 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-fg-label">Payment milestones</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-[3px] text-xs font-semibold text-gold">
            0% interest, always
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
                onChange={(e) => onLabel(i, e.target.value)}
              />
              <div className="relative w-[78px] shrink-0">
                <input
                  className="ms-field ms-num py-[9px] pl-3 pr-[22px] text-right"
                  type="number"
                  min="0"
                  max="100"
                  value={m.pct}
                  onChange={(e) => onPct(i, e.target.value)}
                />
                <span className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[13px] text-fg-tertiary">
                  %
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
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
            onClick={onAdd}
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
      </div>

      <div className="grid grid-cols-2 gap-3.5 border-t border-line-faint pt-2">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Start date</span>
          <input
            className="ms-field [color-scheme:dark]"
            type="date"
            value={startDate}
            onChange={(e) => onStartDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Target delivery</span>
          <input
            className="ms-field [color-scheme:dark]"
            type="date"
            value={deliveryDate}
            onChange={(e) => onDeliveryDate(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
