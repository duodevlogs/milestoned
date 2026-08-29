"use server";

/*
 * Thin HTTP layer: parse the form, call the controller, revalidate. No
 * business logic here — see server/controllers and server/services.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { portalManagementController } from "@/server/controllers/portal-management.controller";
import { publicMessage } from "@/server/errors";

export async function inviteClient(formData: FormData) {
  const user = await authService.requireUser();
  const projectId = formData.get("projectId");
  let destination = `/projects/${projectId}`;
  try {
    const email = formData.get("email");
    await portalManagementController.inviteClient(user.id, projectId, {
      email: typeof email === "string" ? email : undefined,
    });
    revalidatePath(destination);
  } catch (error) {
    destination = `${destination}?error=${encodeURIComponent(publicMessage(error))}`;
  }
  redirect(destination);
}

export async function revokeClient(formData: FormData) {
  const user = await authService.requireUser();
  const projectId = formData.get("projectId");
  const destination = `/projects/${projectId}`;
  const email = formData.get("email");
  await portalManagementController.revokeClient(user.id, projectId, {
    email: typeof email === "string" ? email : undefined,
  });
  revalidatePath(destination);
  redirect(destination);
}

export async function setDocumentShared(formData: FormData) {
  const user = await authService.requireUser();
  const documentId = formData.get("documentId");
  const shared = formData.get("shared") === "true";
  const projectId = formData.get("projectId");
  await portalManagementController.setDocumentShared(user.id, { documentId, shared });
  revalidatePath(`/projects/${projectId}`);
}
