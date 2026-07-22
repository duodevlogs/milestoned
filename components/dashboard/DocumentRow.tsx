"use client";

import { useRouter } from "next/navigation";
import { StatusSelect } from "./StatusSelect";
import { DOC_TYPE_META, formatDocDate } from "@/lib/document-display";
import type { Document } from "@/server/db/schema";

/*
 * A plain clickable div, not a Link/anchor — the row contains a real <select>
 * (the status control), and nesting interactive elements inside an <a> is
 * invalid HTML. Clicking the select stops propagation so it doesn't also
 * trigger row navigation.
 */
export function DocumentRow({ doc }: { doc: Document }) {
  const router = useRouter();
  const meta = DOC_TYPE_META[doc.docType];

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/documents/${doc.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/documents/${doc.id}`);
      }}
      className="grid cursor-pointer grid-cols-2 gap-3 border-b border-line-faint px-4 py-4 transition-colors hover:bg-white/[0.025] lg:grid-cols-[1fr_150px_130px_140px_20px] lg:items-center lg:gap-4 lg:px-[22px]"
    >
      {/*
       * Only this cell gets a responsive col-span — on a 2-col mobile/
       * tablet grid it spans the full row; on the 5-col desktop grid
       * (lg+) it's back to one column. Every other child is left at its
       * implicit span so it just auto-flows into row 2 (type/date) then
       * row 3 (status/chevron) below lg, and into its own column at lg+ —
       * no duplicated markup, one shared StatusSelect instance either way.
       * The switch is lg (1024px), not md: below that, the persistent
       * sidebar plus the four fixed-width columns (440px) don't leave
       * enough room for the name column, which was collapsing to 0 and
       * overlapping — the compact layout needs to hold through tablet
       * widths, matching the sidebar/drawer switch in Sidebar/MobileNav.
       */}
      <span className="col-span-2 flex min-w-0 items-center gap-[13px] lg:col-span-1">
        <span
          className={`flex h-[38px] w-8 shrink-0 items-center justify-center rounded-[5px] border font-display text-[9.5px] font-semibold tracking-[0.02em] ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
        >
          {meta.abbr}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-medium text-fg">
            {doc.projectName}
          </span>
          <span className="block truncate text-[12.5px] text-fg-muted">{doc.clientName}</span>
        </span>
      </span>
      <span className="text-[13.5px] text-fg-soft">{meta.label}</span>
      <span className="text-right text-[13.5px] text-fg-tertiary lg:text-left">
        {formatDocDate(doc.createdAt)}
      </span>
      <span onClick={(e) => e.stopPropagation()}>
        <StatusSelect documentId={doc.id} status={doc.status} />
      </span>
      <span className="flex items-center justify-end text-[#4d545d]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 3L9 7L5 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
