import { describe, it, expect } from "vitest";
import { creditPackageIdSchema } from "./checkout.schema";

describe("creditPackageIdSchema", () => {
  it("accepts the two real package ids", () => {
    expect(creditPackageIdSchema.parse("small")).toBe("small");
    expect(creditPackageIdSchema.parse("large")).toBe("large");
  });

  it("rejects anything else, including a client trying to invent a cheaper package", () => {
    expect(() => creditPackageIdSchema.parse("medium")).toThrow();
    expect(() => creditPackageIdSchema.parse("free")).toThrow();
    expect(() => creditPackageIdSchema.parse("")).toThrow();
    expect(() => creditPackageIdSchema.parse(undefined)).toThrow();
  });
});
