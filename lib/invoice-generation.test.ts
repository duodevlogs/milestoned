import { describe, it, expect } from "vitest";
import { computeInvoiceTotals, formatInvoiceAmount, formatInvoiceDate } from "./invoice-generation";

describe("computeInvoiceTotals", () => {
  it("sums line items and applies tax on top", () => {
    const result = computeInvoiceTotals([{ amount: 2250 }], 19);
    expect(result).toEqual({ subtotal: 2250, taxAmount: 428, total: 2678 });
  });

  it("handles multiple line items", () => {
    const result = computeInvoiceTotals([{ amount: 1000 }, { amount: 500 }], 0);
    expect(result).toEqual({ subtotal: 1500, taxAmount: 0, total: 1500 });
  });

  it("handles an empty line-item list", () => {
    expect(computeInvoiceTotals([], 19)).toEqual({ subtotal: 0, taxAmount: 0, total: 0 });
  });
});

describe("formatInvoiceAmount", () => {
  it("uses the correct currency symbol per currency", () => {
    expect(formatInvoiceAmount(2678, "USD")).toBe("$2,678");
    expect(formatInvoiceAmount(2678, "EUR")).toBe("€2,678");
    expect(formatInvoiceAmount(2678, "GBP")).toBe("£2,678");
  });

  it("falls back to 0 for non-finite input", () => {
    expect(formatInvoiceAmount(NaN, "USD")).toBe("$0");
  });
});

describe("formatInvoiceDate", () => {
  it("formats a YYYY-MM-DD string as a short human date", () => {
    expect(formatInvoiceDate("2026-08-20")).toBe("Aug 20, 2026");
  });

  it("returns null for missing or invalid dates", () => {
    expect(formatInvoiceDate(null)).toBeNull();
    expect(formatInvoiceDate("garbage")).toBeNull();
  });
});
