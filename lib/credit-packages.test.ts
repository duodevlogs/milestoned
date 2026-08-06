import { describe, it, expect } from "vitest";
import { CREDIT_PACKAGES, priceCentsFor, formatPackagePrice } from "./credit-packages";

describe("priceCentsFor", () => {
  it("returns the regular price for a non-founding member", () => {
    expect(priceCentsFor(CREDIT_PACKAGES.small, false)).toBe(500);
    expect(priceCentsFor(CREDIT_PACKAGES.large, false)).toBe(900);
  });

  it("returns the discounted founding-member price", () => {
    expect(priceCentsFor(CREDIT_PACKAGES.small, true)).toBe(350);
    expect(priceCentsFor(CREDIT_PACKAGES.large, true)).toBe(600);
  });
});

describe("formatPackagePrice", () => {
  it("shows whole dollar amounts with no decimals", () => {
    expect(formatPackagePrice(500)).toBe("$5");
    expect(formatPackagePrice(900)).toBe("$9");
  });

  it("shows decimals only when the price isn't a whole dollar", () => {
    // Regression: formatCurrency()'s Math.round would silently turn $3.50 into $4.
    expect(formatPackagePrice(350)).toBe("$3.50");
    expect(formatPackagePrice(600)).toBe("$6");
  });
});

describe("bulk-pack pricing economics", () => {
  /*
   * Regression test for a real pricing bug: the large pack must be strictly
   * cheaper per credit than the small pack at both tiers, otherwise a
   * rational buyer just buys the small pack twice instead of the "bulk" one.
   */
  it("regular pricing: the 20-credit pack is cheaper per credit than the 10-credit pack", () => {
    const smallPerCredit = CREDIT_PACKAGES.small.regularPriceCents / CREDIT_PACKAGES.small.credits;
    const largePerCredit = CREDIT_PACKAGES.large.regularPriceCents / CREDIT_PACKAGES.large.credits;
    expect(largePerCredit).toBeLessThan(smallPerCredit);
  });

  it("founding pricing: the 20-credit pack is cheaper per credit than the 10-credit pack", () => {
    const smallPerCredit =
      CREDIT_PACKAGES.small.foundingPriceCents / CREDIT_PACKAGES.small.credits;
    const largePerCredit =
      CREDIT_PACKAGES.large.foundingPriceCents / CREDIT_PACKAGES.large.credits;
    expect(largePerCredit).toBeLessThan(smallPerCredit);
  });

  it("buying the small pack twice never beats buying the large pack once, at either tier", () => {
    for (const isFoundingMember of [true, false]) {
      const smallTwice = priceCentsFor(CREDIT_PACKAGES.small, isFoundingMember) * 2;
      const largeOnce = priceCentsFor(CREDIT_PACKAGES.large, isFoundingMember);
      const creditsFromSmallTwice = CREDIT_PACKAGES.small.credits * 2;
      expect(creditsFromSmallTwice).toBe(CREDIT_PACKAGES.large.credits);
      expect(largeOnce).toBeLessThan(smallTwice);
    }
  });
});
