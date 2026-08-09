import type { SowDeliverableInput } from "@/lib/stores/sow-form.store";

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

export function DeliverablesStep({
  deliverables,
  clientResponsibilities,
  assumptions,
  onDeliverableItem,
  onDeliverableCriteria,
  onAddDeliverable,
  onRemoveDeliverable,
  onClientResponsibilities,
  onAssumptions,
}: {
  deliverables: SowDeliverableInput[];
  clientResponsibilities: string;
  assumptions: string;
  onDeliverableItem: (index: number, value: string) => void;
  onDeliverableCriteria: (index: number, value: string) => void;
  onAddDeliverable: () => void;
  onRemoveDeliverable: (index: number) => void;
  onClientResponsibilities: (value: string) => void;
  onAssumptions: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-fg-label">
            Deliverables &amp; acceptance criteria
          </span>
        </div>
        <div className="flex flex-col gap-[9px]">
          {deliverables.map((d, i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-[10px] border border-line-input p-3">
              <div className="flex items-center gap-[9px]">
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gold-soft font-display text-[11px] font-semibold text-gold">
                  {i + 1}
                </span>
                <input
                  className="ms-field flex-1 px-3 py-[9px]"
                  type="text"
                  placeholder="Deliverable — e.g. New homepage"
                  value={d.item}
                  onChange={(e) => onDeliverableItem(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => onRemoveDeliverable(i)}
                  disabled={deliverables.length <= 1}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line-input text-fg-muted transition-colors hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RemoveIcon />
                </button>
              </div>
              <input
                className="ms-field ml-[31px] px-3 py-[9px] text-[13px]"
                type="text"
                placeholder="Acceptance criteria — how this is judged done"
                value={d.acceptanceCriteria}
                onChange={(e) => onDeliverableCriteria(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddDeliverable}
          className="mt-3 inline-flex cursor-pointer items-center gap-[7px] border-none bg-transparent p-0 text-[13.5px] font-medium text-gold"
        >
          <PlusIcon />
          Add deliverable
        </button>
      </div>

      <label className="block border-t border-line-faint pt-5">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Client responsibilities (optional)
        </span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="What the client must provide and by when."
          value={clientResponsibilities}
          onChange={(e) => onClientResponsibilities(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Assumptions (optional)
        </span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="Technical/practical conditions the estimate depends on."
          value={assumptions}
          onChange={(e) => onAssumptions(e.target.value)}
        />
      </label>
    </div>
  );
}
