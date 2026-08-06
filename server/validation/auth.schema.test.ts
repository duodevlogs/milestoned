import { describe, it, expect } from "vitest";
import {
  nextPathSchema,
  signInSchema,
  signUpSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "./auth.schema";

describe("nextPathSchema", () => {
  it("accepts a normal internal path", () => {
    expect(nextPathSchema.parse("/dashboard")).toBe("/dashboard");
    expect(nextPathSchema.parse("/generate/invoice")).toBe("/generate/invoice");
  });

  it("falls back to /dashboard for a protocol-relative URL (open-redirect attempt)", () => {
    // "//evil.com" is browser-navigable to a different host despite starting with "/".
    expect(nextPathSchema.parse("//evil.com")).toBe("/dashboard");
  });

  it("falls back to /dashboard for an absolute URL to another host", () => {
    expect(nextPathSchema.parse("https://evil.com")).toBe("/dashboard");
    expect(nextPathSchema.parse("http://evil.com/phish")).toBe("/dashboard");
  });

  it("falls back to /dashboard for a value that isn't a path at all", () => {
    expect(nextPathSchema.parse("dashboard")).toBe("/dashboard");
    expect(nextPathSchema.parse(null)).toBe("/dashboard");
    expect(nextPathSchema.parse(undefined)).toBe("/dashboard");
    expect(nextPathSchema.parse(123)).toBe("/dashboard");
  });
});

describe("signInSchema", () => {
  it("accepts a valid email/password", () => {
    const result = signInSchema.parse({ email: "test@milestoned.local", password: "hunter2", next: "/dashboard" });
    expect(result.email).toBe("test@milestoned.local");
  });

  it("rejects an invalid email", () => {
    expect(() => signInSchema.parse({ email: "not-an-email", password: "x", next: "/" })).toThrow();
  });

  it("rejects an empty password", () => {
    expect(() => signInSchema.parse({ email: "test@milestoned.local", password: "", next: "/" })).toThrow();
  });

  it("trims whitespace from the email", () => {
    const result = signInSchema.parse({ email: "  test@milestoned.local  ", password: "x", next: "/" });
    expect(result.email).toBe("test@milestoned.local");
  });
});

describe("signUpSchema", () => {
  it("requires a password of at least 8 characters", () => {
    expect(() =>
      signUpSchema.parse({ email: "test@milestoned.local", password: "short", next: "/" })
    ).toThrow();
    expect(() =>
      signUpSchema.parse({ email: "test@milestoned.local", password: "longenough", next: "/" })
    ).not.toThrow();
  });
});

describe("updateEmailSchema / updatePasswordSchema", () => {
  it("validates the new email address", () => {
    expect(() => updateEmailSchema.parse({ email: "new@milestoned.local" })).not.toThrow();
    expect(() => updateEmailSchema.parse({ email: "nope" })).toThrow();
  });

  it("requires the new password to be at least 8 characters", () => {
    expect(() => updatePasswordSchema.parse({ password: "short" })).toThrow();
    expect(() => updatePasswordSchema.parse({ password: "longenough" })).not.toThrow();
  });
});
