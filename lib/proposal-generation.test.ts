import { describe, it, expect } from "vitest";
import { addDays, computeAddOnsTotal } from "./proposal-generation";

describe("addDays", () => {
  it("adds days within the same month", () => {
    expect(addDays("2026-08-01", 10)).toBe("2026-08-11");
  });

  it("rolls over into the next month", () => {
    expect(addDays("2026-08-25", 10)).toBe("2026-09-04");
  });

  it("rolls over into the next year", () => {
    expect(addDays("2026-12-28", 10)).toBe("2027-01-07");
  });

  it("supports zero days", () => {
    expect(addDays("2026-08-01", 0)).toBe("2026-08-01");
  });
});

describe("computeAddOnsTotal", () => {
  it("sums the amounts", () => {
    expect(computeAddOnsTotal([{ amount: 500 }, { amount: 250 }])).toBe(750);
  });

  it("returns 0 for an empty list", () => {
    expect(computeAddOnsTotal([])).toBe(0);
  });
});
