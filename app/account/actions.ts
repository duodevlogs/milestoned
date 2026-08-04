"use server";

/*
 * Thin HTTP layer: parse the form, call the controller, redirect with a
 * status banner. No business logic here — see server/controllers and
 * server/services.
 */
import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { authController } from "@/server/controllers/auth.controller";
import { userController } from "@/server/controllers/user.controller";
import { storageService } from "@/server/services/storage.service";
import { publicMessage } from "@/server/errors";

export async function updateEmail(formData: FormData) {
  let destination = "/account?updated=email";
  try {
    await authController.updateEmail({ email: formData.get("email") });
  } catch (error) {
    destination = `/account?error=${encodeURIComponent(publicMessage(error))}`;
  }
  redirect(destination);
}

export async function updatePassword(formData: FormData) {
  let destination = "/account?updated=password";
  try {
    await authController.updatePassword({ password: formData.get("password") });
  } catch (error) {
    destination = `/account?error=${encodeURIComponent(publicMessage(error))}`;
  }
  redirect(destination);
}

export async function updateBranding(formData: FormData) {
  const user = await authService.requireUser();
  let destination = "/account?updated=branding";
  try {
    const businessName = formData.get("businessName");
    const logo = formData.get("logo");

    let logoUrl: string | undefined;
    if (logo instanceof File && logo.size > 0) {
      logoUrl = await storageService.uploadLogo(user.id, logo);
    }

    await userController.updateBranding(user.id, {
      businessName: typeof businessName === "string" ? businessName : undefined,
      logoUrl,
    });
  } catch (error) {
    destination = `/account?error=${encodeURIComponent(publicMessage(error))}`;
  }
  redirect(destination);
}

export async function updateBusinessDetails(formData: FormData) {
  const user = await authService.requireUser();
  let destination = "/account?updated=business-details";
  try {
    const businessAddress = formData.get("businessAddress");
    const taxId = formData.get("taxId");
    const companyRegistration = formData.get("companyRegistration");
    const paymentInstructions = formData.get("paymentInstructions");

    await userController.updateBusinessDetails(user.id, {
      businessAddress: typeof businessAddress === "string" ? businessAddress : undefined,
      taxId: typeof taxId === "string" ? taxId : undefined,
      companyRegistration: typeof companyRegistration === "string" ? companyRegistration : undefined,
      paymentInstructions: typeof paymentInstructions === "string" ? paymentInstructions : undefined,
    });
  } catch (error) {
    destination = `/account?error=${encodeURIComponent(publicMessage(error))}`;
  }
  redirect(destination);
}
