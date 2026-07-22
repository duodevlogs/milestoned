"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { SidebarContent } from "./SidebarContent";

/*
 * Hamburger + slide-in drawer, shown only below lg — the desktop <Sidebar>
 * takes over above it (lg, not md — see Sidebar's comment). The overlay is portaled to document.body: the
 * header this button lives in uses backdrop-filter (for its blur-on-scroll
 * effect), and per spec, backdrop-filter/filter/transform on an ancestor
 * creates a containing block for position:fixed descendants — trapping a
 * "fixed inset-0" overlay inside the header's own small box instead of the
 * viewport. Portaling to body escapes that entirely.
 *
 * No mount-detection gate needed: the portal only renders when `open` is
 * true, and `open` can only become true from a click — which happens after
 * hydration — so `document` is always available by then.
 */
export function MobileNav({
  creditsLeft,
  creditsTotal,
}: {
  creditsLeft: number;
  creditsTotal: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line-input text-fg-soft lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M2.5 5h13M2.5 9h13M2.5 13h13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 top-0 flex h-full w-[260px] max-w-[80%] flex-col bg-navy p-4 shadow-[8px_0_30px_rgba(0,0,0,0.4)]">
                <div className="mb-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 3l10 10M13 3L3 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <SidebarContent
                  creditsLeft={creditsLeft}
                  creditsTotal={creditsTotal}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
