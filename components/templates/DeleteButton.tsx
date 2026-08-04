"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ href }: { href: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    try {
      await fetch(href, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label="Delete"
      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-danger disabled:opacity-50"
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path
          d="M2.5 3.5h9M5.5 3.5V2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M3.5 3.5l.5 8a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.5-8"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
