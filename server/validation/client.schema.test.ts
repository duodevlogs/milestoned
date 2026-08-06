import { describe, it, expect } from "vitest";
import { createClientSchema } from "./client.schema";

describe("createClientSchema", () => {
  it("requires a non-empty name", () => {
    expect(() =>
      createClientSchema.parse({ name: "", email: "", company: "", notes: "" })
    ).toThrow();
  });

  it("accepts an empty email — it's optional for a client contact", () => {
    const result = createClientSchema.parse({ name: "Acme Robotics" });
    expect(result.email).toBe("");
  });

  it("accepts a valid email", () => {
    const result = createClientSchema.parse({
      name: "Acme Robotics",
      email: "contact@acme.dev",
    });
    expect(result.email).toBe("contact@acme.dev");
  });

  it("rejects a malformed email", () => {
    expect(() =>
      createClientSchema.parse({ name: "Acme Robotics", email: "not-an-email" })
    ).toThrow();
  });

  it("trims whitespace around the email instead of rejecting it", () => {
    // Regression: z.email().trim() validated the untrimmed string first and
    // rejected valid-but-padded emails — see auth.schema.ts's emailSchema.
    const result = createClientSchema.parse({
      name: "Acme Robotics",
      email: "  contact@acme.dev  ",
    });
    expect(result.email).toBe("contact@acme.dev");
  });
});
