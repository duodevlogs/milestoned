import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentMethodService } from "./payment-method.service";
import { userRepository } from "@/server/repositories/user.repository";
import { MAX_PAYMENT_METHODS } from "@/lib/payment-methods";

vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: { findById: vi.fn(), updatePaymentMethods: vi.fn() },
}));

const findById = vi.mocked(userRepository.findById);
const updatePaymentMethods = vi.mocked(userRepository.updatePaymentMethods);

const saved = (id: string) => ({
  id,
  type: "paypal",
  label: "",
  fields: { email: "a@b.co" },
  isDefault: false,
});

const input = (overrides = {}) => ({
  type: "paypal",
  label: "",
  fields: { email: "me@example.com" },
  isDefault: true,
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
  findById.mockResolvedValue({ paymentMethods: [saved("pm-1")] } as never);
});

describe("paymentMethodService", () => {
  it("adds a new method with a server-generated id", async () => {
    const created = await paymentMethodService.save("user-1", input());
    expect(created.id).toBeTruthy();
    const [, methods] = updatePaymentMethods.mock.calls[0];
    expect(methods).toHaveLength(2);
    expect(methods[1].fields).toEqual({ email: "me@example.com" });
  });

  it("replaces an existing method when an id is given", async () => {
    await paymentMethodService.save("user-1", input({ id: "pm-1", label: "Renamed" }));
    const [, methods] = updatePaymentMethods.mock.calls[0];
    expect(methods).toHaveLength(1);
    expect(methods[0]).toMatchObject({ id: "pm-1", label: "Renamed", isDefault: true });
  });

  it("rejects editing a method that isn't saved", async () => {
    await expect(paymentMethodService.save("user-1", input({ id: "nope" }))).rejects.toMatchObject({
      code: "payment_method_not_found",
    });
    expect(updatePaymentMethods).not.toHaveBeenCalled();
  });

  it("rejects an entirely empty method", async () => {
    await expect(paymentMethodService.save("user-1", input({ fields: {} }))).rejects.toMatchObject({
      code: "invalid_payment_method",
    });
  });

  it("caps the number of saved methods", async () => {
    findById.mockResolvedValue({
      paymentMethods: Array.from({ length: MAX_PAYMENT_METHODS }, (_, i) => saved(`pm-${i}`)),
    } as never);
    await expect(paymentMethodService.save("user-1", input())).rejects.toMatchObject({
      code: "too_many_payment_methods",
    });
  });

  it("removes a method, and rejects removing an unknown one", async () => {
    await paymentMethodService.remove("user-1", "pm-1");
    expect(updatePaymentMethods).toHaveBeenCalledWith("user-1", []);
    await expect(paymentMethodService.remove("user-1", "nope")).rejects.toMatchObject({
      code: "payment_method_not_found",
    });
  });
});
