"use client";

import { useEffect, useRef, useState } from "react";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 3.5L5 6.5L8 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The avatar opens a menu instead of acting as the sign-out button itself —
 * a single unlabeled icon that silently signs you out on click is a easy
 * mis-click away from an unwanted sign-out with no confirmation.
 */
export function AccountMenu({
  initials,
  signOutAction,
}: {
  initials: string;
  signOutAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Account"
        className="flex h-[34px] items-center gap-1.5 rounded-[9px] border border-white/[0.09] bg-white/[0.02] pl-2.5 pr-2 font-display text-[13px] font-semibold text-fg-label"
      >
        {initials}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-[168px] overflow-hidden rounded-[11px] border border-line-soft bg-panel py-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.5)]"
        >
          <button
            type="button"
            role="menuitem"
            disabled
            className="flex w-full cursor-not-allowed items-center px-3.5 py-2.5 text-left text-[13.5px] text-fg-muted"
          >
            Settings
          </button>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full cursor-pointer items-center px-3.5 py-2.5 text-left text-[13.5px] font-medium text-fg-label"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
