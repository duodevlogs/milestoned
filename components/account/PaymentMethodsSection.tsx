"use client";

import { useState } from "react";
import { deletePaymentMethod, savePaymentMethod } from "@/app/account/actions";
import {
  PAYMENT_METHOD_TYPES,
  formatPaymentMethod,
  getPaymentMethodType,
  type SavedPaymentMethod,
} from "@/lib/payment-methods";

function MethodForm({ method, onCancel }: { method?: SavedPaymentMethod; onCancel: () => void }) {
  const [typeId, setTypeId] = useState(method?.type ?? "paypal");
  const type = getPaymentMethodType(typeId) ?? PAYMENT_METHOD_TYPES[0];

  return (
    <form
      action={savePaymentMethod}
      className="flex flex-col gap-4 rounded-[12px] border border-line-input bg-white/[0.015] p-4"
    >
      {method && <input type="hidden" name="id" value={method.id} />}
      <div className="grid grid-cols-2 gap-3.5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Type</span>
          <select
            className="ms-field cursor-pointer"
            name="type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            {PAYMENT_METHOD_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Name (optional)</span>
          <input
            className="ms-field"
            type="text"
            name="label"
            maxLength={60}
            defaultValue={method?.label ?? ""}
            placeholder={`e.g. ${type.label} (business)`}
          />
        </label>
      </div>

      {/* key={typeId}: switching type must not carry the previous type's typed values across. */}
      <div key={typeId} className="flex flex-col gap-3.5">
        {type.fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-2 block text-[13px] font-medium text-fg-label">{field.label}</span>
            {field.multiline ? (
              <textarea
                className="ms-field"
                name={`f_${field.key}`}
                rows={3}
                maxLength={800}
                defaultValue={method?.type === typeId ? method.fields[field.key] ?? "" : ""}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                className="ms-field"
                type="text"
                name={`f_${field.key}`}
                maxLength={300}
                defaultValue={method?.type === typeId ? method.fields[field.key] ?? "" : ""}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={method?.isDefault ?? false}
          className="h-4 w-4 cursor-pointer accent-gold"
        />
        <span className="text-[13px] text-fg-soft">Pre-tick this on every new invoice</span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft"
        >
          {method ? "Save changes" : "Add method"}
        </button>
        <button type="button" onClick={onCancel} className="cursor-pointer text-[13px] text-fg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function PaymentMethodsSection({ methods }: { methods: SavedPaymentMethod[] }) {
  // null = nothing open, "new" = the add form, otherwise the id being edited.
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {methods.length === 0 && open !== "new" && (
        <div className="rounded-[10px] border border-line-soft bg-white/[0.015] px-4 py-6 text-center text-sm text-fg-muted">
          No payment methods yet. Add one and you can tick it on any invoice.
        </div>
      )}

      {methods.map((method) => {
        if (open === method.id) {
          return <MethodForm key={method.id} method={method} onCancel={() => setOpen(null)} />;
        }
        const formatted = formatPaymentMethod(method);
        return (
          <div
            key={method.id}
            className="flex items-start justify-between gap-4 rounded-[10px] border border-line-soft bg-white/[0.015] px-4 py-3.5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-fg-bright">
                {formatted.title}
                {method.isDefault && (
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-medium text-gold">
                    Pre-ticked
                  </span>
                )}
              </div>
              {formatted.lines.map((line) => (
                <div key={line} className="truncate text-[12.5px] text-fg-muted">
                  {line}
                </div>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(method.id)}
                className="cursor-pointer rounded-[8px] border border-line-strong px-3 py-1.5 text-[12.5px] font-medium text-fg-soft"
              >
                Edit
              </button>
              <form action={deletePaymentMethod}>
                <input type="hidden" name="id" value={method.id} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-[8px] border border-line-strong px-3 py-1.5 text-[12.5px] font-medium text-fg-soft transition-colors hover:border-danger/40 hover:text-danger"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        );
      })}

      {open === "new" ? (
        <MethodForm onCancel={() => setOpen(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen("new")}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft"
        >
          Add a payment method
        </button>
      )}
    </div>
  );
}
