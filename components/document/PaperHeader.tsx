export function PaperHeader({
  docTypeLabel,
  projectName,
  clientName,
  timelineLabel,
  dateLabel,
}: {
  docTypeLabel: string;
  projectName: string;
  clientName: string;
  timelineLabel: string;
  dateLabel: string;
}) {
  return (
    <>
      <div className="mb-6 flex items-start justify-between border-b-2 border-paper-ink pb-[18px]">
        <div>
          <div className="mb-[7px] text-[10px] uppercase tracking-[0.14em] text-paper-muted">
            {docTypeLabel}
          </div>
          <div className="font-display text-[23px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#14151a]">
            {projectName || "Untitled project"}
          </div>
        </div>
        <div className="ml-5 flex-shrink-0 text-right">
          <div className="font-display text-[13px] font-semibold text-[#14151a]">Milestoned</div>
          <div className="mt-0.5 text-[10.5px] text-paper-muted">{dateLabel}</div>
        </div>
      </div>

      <div className="mb-[26px] flex gap-10">
        <div>
          <div className="mb-[5px] text-[10px] uppercase tracking-[0.1em] text-paper-faint">
            Prepared for
          </div>
          <div className="text-sm font-semibold text-[#14151a]">{clientName || "Client name"}</div>
        </div>
        <div>
          <div className="mb-[5px] text-[10px] uppercase tracking-[0.1em] text-paper-faint">
            Timeline
          </div>
          <div className="text-sm font-semibold text-[#14151a]">{timelineLabel}</div>
        </div>
      </div>
    </>
  );
}
