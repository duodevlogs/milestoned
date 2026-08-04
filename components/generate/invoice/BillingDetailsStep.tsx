import type { InvoiceCurrency } from "@/lib/invoice-generation";

const CURRENCIES: InvoiceCurrency[] = ["USD", "EUR", "GBP"];

export function BillingDetailsStep({
  invoiceDate,
  dueDate,
  paymentTermsLabel,
  poNumber,
  currency,
  taxRatePct,
  onInvoiceDate,
  onDueDate,
  onPaymentTermsLabel,
  onPoNumber,
  onCurrency,
  onTaxRatePct,
}: {
  invoiceDate: string;
  dueDate: string;
  paymentTermsLabel: string;
  poNumber: string;
  currency: InvoiceCurrency;
  taxRatePct: string;
  onInvoiceDate: (value: string) => void;
  onDueDate: (value: string) => void;
  onPaymentTermsLabel: (value: string) => void;
  onPoNumber: (value: string) => void;
  onCurrency: (value: InvoiceCurrency) => void;
  onTaxRatePct: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3.5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Invoice date</span>
          <input
            className="ms-field [color-scheme:dark]"
            type="date"
            value={invoiceDate}
            onChange={(e) => onInvoiceDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Due date (optional)
          </span>
          <input
            className="ms-field [color-scheme:dark]"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDate(e.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Payment terms</span>
        <input
          className="ms-field"
          type="text"
          placeholder="e.g. Net 14"
          value={paymentTermsLabel}
          onChange={(e) => onPaymentTermsLabel(e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-3.5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Currency</span>
          <select
            className="ms-field cursor-pointer"
            value={currency}
            onChange={(e) => onCurrency(e.target.value as InvoiceCurrency)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Tax / VAT rate</span>
          <div className="relative">
            <input
              className="ms-field ms-num pr-[26px]"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRatePct}
              onChange={(e) => onTaxRatePct(e.target.value)}
            />
            <span className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[13px] text-fg-tertiary">
              %
            </span>
          </div>
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          PO number (optional)
        </span>
        <input
          className="ms-field"
          type="text"
          placeholder="If your client's company requires one"
          value={poNumber}
          onChange={(e) => onPoNumber(e.target.value)}
        />
      </label>
    </div>
  );
}
