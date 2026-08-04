"use server";

/*
 * Thin HTTP layer: verify the session, parse the form, call the
 * controller, redirect. No business logic here — see server/controllers
 * and server/services.
 */
import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { publicMessage } from "@/server/errors";

export async function createClient(formData: FormData) {
  const user = await authService.requireUser();
  let destination = "/clients";
  try {
    await clientController.create(user.id, {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      notes: formData.get("notes"),
    });
  } catch (error) {
    destination = `/clients?error=${encodeURIComponent(publicMessage(error))}`;
  }
  redirect(destination);
}
