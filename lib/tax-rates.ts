/*
 * Country -> standard VAT/GST/sales-tax rate, used only to pre-fill the tax
 * rate field when starting a new invoice. These are typical national
 * headline rates, not tax advice — they're always editable per invoice, and
 * several countries (US, Canada, Brazil) don't have one federal rate at all,
 * so those default to 0 and the consultant sets the real rate themselves.
 */

export interface CountryTaxInfo {
  code: string;
  name: string;
  vatRatePct: number;
}

export const COUNTRIES: CountryTaxInfo[] = [
  { code: "AT", name: "Austria", vatRatePct: 20 },
  { code: "AU", name: "Australia", vatRatePct: 10 },
  { code: "AE", name: "United Arab Emirates", vatRatePct: 5 },
  { code: "BD", name: "Bangladesh", vatRatePct: 15 },
  { code: "BE", name: "Belgium", vatRatePct: 21 },
  { code: "BG", name: "Bulgaria", vatRatePct: 20 },
  { code: "BR", name: "Brazil", vatRatePct: 0 },
  { code: "CA", name: "Canada", vatRatePct: 5 },
  { code: "CH", name: "Switzerland", vatRatePct: 8.1 },
  { code: "CY", name: "Cyprus", vatRatePct: 19 },
  { code: "CZ", name: "Czechia", vatRatePct: 21 },
  { code: "DE", name: "Germany", vatRatePct: 19 },
  { code: "DK", name: "Denmark", vatRatePct: 25 },
  { code: "EE", name: "Estonia", vatRatePct: 22 },
  { code: "ES", name: "Spain", vatRatePct: 21 },
  { code: "FI", name: "Finland", vatRatePct: 25.5 },
  { code: "FR", name: "France", vatRatePct: 20 },
  { code: "GB", name: "United Kingdom", vatRatePct: 20 },
  { code: "GR", name: "Greece", vatRatePct: 24 },
  { code: "HR", name: "Croatia", vatRatePct: 25 },
  { code: "HU", name: "Hungary", vatRatePct: 27 },
  { code: "IE", name: "Ireland", vatRatePct: 23 },
  { code: "IN", name: "India", vatRatePct: 18 },
  { code: "IT", name: "Italy", vatRatePct: 22 },
  { code: "JP", name: "Japan", vatRatePct: 10 },
  { code: "LT", name: "Lithuania", vatRatePct: 21 },
  { code: "LU", name: "Luxembourg", vatRatePct: 17 },
  { code: "LV", name: "Latvia", vatRatePct: 21 },
  { code: "MT", name: "Malta", vatRatePct: 18 },
  { code: "MX", name: "Mexico", vatRatePct: 16 },
  { code: "NL", name: "Netherlands", vatRatePct: 21 },
  { code: "NO", name: "Norway", vatRatePct: 25 },
  { code: "NZ", name: "New Zealand", vatRatePct: 15 },
  { code: "PL", name: "Poland", vatRatePct: 23 },
  { code: "PT", name: "Portugal", vatRatePct: 23 },
  { code: "RO", name: "Romania", vatRatePct: 19 },
  { code: "SE", name: "Sweden", vatRatePct: 25 },
  { code: "SG", name: "Singapore", vatRatePct: 9 },
  { code: "SI", name: "Slovenia", vatRatePct: 22 },
  { code: "SK", name: "Slovakia", vatRatePct: 20 },
  { code: "US", name: "United States", vatRatePct: 0 },
  { code: "ZA", name: "South Africa", vatRatePct: 15 },
].sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [string, ...string[]];

export function getSuggestedTaxRate(countryCode: string | null | undefined): number | null {
  if (!countryCode) return null;
  const country = COUNTRIES.find((c) => c.code === countryCode);
  return country ? country.vatRatePct : null;
}

export type TaxStatus = "standard" | "exempt";

export const TAX_STATUSES: [TaxStatus, ...TaxStatus[]] = ["standard", "exempt"];

/**
 * Starting text only — the account owner (with their tax advisor) owns the
 * exact legal wording, so it's editable in Account settings. Germany's
 * small-business rule (Kleinunternehmerregelung, §19 UStG) is the case this
 * was written for; other countries have their own equivalents.
 */
export const DEFAULT_TAX_EXEMPTION_NOTE =
  "Kein Ausweis von Umsatzsteuer aufgrund der Kleinunternehmerregelung gemäß § 19 UStG. (No VAT charged: small business exemption under § 19 UStG.)";

/**
 * The tax an invoice actually carries. An exempt account never shows VAT —
 * VAT printed on an invoice is generally owed even by an exempt business —
 * so the requested rate is ignored (not just defaulted) and the exemption
 * note is attached instead. Enforced server-side, not only in the wizard.
 */
export function resolveInvoiceTax(
  taxStatus: TaxStatus,
  requestedRatePct: number,
  exemptionNote: string | null | undefined
): { taxRatePct: number; taxExemptionNote: string | null } {
  if (taxStatus === "exempt") {
    return { taxRatePct: 0, taxExemptionNote: exemptionNote?.trim() || DEFAULT_TAX_EXEMPTION_NOTE };
  }
  return { taxRatePct: requestedRatePct, taxExemptionNote: null };
}
