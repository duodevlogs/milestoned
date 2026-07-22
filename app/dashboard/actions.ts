"use server";

/*
 * Thin HTTP layer: verify the session, parse the form, call the
 * controller. The userId always comes from the verified session —
 * never from client input — so ownership is enforced server-side.
 */
import { revalidatePath } from "next/cache";
import { authService } from "@/server/services/auth.service";
import { documentController } from "@/server/controllers/document.controller";

export async function updateDocumentStatus(formData: FormData) {
  const user = await authService.requireUser();
  const documentId = formData.get("documentId");
  await documentController.updateStatus(user.id, {
    documentId,
    status: formData.get("status"),
  });
  revalidatePath("/dashboard");
  // StatusSelect is also used on the document detail page — revalidate it
  // too so that page's server-rendered status stays in sync after a change.
  if (typeof documentId === "string") {
    revalidatePath(`/documents/${documentId}`);
  }
}
