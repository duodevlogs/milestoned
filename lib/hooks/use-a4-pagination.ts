"use client";

import { useEffect, useRef, useState } from "react";

/*
 * A4 aspect ratio (297:210mm) applied to the card's own rendered width —
 * cosmetic estimate only. Real pagination is decided by @react-pdf/renderer's
 * own layout engine, which won't break at the same pixel offsets as browser
 * CSS layout, so this deliberately doesn't split content.
 */
export function useA4Pagination<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [pagination, setPagination] = useState({ pageHeight: 0, pageCount: 1 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pageHeight = el.clientWidth * (297 / 210);
    const pageCount = Math.max(1, Math.ceil(el.scrollHeight / pageHeight));
    setPagination((prev) =>
      prev.pageHeight === pageHeight && prev.pageCount === pageCount
        ? prev
        : { pageHeight, pageCount }
    );
  });

  return { ref, pagination };
}
