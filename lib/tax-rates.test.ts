import { describe, it, expect } from "vitest";
import { COUNTRIES, COUNTRY_CODES, getSuggestedTaxRate } from "./tax-rates";

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
