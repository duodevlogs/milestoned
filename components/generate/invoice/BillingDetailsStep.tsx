import Link from "next/link";
import { OptionalField } from "./OptionalField";
import type { InvoiceCurrency } from "@/lib/invoice-generation";
import type { OptionalKey } from "@/lib/stores/invoice-form.store";

const CURRENCIES: InvoiceCurrency[] = ["USD", "EUR", "GBP"];

type BillingField =
  | "invoiceDate"
  | "dueDate"
  | "paymentTermsLabel"
  | "poNumber"
  | "taxRatePct"
  | "taxNote"
  | "lateFeeNote"
  | "serviceDate"
  | "clientTaxId"
  | "customPaymentDetails";

export function BillingDetailsStep({
  values,
  currency,
  enabled,
  paymentMethods,
  selectedPaymentIds,
  onField,
  onCurrency,
  onToggle,
  onTogglePaymentMethod,
}: {
  values: Record<BillingField, string>;
  currency: InvoiceCurrency;
  enabled: Record<OptionalKey, boolean>;
  /** The account's saved payment methods, as printed. */
  paymentMethods: { id: string; title: string; lines: string[] }[];
  selectedPaymentIds: string[];
  onField: (field: BillingField, value: string) => void;
  onCurrency: (value: InvoiceCurrency) => void;
  onToggle: (key: OptionalKey) => void;
  onTogglePaymentMethod: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3.5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Invoice date</span>
          <input
            className="ms-field [color-scheme:dark]"
            type="date"
            value={values.invoiceDate}
            onChange={(e) => onField("invoiceDate", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Due date (optional)</span>
          <input
            className="ms-field [color-scheme:dark]"
            type="date"
            value={values.dueDate}
            onChange={(e) => onField("dueDate", e.target.value)}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Payment terms</span>
          <input
            className="ms-field"
            type="text"
            placeholder="e.g. Net 14"
            value={values.paymentTermsLabel}
            onChange={(e) => onField("paymentTermsLabel", e.target.value)}
          />
        </label>
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
      </div>

      <div className="border-t border-line-faint pt-5">
        <div className="mb-1 text-[13px] font-medium text-fg-label">How to pay you</div>
        <p className="mb-3 text-[12.5px] leading-[1.4] text-fg-tertiary">
          Tick every method to show on this invoice — one, several, or all.{" "}
          <Link href="/account" className="text-gold">
            Manage payment methods
          </Link>
        </p>
        <div className="flex flex-col gap-2.5">
          {paymentMethods.length === 0 && (
            <div className="rounded-xl border border-line-input bg-white/[0.01] px-3.5 py-3 text-[12.5px] text-fg-tertiary">
              No saved payment methods yet — add PayPal, a bank account and more in Account settings, or use
              custom details below.
            </div>
          )}
          {paymentMethods.map((method) => {
            const checked = selectedPaymentIds.includes(method.id);
            return (
              <label
                key={method.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  checked ? "border-gold-soft bg-white/[0.02]" : "border-line-input bg-white/[0.01]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTogglePaymentMethod(method.id)}
                  className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-gold"
                />
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-fg">{method.title}</span>
                  {method.lines.slice(0, 2).map((line) => (
                    <span key={line} className="block truncate text-[12.5px] text-fg-tertiary">
                      {line}
                    </span>
                  ))}
                </span>
              </label>
            );
          })}
          <OptionalField
            label="Custom payment details (this invoice only)"
            hint="For a one-off method you don't want to save."
            checked={enabled.customPayment}
            onToggle={() => onToggle("customPayment")}
          >
            <textarea
              className="ms-field"
              rows={4}
              maxLength={800}
              value={values.customPaymentDetails}
              onChange={(e) => onField("customPaymentDetails", e.target.value)}
            />
          </OptionalField>
        </div>
      </div>

      <div className="border-t border-line-faint pt-5">
        <div className="mb-3 text-[13px] font-medium text-fg-label">Add only if you need it</div>
        <div className="flex flex-col gap-2.5">
          <OptionalField
            label="Add VAT / tax"
            hint="Off means the invoice shows no tax line at all."
            checked={enabled.tax}
            onToggle={() => onToggle("tax")}
          >
            <div className="relative w-[140px]">
              <input
                className="ms-field ms-num pr-[26px]"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={values.taxRatePct}
                onChange={(e) => onField("taxRatePct", e.target.value)}
              />
              <span className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[13px] text-fg-tertiary">
                %
              </span>
            </div>
          </OptionalField>

          <OptionalField
            label="Tax / small-business note"
            hint="A line such as a small-business exemption. Confirm the wording with your tax advisor."
            checked={enabled.taxNote}
            onToggle={() => onToggle("taxNote")}
          >
            <textarea
              className="ms-field"
              rows={3}
              maxLength={400}
              value={values.taxNote}
              onChange={(e) => onField("taxNote", e.target.value)}
            />
          </OptionalField>

          <OptionalField
            label="Service date or period"
            checked={enabled.serviceDate}
            onToggle={() => onToggle("serviceDate")}
          >
            <input
              className="ms-field"
              type="text"
              maxLength={100}
              placeholder="e.g. 1–15 Sep 2026"
              value={values.serviceDate}
              onChange={(e) => onField("serviceDate", e.target.value)}
            />
          </OptionalField>

          <OptionalField
            label="Client VAT / tax ID"
            checked={enabled.clientTaxId}
            onToggle={() => onToggle("clientTaxId")}
          >
            <input
              className="ms-field"
              type="text"
              maxLength={60}
              value={values.clientTaxId}
              onChange={(e) => onField("clientTaxId", e.target.value)}
            />
          </OptionalField>

          <OptionalField
            label="PO number"
            hint="If the client's company requires one internally."
            checked={enabled.poNumber}
            onToggle={() => onToggle("poNumber")}
          >
            <input
              className="ms-field"
              type="text"
              value={values.poNumber}
              onChange={(e) => onField("poNumber", e.target.value)}
            />
          </OptionalField>

          <OptionalField
            label="Late-fee note"
            hint="Only add this if it's in your agreement."
            checked={enabled.lateFee}
            onToggle={() => onToggle("lateFee")}
          >
            <textarea
              className="ms-field"
              rows={3}
              maxLength={400}
              value={values.lateFeeNote}
              onChange={(e) => onField("lateFeeNote", e.target.value)}
            />
          </OptionalField>
        </div>
      </div>
    </div>
  );
}
