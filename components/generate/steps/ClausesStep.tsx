import { useState } from "react";
import { CLAUSE_FIELDS, type ClauseSelection } from "@/lib/contract-clauses";
import type { ClauseBundle } from "@/server/db/schema";

export function ClausesStep({
  clauses,
  bundles,
  onToggle,
  onFieldChange,
  onApplyBundle,
  onSaveBundle,
  onSavePreset,
}: {
  clauses: ClauseSelection;
  bundles: ClauseBundle[];
  onToggle: (id: keyof ClauseSelection) => void;
  onFieldChange: (key: keyof ClauseSelection, value: string) => void;
  onApplyBundle: (clauses: ClauseSelection) => void;
  onSaveBundle: (name: string) => Promise<void>;
  onSavePreset: (name: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {bundles.length > 0 && (
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Apply a saved clause bundle
          </span>
          <select
            className="ms-field cursor-pointer"
            value=""
            onChange={(e) => {
              const bundle = bundles.find((b) => b.id === e.target.value);
              if (bundle) onApplyBundle(bundle.clauseSelection as ClauseSelection);
            }}
          >
            <option value="">— Choose a bundle —</option>
            {bundles.map((bundle) => (
              <option key={bundle.id} value={bundle.id}>
                {bundle.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {CLAUSE_FIELDS.map((field) => {
        const checked = Boolean(clauses[field.id]);
        return (
          <div
            key={field.id}
            className={`rounded-xl border p-4 transition-colors ${
              checked ? "border-gold-soft bg-white/[0.02]" : "border-line-input bg-white/[0.01]"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(field.id)}
                className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-gold"
              />
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-fg">{field.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-[1.4] text-fg-tertiary">
                  {field.description}
                </span>
              </span>
            </label>

            {checked && field.inputs && (
              <div className="ml-7 mt-3 flex flex-wrap gap-3">
                {field.inputs.map((input) => (
                  <label key={String(input.key)} className="block">
                    <span className="mb-1.5 block text-xs font-medium text-fg-label">
                      {input.label}
                    </span>
                    <div className="relative">
                      <input
                        className="ms-field w-[220px] py-2 text-[13px]"
                        type="text"
                        placeholder={input.placeholder}
                        value={String(clauses[input.key] ?? "")}
                        onChange={(e) => onFieldChange(input.key, e.target.value)}
                      />
                      {input.suffix && (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-muted">
                          {input.suffix}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div
        className={`rounded-xl border p-4 transition-colors ${
          clauses.customClause ? "border-gold-soft bg-white/[0.02]" : "border-line-input bg-white/[0.01]"
        }`}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={clauses.customClause}
            onChange={() => onToggle("customClause")}
            className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-gold"
          />
          <span className="min-w-0">
            <span className="block text-[14px] font-medium text-fg">Add your own clause</span>
            <span className="mt-0.5 block text-[12.5px] leading-[1.4] text-fg-tertiary">
              Written in verbatim, exactly as you type it — not rewritten by AI.
            </span>
          </span>
        </label>

        {clauses.customClause && (
          <div className="ml-7 mt-3 flex flex-col gap-3">
            <input
              className="ms-field py-2 text-[13px]"
              type="text"
              placeholder="Clause title (optional — defaults to “Additional Terms”)"
              value={clauses.customClauseTitle}
              onChange={(e) => onFieldChange("customClauseTitle", e.target.value)}
            />
            <textarea
              className="ms-field resize-y py-2 text-[13px] leading-[1.55]"
              rows={4}
              placeholder="Type the clause exactly as you want it to appear..."
              value={clauses.customClauseText}
              onChange={(e) => onFieldChange("customClauseText", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 border-t border-line-faint pt-4">
        <SaveAction label="Save as clause bundle" onSave={onSaveBundle} />
        <SaveAction label="Save as project preset" onSave={onSavePreset} />
      </div>
    </div>
  );
}

function SaveAction({
  label,
  onSave,
}: {
  label: string;
  onSave: (name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-[8px] border border-line-strong px-3 py-1.5 text-[13px] font-medium text-fg-soft"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className="ms-field w-[200px] py-2 text-[13px]"
        type="text"
        placeholder="Name it..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button
        type="button"
        disabled={!name.trim() || status === "saving"}
        onClick={async () => {
          setStatus("saving");
          try {
            await onSave(name.trim());
            setStatus("saved");
            setName("");
            setTimeout(() => {
              setOpen(false);
              setStatus("idle");
            }, 1200);
          } catch {
            setStatus("error");
          }
        }}
        className="cursor-pointer rounded-[8px] bg-gold px-3 py-2 text-[13px] font-semibold text-gold-contrast disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setStatus("idle");
        }}
        className="cursor-pointer text-[13px] text-fg-muted"
      >
        Cancel
      </button>
      {status === "error" && <span className="text-[12.5px] text-danger">Couldn&apos;t save.</span>}
    </div>
  );
}
