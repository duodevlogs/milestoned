import { z } from "zod";
import { PAYMENT_METHOD_TYPE_IDS, normalizePaymentFields } from "@/lib/payment-methods";

export const savePaymentMethodSchema = z
  .object({
    // Present when editing an existing method, absent when adding one.
    id: z.uuid().optional(),
    type: z.enum(PAYMENT_METHOD_TYPE_IDS),
    label: z.string().trim().max(60, "Keep the name under 60 characters.").default(""),
    fields: z.record(z.string(), z.string()),
    isDefault: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    const { error } = normalizePaymentFields(value.type, value.fields);
    if (error) ctx.addIssue({ code: "custom", message: error, path: ["fields"] });
  });

export type SavePaymentMethodInput = z.infer<typeof savePaymentMethodSchema>;

export const removePaymentMethodSchema = z.object({ id: z.uuid({ message: "Invalid payment method id." }) });
