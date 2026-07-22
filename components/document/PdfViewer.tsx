"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Renders the real, generated PDF page-by-page — the on-screen preview is
// the same file the Download PDF button serves, so pagination here always
// matches the actual document instead of approximating it in HTML.
const TARGET_WIDTH = 620;

export function PdfViewer({ documentId }: { documentId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;

    (async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}/pdf`);
        if (!res.ok) throw new Error("Failed to load PDF");
        const data = await res.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        if (cancelled) {
          pdf.cleanup();
          return;
        }
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
      pdfRef.current = null;
    };
  }, [documentId]);

  useEffect(() => {
    if (status !== "ready" || !pdfRef.current) return;
    let cancelled = false;

    (async () => {
      const page = await pdfRef.current!.getPage(pageNum);
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = TARGET_WIDTH / unscaledViewport.width;
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale });

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
      await page.render({ canvas, viewport, transform }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [status, pageNum]);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-4 min-h-[600px] w-full max-w-[620px] overflow-hidden rounded-xl bg-paper shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
        {status === "loading" && (
          <div className="flex h-[600px] items-center justify-center text-sm text-paper-muted">
            Loading document…
          </div>
        )}
        {status === "error" && (
          <div className="flex h-[600px] items-center justify-center text-sm text-danger">
            Could not load the document preview. Try downloading the PDF instead.
          </div>
        )}
        {status === "ready" && (
          <canvas ref={canvasRef} className="block h-auto w-full" />
        )}
      </div>

      {status === "ready" && numPages > 1 && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPageNum((n) => Math.max(1, n - 1))}
            disabled={pageNum <= 1}
            aria-label="Previous page"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[9px] border border-line-strong bg-transparent text-fg-soft disabled:cursor-not-allowed disabled:opacity-40"
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
          </button>
          <span className="text-[13px] text-fg-tertiary">
            Page {pageNum} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNum((n) => Math.min(numPages, n + 1))}
            disabled={pageNum >= numPages}
            aria-label="Next page"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[9px] border border-line-strong bg-transparent text-fg-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M5.5 3L10 7.5L5.5 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
