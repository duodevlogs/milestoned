import { LEGAL_DISCLAIMER } from "@/lib/contract-clauses";

export function PaperFooter() {
  return (
    <>
      <div className="mt-[34px] flex gap-9 pt-2">
        <div className="flex-1">
          <div className="mb-1.5 h-px bg-[#c9c4b6]" />
          <div className="text-[10.5px] text-paper-faint">Client signature</div>
        </div>
        <div className="flex-1">
          <div className="mb-1.5 h-px bg-[#c9c4b6]" />
          <div className="text-[10.5px] text-paper-faint">Consultant signature</div>
        </div>
      </div>

      <div className="mt-6 border-t border-paper-border pt-3">
        <p className="text-[10.5px] leading-[1.5] text-paper-faint">{LEGAL_DISCLAIMER}</p>
      </div>
    </>
  );
}
