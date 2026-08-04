"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { DOC_TYPE_META } from "@/lib/document-display";
import type { DocType } from "@/lib/document-generation";
import { StatusSelect } from "@/components/dashboard/StatusSelect";
import { SaveAsTemplateButton } from "@/components/document/SaveAsTemplateButton";
import type { DocumentStatus } from "@/server/db/schema";

// pdfjs-dist touches browser-only globals (DOMMatrix) at module-eval time,
// which breaks Next's SSR pass of this "use client" component — ssr: false
// keeps it out of the server render entirely, not just deferred on the client.
const PdfViewer = dynamic(
  () => import("@/components/document/PdfViewer").then((mod) => mod.PdfViewer),
  { ssr: false }
);

export function DocumentView({
  documentId,
  status,
  content,
}: {
  documentId: string;
  status: DocumentStatus;
  // Only docType/projectName are used here — shared by every content shape
  // (Contract/SOW/Proposal's GeneratedDocumentContent and Invoice's
  // InvoiceContent alike), so this view stays doc-type-agnostic.
  content: { docType: DocType; projectName: string };
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-navy text-fg">
      <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-line-faint px-8 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2 text-[13.5px] text-fg-tertiary"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M9.5 3L5 7.5L9.5 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Documents
          </Link>
          <span className="h-[18px] w-px shrink-0 bg-line-input" />
          <span className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
            {content.projectName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusSelect documentId={documentId} status={status} />
          <SaveAsTemplateButton documentId={documentId} />
          <a
            href={`/api/documents/${documentId}/pdf`}
            className="inline-flex items-center gap-2 rounded-[10px] border-none bg-gold px-[18px] py-2.5 font-display text-[13.5px] font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] transition-transform hover:-translate-y-px"
          >
            Download PDF
          </a>
        </div>
      </header>

      <div className="flex flex-1 justify-center overflow-y-auto bg-well p-10">
        <div className="w-full max-w-[620px]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.08em] text-fg-muted">
              {DOC_TYPE_META[content.docType].label}
            </span>
          </div>

          <PdfViewer documentId={documentId} />
        </div>
      </div>
    </div>
  );
}
