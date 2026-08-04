/*
 * Thin HTTP layer. Plain <form method="POST"> target — responds with a 303
 * redirect (to Stripe on success, back to the dashboard on failure) rather
 * than the JSON error shape, since the caller is a browser form. Unlike the
 * founding-member checkout, this requires an authenticated session — the
 * buyer's userId is what the webhook uses to credit the right account.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { checkoutController } from "@/server/controllers/checkout.controller";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  try {
    const user = await authService.requireUser();
    const formData = await request.formData();
    const { url } = await checkoutController.createTopUpSession(
      user.id,
      origin,
      formData.get("package")
    );
    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error("[topup_checkout_error]", error);
    return NextResponse.redirect(`${origin}/dashboard?topup=error`, 303);
  }
}
