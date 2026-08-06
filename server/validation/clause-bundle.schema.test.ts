import { describe, it, expect } from "vitest";
import { createClauseBundleSchema } from "./clause-bundle.schema";

const BLANK_CLAUSES = {
  ip: false,
  confidentiality: false,
  liability: false,
  termination: false,
  terminationNoticeDays: "",
  latePayment: false,
  latePaymentGraceDays: "",
  latePaymentFeePct: "",
  warranty: false,
  revisions: false,
  governingLaw: false,
  governingLawJurisdiction: "",
  customClause: false,
  customClauseTitle: "",
  customClauseText: "",
};

describe("createClauseBundleSchema", () => {
  it("accepts a valid bundle", () => {
    expect(() =>
      createClauseBundleSchema.parse({ name: "Standard terms", clauses: BLANK_CLAUSES })
    ).not.toThrow();
  });

  it("requires a non-empty name", () => {
    expect(() =>
      createClauseBundleSchema.parse({ name: "", clauses: BLANK_CLAUSES })
    ).toThrow();
  });

  it("still enforces the underlying clause-selection refinements", () => {
    expect(() =>
      createClauseBundleSchema.parse({
        name: "x",
        clauses: { ...BLANK_CLAUSES, governingLaw: true },
      })
    ).toThrow();
  });
});
