import { describe, it, expect } from "vitest";
import { invoiceLineItemInputSchema, generateInvoiceSchema } from "./invoice-generation.schema";

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    clientName: "Northwind Studio",
    projectName: "Marketing site redesign",
    invoiceDate: "2026-08-06",
    paymentTermsLabel: "Net 14",
    lineItems: [{ description: "Milestone 2 — Design sign-off", amount: 2250 }],
    ...overrides,
  };
}

describe("invoiceLineItemInputSchema", () => {
  it("requires a non-empty description", () => {
    expect(() => invoiceLineItemInputSchema.parse({ description: "", amount: 100 })).toThrow();
  });

  it("requires a positive amount", () => {
    expect(() =>
      invoiceLineItemInputSchema.parse({ description: "x", amount: 0 })
    ).toThrow();
    expect(() =>
      invoiceLineItemInputSchema.parse({ description: "x", amount: -50 })
    ).toThrow();
  });

  it("accepts a valid line item without a milestoneLabel", () => {
    expect(() =>
      invoiceLineItemInputSchema.parse({ description: "x", amount: 100 })
    ).not.toThrow();
  });
});

describe("generateInvoiceSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(() => generateInvoiceSchema.parse(validPayload())).not.toThrow();
  });

  it("defaults tax rate to 0 and currency to USD when omitted", () => {
    const result = generateInvoiceSchema.parse(validPayload());
    expect(result.taxRatePct).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("rejects a tax rate outside 0-100", () => {
    expect(() => generateInvoiceSchema.parse(validPayload({ taxRatePct: -1 }))).toThrow();
    expect(() => generateInvoiceSchema.parse(validPayload({ taxRatePct: 101 }))).toThrow();
  });

  it("rejects an unsupported currency", () => {
    expect(() => generateInvoiceSchema.parse(validPayload({ currency: "JPY" }))).toThrow();
  });

  it("requires at least one line item", () => {
    expect(() => generateInvoiceSchema.parse(validPayload({ lineItems: [] }))).toThrow();
  });

  it("requires an invoice date and payment terms", () => {
    expect(() => generateInvoiceSchema.parse(validPayload({ invoiceDate: "" }))).toThrow();
    expect(() => generateInvoiceSchema.parse(validPayload({ paymentTermsLabel: "" }))).toThrow();
  });

  it("accepts a valid milestoneProgress object", () => {
    const result = generateInvoiceSchema.parse(
      validPayload({ milestoneProgress: { current: 2, total: 4 } })
    );
    expect(result.milestoneProgress).toEqual({ current: 2, total: 4 });
  });

  it("rejects a milestoneProgress with a non-positive count", () => {
    expect(() =>
      generateInvoiceSchema.parse(validPayload({ milestoneProgress: { current: 0, total: 4 } }))
    ).toThrow();
  });
});
