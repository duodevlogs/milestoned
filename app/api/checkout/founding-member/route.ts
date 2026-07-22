/*
 * Thin HTTP layer. Plain <form method="POST"> target — responds with a 303
 * redirect (to Stripe on success, back to the landing banner on failure)
 * rather than the JSON error shape, since the caller is a browser form.
 */
import { NextResponse } from "next/server";
import { checkoutController } from "@/server/controllers/checkout.controller";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  try {
    const { url } = await checkoutController.createFoundingMemberSession(origin);
    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error("[checkout_error]", error);
    return NextResponse.redirect(`${origin}/?checkout=error`, 303);
  }
}
