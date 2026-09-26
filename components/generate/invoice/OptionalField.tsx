import type { ReactNode } from "react";

/** A checkbox row that reveals its field only when ticked — used for everything that isn't on every invoice. */
export function OptionalField({
  label,
  hint,
  checked,
  onToggle,
  children,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        checked ? "border-gold-soft bg-white/[0.02]" : "border-line-input bg-white/[0.01]"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-gold"
        />
        <span className="min-w-0">
          <span className="block text-[14px] font-medium text-fg">{label}</span>
          {hint && <span className="mt-0.5 block text-[12.5px] leading-[1.4] text-fg-tertiary">{hint}</span>}
        </span>
      </label>
      {checked && <div className="ml-7 mt-3">{children}</div>}
    </div>
  );
}
