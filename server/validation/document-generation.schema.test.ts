import { describe, it, expect } from "vitest";
import {
  milestoneInputSchema,
  clauseSelectionSchema,
  generateDocumentSchema,
} from "./document-generation.schema";

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

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    docType: "contract",
    clientName: "Acme Robotics",
    projectName: "Marketing site redesign",
    budget: 9000,
    scope: "Rebuild the marketing site.",
    milestones: [
      { label: "Discovery", pct: 50 },
      { label: "Delivery", pct: 50 },
    ],
    clauses: BLANK_CLAUSES,
    ...overrides,
  };
}

describe("milestoneInputSchema", () => {
  it("requires a non-empty label", () => {
    expect(() => milestoneInputSchema.parse({ label: "", pct: 50 })).toThrow();
  });

  it("requires pct between 0 and 100", () => {
    expect(() => milestoneInputSchema.parse({ label: "x", pct: -1 })).toThrow();
    expect(() => milestoneInputSchema.parse({ label: "x", pct: 101 })).toThrow();
    expect(() => milestoneInputSchema.parse({ label: "x", pct: 50 })).not.toThrow();
  });
});

describe("clauseSelectionSchema", () => {
  it("accepts a fully blank selection", () => {
    expect(() => clauseSelectionSchema.parse(BLANK_CLAUSES)).not.toThrow();
  });

  it("rejects governingLaw checked with no jurisdiction typed", () => {
    expect(() =>
      clauseSelectionSchema.parse({ ...BLANK_CLAUSES, governingLaw: true })
    ).toThrow();
  });

  it("accepts governingLaw checked once a jurisdiction is typed", () => {
    expect(() =>
      clauseSelectionSchema.parse({
        ...BLANK_CLAUSES,
        governingLaw: true,
        governingLawJurisdiction: "Germany",
      })
    ).not.toThrow();
  });

  it("rejects a custom clause checked with no text", () => {
    expect(() => clauseSelectionSchema.parse({ ...BLANK_CLAUSES, customClause: true })).toThrow();
  });
});

describe("generateDocumentSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(() => generateDocumentSchema.parse(validPayload())).not.toThrow();
  });

  it("rejects milestones that don't add up to 100%", () => {
    expect(() =>
      generateDocumentSchema.parse(
        validPayload({ milestones: [{ label: "Only half", pct: 50 }] })
      )
    ).toThrow();
  });

  it("tolerates floating-point rounding right at 100%", () => {
    expect(() =>
      generateDocumentSchema.parse(
        validPayload({
          milestones: [
            { label: "a", pct: 33.33 },
            { label: "b", pct: 33.33 },
            { label: "c", pct: 33.34 },
          ],
        })
      )
    ).not.toThrow();
  });

  it("rejects a non-positive budget", () => {
    expect(() => generateDocumentSchema.parse(validPayload({ budget: 0 }))).toThrow();
    expect(() => generateDocumentSchema.parse(validPayload({ budget: -100 }))).toThrow();
  });

  it("rejects an empty client name or scope", () => {
    expect(() => generateDocumentSchema.parse(validPayload({ clientName: "" }))).toThrow();
    expect(() => generateDocumentSchema.parse(validPayload({ scope: "" }))).toThrow();
  });

  it("rejects an unknown doc type", () => {
    expect(() => generateDocumentSchema.parse(validPayload({ docType: "quote" }))).toThrow();
  });

  it("defaults deliverables to an empty string when omitted", () => {
    const result = generateDocumentSchema.parse(validPayload());
    expect(result.deliverables).toBe("");
  });
});
