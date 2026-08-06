import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library's auto-cleanup relies on detecting global test
// hooks (Jest-style globals) — this project imports describe/it/afterEach
// explicitly from "vitest" rather than enabling test.globals, so it never
// fires on its own; without this, DOM from one test leaks into the next.
afterEach(() => {
  cleanup();
});

/*
 * server-only's real implementation throws unconditionally when imported
 * outside Next's own server bundler (which sets the "react-server" export
 * condition) — Vitest runs in plain Node/jsdom, so every server/ file that
 * imports it would otherwise throw at import time. Stubbing it here is the
 * same escape hatch the package's own conditional export exists for.
 */
vi.mock("server-only", () => ({}));
