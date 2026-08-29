"use client";

import { useRouter } from "next/navigation";
import { StatusSelect } from "@/components/dashboard/StatusSelect";
import { ShareToggle } from "./ShareToggle";
import { DOC_TYPE_META, formatDocDate } from "@/lib/document-display";
import type { Document } from "@/server/db/schema";

/*
 * Deliberately not a reuse of DocumentRow — that component's grid template
 * is already at its column budget (see its own layout comment), and adding
 * a Share toggle here is specific to the Project page, not something the
 * Dashboard or Client detail page should show.
 */
export function ProjectDocumentRow({ doc, projectId }: { doc: Document; projectId: string }) {
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
      className="flex cursor-pointer flex-wrap items-center gap-3 border-b border-line-faint px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025] sm:px-[22px]"
    >
      <span
        className={`flex h-[38px] w-8 shrink-0 items-center justify-center rounded-[5px] border font-display text-[9.5px] font-semibold tracking-[0.02em] ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
      >
        {meta.abbr}
      </span>
      <span className="min-w-[140px] flex-1">
        <span className="block truncate text-[14.5px] font-medium text-fg">{doc.projectName}</span>
        <span className="block truncate text-[12.5px] text-fg-muted">{meta.label}</span>
      </span>
      <span className="text-[13px] text-fg-tertiary">{formatDocDate(doc.createdAt)}</span>
      <span onClick={(e) => e.stopPropagation()}>
        <StatusSelect documentId={doc.id} docType={doc.docType} status={doc.status} />
      </span>
      <span onClick={(e) => e.stopPropagation()}>
        <ShareToggle documentId={doc.id} projectId={projectId} shared={Boolean(doc.sharedAt)} />
      </span>
    </div>
  );
}
