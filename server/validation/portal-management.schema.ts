import { z } from "zod";

export const inviteClientSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
});

export const revokeClientSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
});

export const setDocumentSharedSchema = z.object({
  documentId: z.uuid({ message: "Invalid document id." }),
  shared: z.boolean(),
});

export type InviteClientInput = z.infer<typeof inviteClientSchema>;
export type RevokeClientInput = z.infer<typeof revokeClientSchema>;
export type SetDocumentSharedInput = z.infer<typeof setDocumentSharedSchema>;
