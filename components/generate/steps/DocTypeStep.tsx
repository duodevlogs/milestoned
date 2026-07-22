import { DOC_TYPE_META } from "@/lib/document-display";
import type { DocType } from "@/lib/document-generation";

const DOC_TYPE_DESCRIPTIONS: Record<DocType, string> = {
  sow: "Deliverables, boundaries & acceptance",
  contract: "Full agreement with payment terms",
  proposal: "Pitch, approach & pricing",
  invoice: "Milestone billing, ready to send",
};

const DOC_TYPES: DocType[] = ["sow", "contract", "proposal", "invoice"];

export function DocTypeStep({
  docType,
  onSelect,
}: {
  docType: DocType;
  onSelect: (docType: DocType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DOC_TYPES.map((type) => {
        const meta = DOC_TYPE_META[type];
        const selected = docType === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex cursor-pointer flex-col gap-3 rounded-xl border-[1.5px] p-4 text-left transition-colors ${
              selected ? "border-gold bg-white/[0.03]" : "border-line-input bg-white/[0.01]"
            }`}
          >
            <span
              className={`flex h-10 w-[34px] items-center justify-center rounded-[6px] font-display text-[10px] font-semibold tracking-[0.02em] ${meta.bgClass} ${meta.textClass}`}
            >
              {meta.abbr}
            </span>
            <span className="block">
              <span className="mb-[3px] block text-[14.5px] font-semibold text-fg">
                {meta.label}
              </span>
              <span className="block text-[12.5px] leading-[1.4] text-fg-tertiary">
                {DOC_TYPE_DESCRIPTIONS[type]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
