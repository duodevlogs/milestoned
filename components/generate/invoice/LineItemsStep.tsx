import { computeInvoiceTotals, formatInvoiceAmount, type InvoiceCurrency } from "@/lib/invoice-generation";
import type { InvoiceLineItemInput } from "@/lib/stores/invoice-form.store";

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

export function LineItemsStep({
  lineItems,
  currency,
  taxRatePct,
  milestoneCurrent,
  milestoneTotal,
  thankYouNote,
  onDescription,
  onAmount,
  onAdd,
  onRemove,
  onMilestoneCurrent,
  onMilestoneTotal,
  onThankYouNote,
}: {
  lineItems: InvoiceLineItemInput[];
  currency: InvoiceCurrency;
  taxRatePct: string;
  milestoneCurrent: string;
  milestoneTotal: string;
  thankYouNote: string;
  onDescription: (index: number, value: string) => void;
  onAmount: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMilestoneCurrent: (value: string) => void;
  onMilestoneTotal: (value: string) => void;
  onThankYouNote: (value: string) => void;
}) {
  const parsedItems = lineItems.map((item) => ({ amount: Number(item.amount) || 0 }));
  const { subtotal, taxAmount, total } = computeInvoiceTotals(parsedItems, Number(taxRatePct) || 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-fg-label">Line items</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-[3px] text-xs font-semibold text-gold">
            0% interest, always
          </span>
        </div>

        <div className="flex flex-col gap-[9px]">
          {lineItems.map((item, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-[9px]">
                <input
                  className="ms-field flex-1 px-3 py-[9px]"
                  type="text"
                  placeholder="Description — e.g. Milestone 2 — Design approval"
                  value={item.description}
                  onChange={(e) => onDescription(i, e.target.value)}
                />
                <div className="relative w-[110px] shrink-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-fg-tertiary">
                    {currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"}
                  </span>
                  <input
                    className="ms-field ms-num py-[9px] pl-6 pr-3 text-right"
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={(e) => onAmount(i, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  disabled={lineItems.length <= 1}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line-input text-fg-muted transition-colors hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RemoveIcon />
                </button>
              </div>
              {item.milestoneLabel && (
                <span className="pl-1 text-[11.5px] text-fg-muted">{item.milestoneLabel}</span>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex cursor-pointer items-center gap-[7px] border-none bg-transparent p-0 text-[13.5px] font-medium text-gold"
        >
          <PlusIcon />
          Add line item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 border-t border-line-faint pt-5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            This milestone # (optional)
          </span>
          <input
            className="ms-field ms-num"
            type="number"
            min="1"
            placeholder="e.g. 2"
            value={milestoneCurrent}
            onChange={(e) => onMilestoneCurrent(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Of total</span>
          <input
            className="ms-field ms-num"
            type="number"
            min="1"
            placeholder="e.g. 4"
            value={milestoneTotal}
            onChange={(e) => onMilestoneTotal(e.target.value)}
          />
        </label>
      </div>
      <span className="-mt-3 text-[12px] text-fg-muted">
        Shown on the invoice as &ldquo;Milestone {milestoneCurrent || "X"} of{" "}
        {milestoneTotal || "Y"}&rdquo; so the client sees progress against the whole engagement.
      </span>

      <label className="block border-t border-line-faint pt-5">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Thank-you note (optional)
        </span>
        <input
          className="ms-field"
          type="text"
          placeholder="e.g. Thanks for the continued work together."
          value={thankYouNote}
          onChange={(e) => onThankYouNote(e.target.value)}
        />
      </label>

      <div className="rounded-[10px] border border-line-soft bg-white/[0.015] px-4 py-3.5">
        <div className="flex items-center justify-between text-[13px] text-fg-tertiary">
          <span>Subtotal</span>
          <span>{formatInvoiceAmount(subtotal, currency)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[13px] text-fg-tertiary">
          <span>Tax ({taxRatePct || 0}%)</span>
          <span>{formatInvoiceAmount(taxAmount, currency)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line-faint pt-2 text-sm font-semibold text-fg-bright">
          <span>Total due</span>
          <span>{formatInvoiceAmount(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
