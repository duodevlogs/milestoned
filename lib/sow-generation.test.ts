import { describe, it, expect } from "vitest";
import { computeSowMilestones, buildGoverningTermsNote } from "./sow-generation";

describe("computeSowMilestones", () => {
  it("computes amounts from percentages and keeps target dates", () => {
    const result = computeSowMilestones(
      [
        { label: "Discovery", pct: 50, targetDate: "2026-09-01" },
        { label: "Launch", pct: 50, targetDate: "2026-10-01" },
      ],
      10000
    );
    expect(result).toEqual([
      { label: "Discovery", pct: 50, amount: 5000, targetDate: "2026-09-01" },
      { label: "Launch", pct: 50, amount: 5000, targetDate: "2026-10-01" },
    ]);
  });

  it("falls back to a default label and null date when omitted", () => {
    const result = computeSowMilestones([{ label: "", pct: 100, targetDate: "" }], 1000);
    expect(result).toEqual([{ label: "Untitled milestone", pct: 100, amount: 1000, targetDate: null }]);
  });
});

describe("buildGoverningTermsNote", () => {
  it("references the linked contract when present", () => {
    expect(buildGoverningTermsNote("DDL-CTR-2026-003")).toContain("DDL-CTR-2026-003");
  });

  it("falls back to a generic reference when no contract is linked", () => {
    const note = buildGoverningTermsNote(null);
    expect(note).not.toContain("null");
    expect(note.length).toBeGreaterThan(0);
  });
});
