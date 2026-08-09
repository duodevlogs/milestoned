import { describe, it, expect } from "vitest";
import { generateSowSchema } from "./sow-generation.schema";
import { defaultClauseSelection } from "@/lib/contract-clauses";

const VALID_INPUT = {
  clientName: "Acme Co",
  projectName: "Website redesign",
  overviewNotes: "Rebuilding their marketing site on the existing CMS.",
  scopeNotes: "Homepage, product pages, and contact flow.",
  deliverables: [{ item: "New homepage", acceptanceCriteria: "Approved by client stakeholder." }],
  budget: 9000,
  milestones: [
    { label: "Discovery", pct: 50, targetDate: "2026-09-01" },
    { label: "Launch", pct: 50, targetDate: "2026-10-01" },
  ],
  clauses: defaultClauseSelection("sow"),
};

describe("generateSowSchema", () => {
  it("accepts a valid payload with only the required fields", () => {
    expect(() => generateSowSchema.parse(VALID_INPUT)).not.toThrow();
  });

  it("defaults version, outOfScope, clientResponsibilities, assumptions", () => {
    const parsed = generateSowSchema.parse(VALID_INPUT);
    expect(parsed.version).toBe("1.0");
    expect(parsed.outOfScope).toBe("");
    expect(parsed.clientResponsibilities).toBe("");
    expect(parsed.assumptions).toBe("");
  });

  it("rejects milestones that don't add up to 100%", () => {
    expect(() =>
      generateSowSchema.parse({
        ...VALID_INPUT,
        milestones: [{ label: "Discovery", pct: 40, targetDate: "" }],
      })
    ).toThrow();
  });

  it("rejects an empty deliverables list", () => {
    expect(() => generateSowSchema.parse({ ...VALID_INPUT, deliverables: [] })).toThrow();
  });

  it("rejects a deliverable missing acceptance criteria", () => {
    expect(() =>
      generateSowSchema.parse({
        ...VALID_INPUT,
        deliverables: [{ item: "New homepage", acceptanceCriteria: "" }],
      })
    ).toThrow();
  });

  it("rejects empty overviewNotes/scopeNotes", () => {
    expect(() => generateSowSchema.parse({ ...VALID_INPUT, overviewNotes: "" })).toThrow();
    expect(() => generateSowSchema.parse({ ...VALID_INPUT, scopeNotes: "" })).toThrow();
  });
});
