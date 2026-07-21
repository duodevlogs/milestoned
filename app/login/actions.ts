"use server";

/*
 * Thin HTTP layer: parse the form, call the controller, redirect.
 * No business logic here — see server/controllers and server/services.
 */
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authController } from "@/server/controllers/auth.controller";
import { publicMessage } from "@/server/errors";

function formValues(formData: FormData) {
  return {
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  };
}

function safeNext(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "/dashboard";
}

export async function signIn(formData: FormData) {
  let destination: string;
  try {
    const { next } = await authController.signIn(formValues(formData));
    destination = next;
  } catch (error) {
    destination = `/login?error=${encodeURIComponent(publicMessage(error))}&next=${encodeURIComponent(safeNext(formData.get("next")))}`;
  }
  redirect(destination);
}

export async function signUp(formData: FormData) {
  let destination: string;
  try {
    const headerList = await headers();
    const origin =
      headerList.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";
    await authController.signUp(formValues(formData), origin);
    destination = "/login?mode=signup&sent=1";
  } catch (error) {
    destination = `/login?mode=signup&error=${encodeURIComponent(publicMessage(error))}&next=${encodeURIComponent(safeNext(formData.get("next")))}`;
  }
  redirect(destination);
}

export async function signOut() {
  await authController.signOut();
  redirect("/login");
}
