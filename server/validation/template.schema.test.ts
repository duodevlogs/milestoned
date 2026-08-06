import { describe, it, expect } from "vitest";
import { createTemplateSchema, cloneDocumentSchema } from "./template.schema";

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

describe("createTemplateSchema", () => {
  it("accepts a valid preset", () => {
    expect(() =>
      createTemplateSchema.parse({
        name: "Standard SOW",
        docType: "sow",
        scope: "Build a marketing site.",
        clauses: BLANK_CLAUSES,
      })
    ).not.toThrow();
  });

  it("requires a non-empty name and scope", () => {
    expect(() =>
      createTemplateSchema.parse({
        name: "",
        docType: "sow",
        scope: "x",
        clauses: BLANK_CLAUSES,
      })
    ).toThrow();
    expect(() =>
      createTemplateSchema.parse({
        name: "x",
        docType: "sow",
        scope: "",
        clauses: BLANK_CLAUSES,
      })
    ).toThrow();
  });

  it("defaults deliverables to an empty string", () => {
    const result = createTemplateSchema.parse({
      name: "x",
      docType: "sow",
      scope: "x",
      clauses: BLANK_CLAUSES,
    });
    expect(result.deliverables).toBe("");
  });
});

describe("cloneDocumentSchema", () => {
  it("requires a valid document id", () => {
    expect(() =>
      cloneDocumentSchema.parse({ name: "x", documentId: "not-a-uuid" })
    ).toThrow();
    expect(() =>
      cloneDocumentSchema.parse({
        name: "x",
        documentId: "00000000-0000-0000-0000-000000000000",
      })
    ).not.toThrow();
  });
});
