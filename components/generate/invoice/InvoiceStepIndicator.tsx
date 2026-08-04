const STEPS = ["Client & link", "Billing terms", "Line items"];

export function InvoiceStepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-[9px]">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-xs font-semibold ${
                  active
                    ? "border-gold bg-gold text-gold-contrast"
                    : done
                      ? "border-transparent bg-gold-soft text-gold"
                      : "border-line-strong bg-transparent text-fg-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[13px] font-medium ${
                  active ? "text-fg-bright" : done ? "text-fg-soft" : "text-fg-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 h-[1.5px] w-[26px] ${i < step ? "bg-gold" : "bg-line-strong"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
