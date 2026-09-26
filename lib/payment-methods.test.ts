import { describe, it, expect } from "vitest";
import {
  PAYMENT_METHOD_TYPES,
  PAYMENT_METHOD_TYPE_IDS,
  formatPaymentMethod,
  getPaymentMethodType,
  normalizePaymentFields,
} from "./payment-methods";

describe("PAYMENT_METHOD_TYPES", () => {
  it("has unique type ids and unique field keys within each type", () => {
    expect(new Set(PAYMENT_METHOD_TYPE_IDS).size).toBe(PAYMENT_METHOD_TYPES.length);
    for (const type of PAYMENT_METHOD_TYPES) {
      const keys = type.fields.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("covers PayPal, the bank-transfer variants, and a catch-all", () => {
    for (const id of ["paypal", "sepa", "swift", "ach", "uk", "other"]) {
      expect(getPaymentMethodType(id)).toBeDefined();
    }
  });
});

describe("formatPaymentMethod", () => {
  it("titles by type and prints only the filled fields, in field order", () => {
    const out = formatPaymentMethod({
      type: "paypal",
      label: "",
      fields: { email: "me@example.com", accountName: "Jane Doe", link: "  " },
    });
    expect(out).toEqual({
      title: "PayPal",
      lines: ["Account name: Jane Doe", "PayPal email: me@example.com"],
    });
  });

  it("uses the custom label as the title when set", () => {
    expect(formatPaymentMethod({ type: "sepa", label: "Business account", fields: { iban: "DE00" } }).title).toBe(
      "Business account"
    );
  });

  it("drops '(optional)' from printed labels", () => {
    const out = formatPaymentMethod({ type: "swift", label: "", fields: { routing: "391" } });
    expect(out.lines).toEqual(["Routing / branch code: 391"]);
  });

  it("uses an Other method's own name as its heading, not as a line", () => {
    const out = formatPaymentMethod({ type: "other", label: "", fields: { title: "bKash", details: "01700000000" } });
    expect(out).toEqual({ title: "bKash", lines: ["01700000000"] });
  });

  it("falls back safely for an unknown type", () => {
    expect(formatPaymentMethod({ type: "nope", label: "", fields: {} })).toEqual({ title: "Payment details", lines: [] });
  });
});

describe("normalizePaymentFields", () => {
  it("keeps only known, non-empty fields, trimmed", () => {
    const out = normalizePaymentFields("paypal", { email: " me@x.com ", accountName: "", junk: "drop me" });
    expect(out).toEqual({ fields: { email: "me@x.com" }, error: null });
  });

  it("rejects an empty method, an unknown type, and an over-long value", () => {
    expect(normalizePaymentFields("paypal", {}).error).toBeTruthy();
    expect(normalizePaymentFields("nope", { a: "b" }).error).toBeTruthy();
    expect(normalizePaymentFields("paypal", { email: "a".repeat(301) }).error).toBeTruthy();
  });

  it("allows an empty Cash method but requires a name for Other", () => {
    expect(normalizePaymentFields("cash", {}).error).toBeNull();
    expect(normalizePaymentFields("other", { details: "x" }).error).toBeTruthy();
  });
});
