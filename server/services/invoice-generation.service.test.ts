import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoiceGenerationService } from "./invoice-generation.service";
import { userRepository } from "@/server/repositories/user.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { clientService } from "@/server/services/client.service";
import { projectService } from "@/server/services/project.service";
import type { GenerateInvoiceInput } from "@/server/validation/invoice-generation.schema";

// decrementCreditsIfAvailable/refundCredit are deliberately absent from this
// mock: if update() ever spent a credit it would throw a TypeError here.
vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: { findById: vi.fn() },
}));
vi.mock("@/server/repositories/document.repository", () => ({
  documentRepository: { getByIdForUser: vi.fn(), updateContentForUser: vi.fn() },
}));
vi.mock("@/server/services/client.service", () => ({
  clientService: { verifyOwnership: vi.fn() },
}));
vi.mock("@/server/services/project.service", () => ({
  projectService: { findOrCreateForDocument: vi.fn() },
}));
vi.mock("@/server/services/document-number.service", () => ({
  documentNumberService: { generate: vi.fn() },
}));

const findById = vi.mocked(userRepository.findById);
const getByIdForUser = vi.mocked(documentRepository.getByIdForUser);
const updateContentForUser = vi.mocked(documentRepository.updateContentForUser);
const verifyOwnership = vi.mocked(clientService.verifyOwnership);
const findOrCreateForDocument = vi.mocked(projectService.findOrCreateForDocument);

function input(overrides: Partial<GenerateInvoiceInput> = {}): GenerateInvoiceInput {
  return {
    clientName: "Acme",
    projectName: "Website",
    invoiceDate: "2026-09-26",
    paymentTermsLabel: "Net 14",
    lineItems: [{ description: "Milestone 1", amount: 200 }],
    discountAmount: 0,
    paymentMethodIds: [],
    taxRatePct: 0,
    currency: "EUR",
    ...overrides,
  };
}

const existingInvoice = {
  id: "doc-1",
  docType: "invoice",
  docNumber: "DDL-INV-2026-003",
  content: { generatedAt: "2026-09-01T00:00:00.000Z", docNumber: "DDL-INV-2026-003" },
};

beforeEach(() => {
  vi.resetAllMocks();
  findById.mockResolvedValue({
    businessName: "Duo Dev Logs",
    paymentMethods: [
      { id: "pm-paypal", type: "paypal", label: "", fields: { email: "me@example.com" }, isDefault: true },
      { id: "pm-sepa", type: "sepa", label: "", fields: { iban: "DE001" }, isDefault: false },
    ],
  } as never);
  findOrCreateForDocument.mockResolvedValue("project-1");
  updateContentForUser.mockImplementation(async (_id, _u, fields) => ({ id: "doc-1", ...fields }) as never);
});

describe("invoiceGenerationService.update", () => {
  it("rejects a document that doesn't exist or isn't the caller's", async () => {
    getByIdForUser.mockResolvedValue(null);
    await expect(invoiceGenerationService.update("user-1", "doc-1", input())).rejects.toMatchObject({
      code: "document_not_found",
    });
    expect(updateContentForUser).not.toHaveBeenCalled();
  });

  it("rejects editing a document that isn't an invoice", async () => {
    getByIdForUser.mockResolvedValue({ ...existingInvoice, docType: "contract" } as never);
    await expect(invoiceGenerationService.update("user-1", "doc-1", input())).rejects.toMatchObject({
      code: "document_not_found",
    });
  });

  it("rejects a clientId that isn't the caller's", async () => {
    getByIdForUser.mockResolvedValue(existingInvoice as never);
    verifyOwnership.mockResolvedValue(null);
    await expect(
      invoiceGenerationService.update("user-1", "doc-1", input({ clientId: "someone-elses" }))
    ).rejects.toMatchObject({ code: "client_not_found" });
  });

  it("rejects an invoice linked to itself", async () => {
    getByIdForUser.mockResolvedValue(existingInvoice as never);
    await expect(
      invoiceGenerationService.update("user-1", "doc-1", input({ relatedDocumentId: "doc-1" }))
    ).rejects.toMatchObject({ code: "related_document_invalid" });
  });

  it("updates in place: keeps the number and original generatedAt, recomputes totals, spends no credit", async () => {
    getByIdForUser.mockResolvedValue(existingInvoice as never);
    await invoiceGenerationService.update(
      "user-1",
      "doc-1",
      input({ taxRatePct: 19, discountAmount: 50 })
    );

    const [id, userId, fields] = updateContentForUser.mock.calls[0];
    expect([id, userId]).toEqual(["doc-1", "user-1"]);
    const content = fields.content as { docNumber: string; generatedAt: string; total: number };
    expect(content.docNumber).toBe("DDL-INV-2026-003");
    expect(content.generatedAt).toBe("2026-09-01T00:00:00.000Z");
    expect(content.total).toBe(179); // (200 - 50) + 19%
    expect(fields.projectId).toBe("project-1");
  });

  it("prints only the ticked saved payment methods, snapshotted from the current profile", async () => {
    getByIdForUser.mockResolvedValue(existingInvoice as never);
    await invoiceGenerationService.update("user-1", "doc-1", input({ paymentMethodIds: ["pm-sepa"] }));

    const content = updateContentForUser.mock.calls[0][2].content as {
      paymentMethods: { methodId: string; title: string; lines: string[] }[];
    };
    expect(content.paymentMethods).toEqual([
      { methodId: "pm-sepa", title: "Bank transfer (SEPA, EUR)", lines: ["IBAN: DE001"] },
    ]);
  });

  it("keeps a one-off custom payment text alongside saved methods", async () => {
    getByIdForUser.mockResolvedValue(existingInvoice as never);
    await invoiceGenerationService.update(
      "user-1",
      "doc-1",
      input({ paymentMethodIds: ["pm-paypal"], customPaymentDetails: "Pay by cheque" })
    );
    const content = updateContentForUser.mock.calls[0][2].content as {
      paymentMethods: unknown[];
      customPaymentDetails: string | null;
    };
    expect(content.paymentMethods).toHaveLength(1);
    expect(content.customPaymentDetails).toBe("Pay by cheque");
  });

  it("rejects a payment method id that isn't in the caller's saved methods", async () => {
    getByIdForUser.mockResolvedValue(existingInvoice as never);
    await expect(
      invoiceGenerationService.update("user-1", "doc-1", input({ paymentMethodIds: ["someone-elses"] }))
    ).rejects.toMatchObject({ code: "payment_method_not_found" });
    expect(updateContentForUser).not.toHaveBeenCalled();
  });
});
