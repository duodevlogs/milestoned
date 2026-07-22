import { CLAUSE_FIELDS, type ClauseSelection } from "@/lib/contract-clauses";

export function ClausesStep({
  clauses,
  onToggle,
  onFieldChange,
}: {
  clauses: ClauseSelection;
  onToggle: (id: keyof ClauseSelection) => void;
  onFieldChange: (key: keyof ClauseSelection, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
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
    </div>
  );
}
