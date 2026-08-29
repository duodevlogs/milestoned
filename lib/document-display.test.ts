import { describe, it, expect } from "vitest";
import {
  DOC_TYPE_META,
  DOC_STATUS_META,
  ALL_DOCUMENT_STATUSES,
  formatDocDate,
  getStatusLabel,
} from "./document-display";

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

describe("getStatusLabel", () => {
  it("relabels a signed Proposal as Accepted", () => {
    expect(getStatusLabel("proposal", "signed")).toBe("Accepted");
  });

  it("leaves every other doc type / status combination as the standard label", () => {
    expect(getStatusLabel("contract", "signed")).toBe(DOC_STATUS_META.signed.label);
    expect(getStatusLabel("proposal", "draft")).toBe(DOC_STATUS_META.draft.label);
    expect(getStatusLabel("proposal", "sent")).toBe(DOC_STATUS_META.sent.label);
    expect(getStatusLabel("proposal", "paid")).toBe(DOC_STATUS_META.paid.label);
  });
});

describe("formatDocDate", () => {
  it("formats a Date as a short human date", () => {
    expect(formatDocDate(new Date("2026-08-20T00:00:00"))).toBe("Aug 20, 2026");
  });
});
