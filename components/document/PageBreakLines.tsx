export function PageBreakLines({
  pageHeight,
  pageCount,
}: {
  pageHeight: number;
  pageCount: number;
}) {
  if (pageHeight <= 0) return null;
  return (
    <>
      {Array.from({ length: pageCount - 1 }, (_, i) => (
        <div
          key={i}
          className="pointer-events-none absolute inset-x-0 flex items-center gap-3 px-[46px]"
          style={{ top: (i + 1) * pageHeight }}
        >
          <span className="h-px flex-1 border-t border-dashed border-paper-border" />
          <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-paper-faint">
            Page {i + 2}
          </span>
          <span className="h-px flex-1 border-t border-dashed border-paper-border" />
        </div>
      ))}
    </>
  );
}
