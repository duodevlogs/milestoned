import { describe, it, expect } from "vitest";
import {
  computeMilestoneAmounts,
  formatCurrency,
  formatDateLabel,
  formatTimelineLabel,
} from "./document-generation";

describe("computeMilestoneAmounts", () => {
  it("computes each milestone's dollar amount from its percentage of the budget", () => {
    const result = computeMilestoneAmounts(
      [
        { label: "Discovery", pct: 20 },
        { label: "Build", pct: 80 },
      ],
      9000
    );
    expect(result).toEqual([
      { label: "Discovery", pct: 20, amount: 1800 },
      { label: "Build", pct: 80, amount: 7200 },
    ]);
  });

  it("rounds fractional amounts to the nearest dollar", () => {
    const result = computeMilestoneAmounts([{ label: "One third", pct: 33.33 }], 100);
    expect(result[0].amount).toBe(33);
  });

  it("falls back to a placeholder label when the milestone name is blank", () => {
    const result = computeMilestoneAmounts([{ label: "", pct: 100 }], 1000);
    expect(result[0].label).toBe("Untitled milestone");
  });
});

describe("formatCurrency", () => {
  it("rounds to the nearest whole dollar and adds thousands separators", () => {
    expect(formatCurrency(9000)).toBe("$9,000");
    expect(formatCurrency(1234.6)).toBe("$1,235");
  });

  it("falls back to $0 for non-finite input", () => {
    expect(formatCurrency(NaN)).toBe("$0");
    expect(formatCurrency(Infinity)).toBe("$0");
  });
});

describe("formatDateLabel", () => {
  it("formats a YYYY-MM-DD string as a short human date", () => {
    expect(formatDateLabel("2026-08-20")).toBe("Aug 20, 2026");
  });

  it("returns null for missing or invalid dates", () => {
    expect(formatDateLabel(null)).toBeNull();
    expect(formatDateLabel(undefined)).toBeNull();
    expect(formatDateLabel("not-a-date")).toBeNull();
  });
});

describe("formatTimelineLabel", () => {
  it("shows a start→delivery range when both dates are set", () => {
    expect(formatTimelineLabel("2026-08-01", "2026-09-01")).toBe("Aug 1, 2026 → Sep 1, 2026");
  });

  it("shows only a delivery date as 'By <date>'", () => {
    expect(formatTimelineLabel(null, "2026-09-01")).toBe("By Sep 1, 2026");
  });

  it("shows only a start date as 'From <date>'", () => {
    expect(formatTimelineLabel("2026-08-01", null)).toBe("From Aug 1, 2026");
  });

  it("falls back to 'To be set' when neither date is set", () => {
    expect(formatTimelineLabel(null, null)).toBe("To be set");
  });
});
