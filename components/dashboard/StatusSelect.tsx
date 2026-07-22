"use client";

import { useTransition } from "react";
import { updateDocumentStatus } from "@/app/dashboard/actions";
import { ALL_DOCUMENT_STATUSES, DOC_STATUS_META } from "@/lib/document-display";
import type { DocumentStatus } from "@/server/db/schema";

export function StatusSelect({
  documentId,
  status,
}: {
  documentId: string;
  status: DocumentStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const meta = DOC_STATUS_META[status];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData();
    formData.set("documentId", documentId);
    formData.set("status", e.target.value);
    startTransition(() => {
      updateDocumentStatus(formData);
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      aria-label="Document status"
      className={`cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none disabled:opacity-60 ${meta.bgClass} ${meta.textClass}`}
    >
      {ALL_DOCUMENT_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-panel text-fg">
          {DOC_STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}
