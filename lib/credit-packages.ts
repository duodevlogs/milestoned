/*
 * Shared between client (top-up page) and server (checkout/stripe service) —
 * plain data, no secrets, no "server-only" import.
 *
 * Founding members (anyone who signs up before launch) get a permanently
 * discounted top-up rate — $3.50/$6 instead of $5/$9. Which price a given
 * buyer actually pays is always resolved server-side from their verified
 * users.isFoundingMember flag, never from client input.
 *
 * Per-credit price must strictly decrease with pack size (large pack should
 * always be the better deal), otherwise a rational buyer just buys the
 * small pack twice instead of the "bulk" one:
 *   regular:  $5/10 = $0.50/credit   vs  $9/20 = $0.45/credit
 *   founding: $3.50/10 = $0.35/credit vs  $6/20 = $0.30/credit
 */
export type CreditPackageId = "small" | "large";

export interface CreditPackage {
  id: CreditPackageId;
  credits: number;
  regularPriceCents: number;
  foundingPriceCents: number;
  label: string;
}

export const CREDIT_PACKAGES: Record<CreditPackageId, CreditPackage> = {
  small: {
    id: "small",
    credits: 10,
    regularPriceCents: 500,
    foundingPriceCents: 350,
    label: "10 credits",
  },
  large: {
    id: "large",
    credits: 20,
    regularPriceCents: 900,
    foundingPriceCents: 600,
    label: "20 credits",
  },
};

export function priceCentsFor(pkg: CreditPackage, isFoundingMember: boolean): number {
  return isFoundingMember ? pkg.foundingPriceCents : pkg.regularPriceCents;
}

/**
 * Formats a package price in dollars, showing cents only when the price
 * isn't a whole dollar amount (e.g. $5, but $3.50) — document-generation.ts's
 * formatCurrency() always rounds to whole dollars, which would silently
 * turn $3.50 into $4, so package prices use this instead.
 */
export function formatPackagePrice(cents: number): string {
  const hasCents = cents % 100 !== 0;
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
