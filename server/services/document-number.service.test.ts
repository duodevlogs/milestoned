import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { documentNumberService } from "./document-number.service";
import { documentSequenceRepository } from "@/server/repositories/document-sequence.repository";

vi.mock("@/server/repositories/document-sequence.repository", () => ({
  documentSequenceRepository: { nextNumber: vi.fn() },
}));

const nextNumber = vi.mocked(documentSequenceRepository.nextNumber);

describe("documentNumberService.generate", () => {
  beforeEach(() => {
    nextNumber.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-06T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("derives initials from the business name, uppercased, capped at 4 letters", async () => {
    nextNumber.mockResolvedValue(14);
    const result = await documentNumberService.generate("user-1", "invoice", "Duo Dev Logs");
    expect(result).toBe("DDL-INV-2026-014");
  });

  it("falls back to DOC when there's no business name yet", async () => {
    nextNumber.mockResolvedValue(1);
    expect(await documentNumberService.generate("user-1", "invoice", null)).toBe(
      "DOC-INV-2026-001"
    );
    expect(await documentNumberService.generate("user-1", "invoice", "")).toBe(
      "DOC-INV-2026-001"
    );
    expect(await documentNumberService.generate("user-1", "invoice", "   ")).toBe(
      "DOC-INV-2026-001"
    );
  });

  it("uses the right abbreviation per document type", async () => {
    nextNumber.mockResolvedValue(1);
    expect(await documentNumberService.generate("user-1", "sow", "Acme")).toContain("-SOW-");
    expect(await documentNumberService.generate("user-1", "contract", "Acme")).toContain("-CTR-");
    expect(await documentNumberService.generate("user-1", "proposal", "Acme")).toContain("-PRO-");
    expect(await documentNumberService.generate("user-1", "invoice", "Acme")).toContain("-INV-");
  });

  it("zero-pads the sequence number to 3 digits", async () => {
    nextNumber.mockResolvedValue(7);
    expect(await documentNumberService.generate("user-1", "invoice", "Acme")).toBe(
      "A-INV-2026-007"
    );
  });

  it("doesn't pad beyond 3 digits once the sequence grows past 999", async () => {
    nextNumber.mockResolvedValue(1000);
    expect(await documentNumberService.generate("user-1", "invoice", "Acme")).toBe(
      "A-INV-2026-1000"
    );
  });
});
