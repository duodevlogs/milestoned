import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  COUNTRY_CODES,
  DEFAULT_TAX_EXEMPTION_NOTE,
  getSuggestedTaxRate,
  resolveInvoiceTax,
} from "./tax-rates";

describe("COUNTRIES", () => {
  it("has no duplicate country codes", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps COUNTRY_CODES in sync with COUNTRIES", () => {
    expect(COUNTRY_CODES).toEqual(COUNTRIES.map((c) => c.code));
  });
});

describe("getSuggestedTaxRate", () => {
  it("returns the standard VAT rate for a known country", () => {
    expect(getSuggestedTaxRate("DE")).toBe(19);
  });

  it("returns null for an unknown country code", () => {
    expect(getSuggestedTaxRate("XX")).toBeNull();
  });

  it("returns null when no country is set", () => {
    expect(getSuggestedTaxRate(null)).toBeNull();
    expect(getSuggestedTaxRate(undefined)).toBeNull();
    expect(getSuggestedTaxRate("")).toBeNull();
  });

  it("returns 0 for countries without one federal rate, not null", () => {
    expect(getSuggestedTaxRate("US")).toBe(0);
  });
});

describe("resolveInvoiceTax", () => {
  it("passes the requested rate through for a standard account, with no note", () => {
    expect(resolveInvoiceTax("standard", 19, "ignored")).toEqual({ taxRatePct: 19, taxExemptionNote: null });
  });

  it("forces 0% for an exempt account even if a rate was requested", () => {
    expect(resolveInvoiceTax("exempt", 19, "My note").taxRatePct).toBe(0);
  });

  it("uses the account's own exemption note when set", () => {
    expect(resolveInvoiceTax("exempt", 0, "  My note  ").taxExemptionNote).toBe("My note");
  });

  it("falls back to the default note when the account's is blank or missing", () => {
    expect(resolveInvoiceTax("exempt", 0, "").taxExemptionNote).toBe(DEFAULT_TAX_EXEMPTION_NOTE);
    expect(resolveInvoiceTax("exempt", 0, null).taxExemptionNote).toBe(DEFAULT_TAX_EXEMPTION_NOTE);
  });
});
