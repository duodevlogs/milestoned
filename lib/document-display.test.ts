import { describe, it, expect } from "vitest";
import { DOC_TYPE_META, DOC_STATUS_META, ALL_DOCUMENT_STATUSES, formatDocDate } from "./document-display";

describe("DOC_TYPE_META", () => {
  it("has an entry for every document type", () => {
    expect(Object.keys(DOC_TYPE_META).sort()).toEqual(["contract", "invoice", "proposal", "sow"]);
  });

  it("gives each type a unique three-letter abbreviation", () => {
    const abbrs = Object.values(DOC_TYPE_META).map((m) => m.abbr);
    expect(new Set(abbrs).size).toBe(abbrs.length);
  });
});

describe("DOC_STATUS_META / ALL_DOCUMENT_STATUSES", () => {
  it("has metadata for every listed status and no extras", () => {
    expect(Object.keys(DOC_STATUS_META).sort()).toEqual([...ALL_DOCUMENT_STATUSES].sort());
  });
});

describe("formatDocDate", () => {
  it("formats a Date as a short human date", () => {
    expect(formatDocDate(new Date("2026-08-20T00:00:00"))).toBe("Aug 20, 2026");
  });
});
