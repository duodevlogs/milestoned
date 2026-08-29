"use client";

import { useTransition } from "react";
import { setDocumentShared } from "@/app/projects/[id]/actions";

export function ShareToggle({
  documentId,
  projectId,
  shared,
}: {
  documentId: string;
  projectId: string;
  shared: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const formData = new FormData();
    formData.set("documentId", documentId);
    formData.set("projectId", projectId);
    formData.set("shared", String(!shared));
    startTransition(() => {
      setDocumentShared(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        shared
          ? "border-gold-border bg-gold-soft text-fg-label"
          : "border-line-input bg-transparent text-fg-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${shared ? "bg-gold" : "bg-fg-muted"}`} />
      {shared ? "Shared" : "Draft"}
    </button>
  );
}
