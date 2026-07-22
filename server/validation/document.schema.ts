import { z } from "zod";

export const documentStatusSchema = z.enum(["draft", "sent", "signed", "paid"]);

export const updateDocumentStatusSchema = z.object({
  documentId: z.uuid({ message: "Invalid document id." }),
  status: documentStatusSchema,
});

export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
