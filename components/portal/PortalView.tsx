"use client";

import { useRouter } from "next/navigation";
import { DOC_TYPE_META, getStatusLabel, formatDocDate } from "@/lib/document-display";
import type { Document, Project } from "@/server/db/schema";

const DOC_TYPE_ORDER: Record<string, number> = { proposal: 0, contract: 1, sow: 2, invoice: 3 };

export function PortalView({
  projectId,
  project,
  documents,
}: {
  projectId: string;
  project: Project;
  documents: Document[];
}) {
  const router = useRouter();
  const sorted = [...documents].sort((a, b) => DOC_TYPE_ORDER[a.docType] - DOC_TYPE_ORDER[b.docType]);

  async function handleLogout() {
    await fetch(`/api/portal/${projectId}/logout`, { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-navy text-fg">
      <header className="flex items-center justify-between border-b border-line-faint px-8 py-4">
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
          {project.name}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer text-[13px] font-medium text-fg-muted"
        >
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-[680px] px-6 py-14">
        <div className="mb-10 rounded-[14px] border border-line-soft bg-white/[0.015] p-6">
          <h1 className="mb-2 font-display text-xl font-semibold tracking-[-0.01em] text-fg-heading">
            {project.name}
          </h1>
          <div className="text-[13.5px] text-fg-tertiary">Prepared by {project.clientName ? "your provider" : "your provider"}</div>
        </div>

        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-fg">Documents</span>
          <span className="text-[13px] text-fg-muted">{sorted.length} shared</span>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
          {sorted.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-fg-muted sm:px-[22px]">
              Nothing has been shared with you yet.
            </div>
          ) : (
            sorted.map((doc) => {
              const meta = DOC_TYPE_META[doc.docType];
              return (
                <a
                  key={doc.id}
                  href={`/api/portal/${projectId}/documents/${doc.id}/pdf`}
                  className="flex items-center justify-between gap-4 border-b border-line-faint px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025] sm:px-[22px]"
                >
                  <div className="flex min-w-0 items-center gap-[13px]">
                    <span
                      className={`flex h-[38px] w-8 shrink-0 items-center justify-center rounded-[5px] border font-display text-[9.5px] font-semibold tracking-[0.02em] ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                    >
                      {meta.abbr}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] font-medium text-fg">
                        {meta.label}
                      </span>
                      <span className="block truncate text-[12.5px] text-fg-muted">
                        {getStatusLabel(doc.docType, doc.status)} · {formatDocDate(doc.createdAt)}
                      </span>
                    </span>
                  </div>
                  <span className="shrink-0 text-[13px] font-medium text-gold">View →</span>
                </a>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
