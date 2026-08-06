import { describe, it, expect } from "vitest";
import { updateBrandingSchema, updateBusinessDetailsSchema } from "./user.schema";

describe("updateBrandingSchema", () => {
  it("accepts an empty payload — every field is optional", () => {
    expect(() => updateBrandingSchema.parse({})).not.toThrow();
  });

  it("rejects a business name over 80 characters", () => {
    expect(() =>
      updateBrandingSchema.parse({ businessName: "a".repeat(81) })
    ).toThrow();
  });

  it("rejects a logoUrl that isn't a valid URL", () => {
    expect(() => updateBrandingSchema.parse({ logoUrl: "not-a-url" })).toThrow();
    expect(() =>
      updateBrandingSchema.parse({ logoUrl: "https://example.com/logo.png" })
    ).not.toThrow();
  });
});

describe("updateBusinessDetailsSchema", () => {
  it("accepts an empty payload — every field is optional", () => {
    expect(() => updateBusinessDetailsSchema.parse({})).not.toThrow();
  });

  it("enforces the max length on each field", () => {
    expect(() =>
      updateBusinessDetailsSchema.parse({ businessAddress: "a".repeat(301) })
    ).toThrow();
    expect(() => updateBusinessDetailsSchema.parse({ taxId: "a".repeat(61) })).toThrow();
    expect(() =>
      updateBusinessDetailsSchema.parse({ companyRegistration: "a".repeat(61) })
    ).toThrow();
    expect(() =>
      updateBusinessDetailsSchema.parse({ paymentInstructions: "a".repeat(501) })
    ).toThrow();
  });
});
