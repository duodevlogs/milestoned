import { describe, it, expect } from "vitest";
import { generateProposalSchema } from "./proposal-generation.schema";

const VALID_INPUT = {
  clientName: "Acme Co",
  projectName: "Website redesign",
  problemNotes: "Their current site doesn't convert.",
  approachNotes: "Redesign in three phases.",
  whyUsNotes: "We've shipped a dozen redesigns.",
  scopeOverview: "Discovery, design, build, launch.",
  timelineOverview: "8 weeks, phase by phase.",
  budget: 9000,
  milestones: [
    { label: "Discovery", pct: 50 },
    { label: "Launch", pct: 50 },
  ],
};

describe("generateProposalSchema", () => {
  it("accepts a valid payload with only the required fields", () => {
    expect(() => generateProposalSchema.parse(VALID_INPUT)).not.toThrow();
  });

  it("defaults addOns, validityDays, and includeAcceptanceSignature", () => {
    const parsed = generateProposalSchema.parse(VALID_INPUT);
    expect(parsed.addOns).toEqual([]);
    expect(parsed.validityDays).toBe(30);
    expect(parsed.includeAcceptanceSignature).toBe(true);
  });

  it("rejects milestones that don't add up to 100%", () => {
    expect(() =>
      generateProposalSchema.parse({
        ...VALID_INPUT,
        milestones: [{ label: "Discovery", pct: 40 }],
      })
    ).toThrow();
  });

  it("rejects an add-on with a non-positive amount", () => {
    expect(() =>
      generateProposalSchema.parse({
        ...VALID_INPUT,
        addOns: [{ label: "Extra revision round", amount: 0 }],
      })
    ).toThrow();
  });

  it("rejects an empty problemNotes/approachNotes/whyUsNotes", () => {
    expect(() => generateProposalSchema.parse({ ...VALID_INPUT, problemNotes: "" })).toThrow();
    expect(() => generateProposalSchema.parse({ ...VALID_INPUT, approachNotes: "" })).toThrow();
    expect(() => generateProposalSchema.parse({ ...VALID_INPUT, whyUsNotes: "" })).toThrow();
  });
});
