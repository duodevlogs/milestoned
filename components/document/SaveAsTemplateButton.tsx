"use client";

import { useState } from "react";

export function SaveAsTemplateButton({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-line-strong bg-transparent px-[18px] py-2.5 font-display text-[13.5px] font-semibold text-fg-bright"
      >
        Save as template
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        className="ms-field w-[160px] py-2 text-[13px]"
        type="text"
        placeholder="Name it..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button
        type="button"
        disabled={!name.trim() || status === "saving"}
        onClick={async () => {
          setStatus("saving");
          try {
            const res = await fetch("/api/templates/clone", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: name.trim(), documentId }),
            });
            if (!res.ok) throw new Error("Failed to save template");
            setStatus("saved");
            setName("");
            setTimeout(() => {
              setOpen(false);
              setStatus("idle");
            }, 1200);
          } catch {
            setStatus("error");
          }
        }}
        className="cursor-pointer rounded-[8px] bg-gold px-3 py-2 text-[13px] font-semibold text-gold-contrast disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setStatus("idle");
        }}
        className="cursor-pointer text-[13px] text-fg-muted"
      >
        Cancel
      </button>
      {status === "error" && <span className="text-[12.5px] text-danger">Couldn&apos;t save.</span>}
    </div>
  );
}
