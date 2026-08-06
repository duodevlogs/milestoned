import { describe, it, expect, vi, beforeEach } from "vitest";
import { documentGenerationService } from "./document-generation.service";
import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { openaiService } from "@/server/services/openai.service";
import { clientService } from "@/server/services/client.service";
import type { GenerateDocumentInput } from "@/server/validation/document-generation.schema";
import type { Document } from "@/server/db/schema";

vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: {
    decrementCreditsIfAvailable: vi.fn(),
    refundCredit: vi.fn(),
  },
}));
vi.mock("@/server/repositories/document.repository", () => ({
  documentRepository: { create: vi.fn() },
}));
vi.mock("@/server/services/openai.service", () => ({
  openaiService: { generateDocumentSections: vi.fn() },
}));
vi.mock("@/server/services/client.service", () => ({
  clientService: { verifyOwnership: vi.fn() },
}));

const decrementCreditsIfAvailable = vi.mocked(userRepository.decrementCreditsIfAvailable);
const refundCredit = vi.mocked(userRepository.refundCredit);
const createDocument = vi.mocked(documentRepository.create);
const generateDocumentSections = vi.mocked(openaiService.generateDocumentSections);
const verifyOwnership = vi.mocked(clientService.verifyOwnership);

const BLANK_CLAUSES = {
  ip: false,
  confidentiality: false,
  liability: false,
  termination: false,
  terminationNoticeDays: "",
  latePayment: false,
  latePaymentGraceDays: "",
  latePaymentFeePct: "",
  warranty: false,
  revisions: false,
  governingLaw: false,
  governingLawJurisdiction: "",
  customClause: false,
  customClauseTitle: "",
  customClauseText: "",
};

function validInput(overrides: Partial<GenerateDocumentInput> = {}): GenerateDocumentInput {
  return {
    docType: "contract",
    clientName: "Acme Robotics",
    projectName: "Marketing site redesign",
    budget: 9000,
    scope: "Rebuild the marketing site.",
    deliverables: "",
    milestones: [{ label: "Delivery", pct: 100 }],
    clauses: BLANK_CLAUSES,
    ...overrides,
  };
}

describe("documentGenerationService.generate", () => {
  beforeEach(() => {
    decrementCreditsIfAvailable.mockReset();
    refundCredit.mockReset();
    createDocument.mockReset();
    generateDocumentSections.mockReset();
    verifyOwnership.mockReset();
  });

  it("rejects a clientId that doesn't belong to the caller, before spending any credit", async () => {
    verifyOwnership.mockResolvedValue(null);

    await expect(
      documentGenerationService.generate("user-1", validInput({ clientId: "someone-elses-client" }))
    ).rejects.toMatchObject({ code: "client_not_found" });

    expect(decrementCreditsIfAvailable).not.toHaveBeenCalled();
  });

  it("rejects generation when the user has no credits left, without calling the AI", async () => {
    decrementCreditsIfAvailable.mockResolvedValue(null);

    await expect(documentGenerationService.generate("user-1", validInput())).rejects.toMatchObject({
      code: "no_credits",
      status: 402,
    });

    expect(generateDocumentSections).not.toHaveBeenCalled();
  });

  it("refunds the credit and rethrows when AI generation fails", async () => {
    // @ts-expect-error - only the fields the service reads are needed
    decrementCreditsIfAvailable.mockResolvedValue({ creditsRemaining: 4 });
    const aiError = new Error("OpenAI request failed");
    generateDocumentSections.mockRejectedValue(aiError);

    await expect(documentGenerationService.generate("user-1", validInput())).rejects.toThrow(
      "OpenAI request failed"
    );

    expect(refundCredit).toHaveBeenCalledWith("user-1");
    expect(createDocument).not.toHaveBeenCalled();
  });

  it("refunds the credit and rethrows when saving the document fails", async () => {
    // @ts-expect-error - only the fields the service reads are needed
    decrementCreditsIfAvailable.mockResolvedValue({ creditsRemaining: 4 });
    generateDocumentSections.mockResolvedValue({
      partiesAndPurpose: "Parties text",
      scopeOfWork: "Scope text",
    });
    const dbError = new Error("insert failed");
    createDocument.mockRejectedValue(dbError);

    await expect(documentGenerationService.generate("user-1", validInput())).rejects.toThrow(
      "insert failed"
    );

    expect(refundCredit).toHaveBeenCalledWith("user-1");
  });

  it("does NOT refund on a fully successful generation", async () => {
    // @ts-expect-error - only the fields the service reads are needed
    decrementCreditsIfAvailable.mockResolvedValue({ creditsRemaining: 4 });
    generateDocumentSections.mockResolvedValue({
      partiesAndPurpose: "Parties text",
      scopeOfWork: "Scope text",
    });
    // @ts-expect-error - only the fields the service reads are needed
    createDocument.mockResolvedValue({ id: "doc-1" });

    const result = await documentGenerationService.generate("user-1", validInput());

    expect(result).toEqual({ document: { id: "doc-1" }, creditsRemaining: 4 });
    expect(refundCredit).not.toHaveBeenCalled();
  });

  it("always includes the Acceptance clause last, even with zero opted-in clauses", async () => {
    // @ts-expect-error - only the fields the service reads are needed
    decrementCreditsIfAvailable.mockResolvedValue({ creditsRemaining: 4 });
    generateDocumentSections.mockResolvedValue({
      partiesAndPurpose: "Parties text",
      scopeOfWork: "Scope text",
    });
    createDocument.mockImplementation(async (input) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = input.content as any;
      expect(content.sections.at(-1).title).toBe("Acceptance");
      expect(content.sections).toHaveLength(3); // Parties, Scope, Acceptance — no clauses opted in
      return { id: "doc-1" } as Document;
    });

    await documentGenerationService.generate("user-1", validInput());
    expect(createDocument).toHaveBeenCalledOnce();
  });
});
