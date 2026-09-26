/*
 * The ways an invoice can say "pay me here". Each saved method has a type
 * from this registry, which decides which fields it asks for; on an invoice
 * a method is rendered as a title plus "Label: value" lines. Pure data and
 * formatting — shared by the Account settings form, the invoice wizard, the
 * server-side validation, and the PDF.
 */

export interface PaymentFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface PaymentMethodType {
  id: string;
  label: string;
  fields: PaymentFieldDef[];
}

export const PAYMENT_METHOD_TYPES: PaymentMethodType[] = [
  {
    id: "paypal",
    label: "PayPal",
    fields: [
      { key: "accountName", label: "Account name", placeholder: "e.g. Jane Doe" },
      { key: "email", label: "PayPal email", placeholder: "you@example.com" },
      { key: "link", label: "PayPal.me link (optional)", placeholder: "paypal.me/yourname" },
    ],
  },
  {
    id: "sepa",
    label: "Bank transfer (SEPA, EUR)",
    fields: [
      { key: "accountHolder", label: "Account holder" },
      { key: "iban", label: "IBAN", placeholder: "DE00 0000 0000 0000 0000 00" },
      { key: "bic", label: "BIC" },
      { key: "bankName", label: "Bank name" },
    ],
  },
  {
    id: "swift",
    label: "International wire (SWIFT)",
    fields: [
      { key: "accountHolder", label: "Account holder" },
      { key: "accountNumber", label: "Account number / IBAN" },
      { key: "swift", label: "SWIFT / BIC" },
      { key: "bankName", label: "Bank name" },
      { key: "bankAddress", label: "Bank address" },
      { key: "routing", label: "Routing / branch code (optional)" },
      { key: "correspondent", label: "Correspondent bank (optional)", multiline: true },
    ],
  },
  {
    id: "ach",
    label: "US bank transfer (ACH / wire)",
    fields: [
      { key: "accountHolder", label: "Account holder" },
      { key: "accountNumber", label: "Account number" },
      { key: "routingNumber", label: "ABA routing number" },
      { key: "accountType", label: "Account type", placeholder: "Checking or savings" },
      { key: "bankName", label: "Bank name" },
    ],
  },
  {
    id: "uk",
    label: "UK bank transfer",
    fields: [
      { key: "accountHolder", label: "Account holder" },
      { key: "sortCode", label: "Sort code" },
      { key: "accountNumber", label: "Account number" },
      { key: "bankName", label: "Bank name" },
    ],
  },
  {
    id: "wise",
    label: "Wise",
    fields: [
      { key: "accountName", label: "Account name" },
      { key: "email", label: "Wise email" },
      { key: "details", label: "Account details (optional)", multiline: true },
    ],
  },
  {
    id: "revolut",
    label: "Revolut",
    fields: [
      { key: "accountName", label: "Account name" },
      { key: "handle", label: "IBAN or @Revtag" },
    ],
  },
  { id: "payoneer", label: "Payoneer", fields: [{ key: "email", label: "Payoneer email" }] },
  {
    id: "link",
    label: "Payment link (Stripe etc.)",
    fields: [{ key: "url", label: "Payment link", placeholder: "https://…" }],
  },
  {
    id: "crypto",
    label: "Cryptocurrency",
    fields: [
      { key: "coin", label: "Currency / network", placeholder: "e.g. USDT (TRC-20)" },
      { key: "address", label: "Wallet address" },
    ],
  },
  { id: "zelle", label: "Zelle", fields: [{ key: "contact", label: "Email or phone" }] },
  { id: "venmo", label: "Venmo", fields: [{ key: "handle", label: "@handle" }] },
  { id: "cashapp", label: "Cash App", fields: [{ key: "cashtag", label: "$Cashtag" }] },
  {
    id: "alipay",
    label: "Alipay",
    fields: [
      { key: "accountName", label: "Account name" },
      { key: "id", label: "Alipay ID" },
    ],
  },
  { id: "wechat", label: "WeChat Pay", fields: [{ key: "id", label: "WeChat ID" }] },
  { id: "upi", label: "UPI", fields: [{ key: "upiId", label: "UPI ID" }] },
  {
    id: "cheque",
    label: "Cheque",
    fields: [
      { key: "payableTo", label: "Payable to" },
      { key: "mailTo", label: "Send to", multiline: true },
    ],
  },
  { id: "cash", label: "Cash (in person)", fields: [{ key: "note", label: "Note (optional)" }] },
  {
    id: "other",
    label: "Other",
    fields: [
      { key: "title", label: "Method name", placeholder: "e.g. bKash" },
      { key: "details", label: "Details", multiline: true },
    ],
  },
];

export const PAYMENT_METHOD_TYPE_IDS = PAYMENT_METHOD_TYPES.map((t) => t.id) as [string, ...string[]];

export const MAX_PAYMENT_METHODS = 15;

export interface SavedPaymentMethod {
  id: string;
  type: string;
  /** Optional display name, e.g. "PayPal (personal)" — falls back to the type's own name. */
  label: string;
  fields: Record<string, string>;
  /** Pre-ticked on every new invoice. */
  isDefault: boolean;
}

/** One method as it's printed on an invoice. */
export interface FormattedPaymentMethod {
  title: string;
  lines: string[];
}

export function getPaymentMethodType(typeId: string): PaymentMethodType | undefined {
  return PAYMENT_METHOD_TYPES.find((t) => t.id === typeId);
}

export function formatPaymentMethod(method: Pick<SavedPaymentMethod, "type" | "label" | "fields">): FormattedPaymentMethod {
  const type = getPaymentMethodType(method.type);
  const defaultTitle =
    method.type === "other" ? method.fields.title?.trim() || "Payment details" : type?.label ?? "Payment details";
  const lines: string[] = [];
  for (const field of type?.fields ?? []) {
    // An "Other" method's title is its heading, not a line under it.
    if (method.type === "other" && field.key === "title") continue;
    const value = method.fields[field.key]?.trim();
    if (!value) continue;
    // "Other" is free text under its own heading — no "Details:" prefix.
    lines.push(method.type === "other" ? value : `${field.label.replace(/ \(optional\)$/, "")}: ${value}`);
  }
  return { title: method.label.trim() || defaultTitle, lines };
}

export const PAYMENT_FIELD_MAX = 300;
export const PAYMENT_MULTILINE_MAX = 800;

/**
 * Keeps only the fields the type defines, trimmed and non-empty. Anything
 * the type doesn't know is dropped (never stored), and an over-long value or
 * an entirely empty method is reported as an error string.
 */
export function normalizePaymentFields(
  typeId: string,
  raw: Record<string, string>
): { fields: Record<string, string>; error: string | null } {
  const type = getPaymentMethodType(typeId);
  if (!type) return { fields: {}, error: "Unknown payment method type." };

  const fields: Record<string, string> = {};
  for (const def of type.fields) {
    const value = (raw[def.key] ?? "").trim();
    if (!value) continue;
    const max = def.multiline ? PAYMENT_MULTILINE_MAX : PAYMENT_FIELD_MAX;
    if (value.length > max) return { fields: {}, error: `${def.label} is too long (max ${max} characters).` };
    fields[def.key] = value;
  }
  // "Cash" is valid with nothing filled in; every other type needs something to pay to.
  if (Object.keys(fields).length === 0 && typeId !== "cash") {
    return { fields: {}, error: "Fill in at least one field." };
  }
  if (typeId === "other" && !fields.title) return { fields: {}, error: "Give this method a name." };
  return { fields, error: null };
}
