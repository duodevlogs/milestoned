/*
 * Thin HTTP layer. Reads the raw request body (required for signature
 * verification — never parse this as JSON before the controller verifies
 * it) and delegates entirely to the controller.
 */
import { NextResponse } from "next/server";
import { webhookController } from "@/server/controllers/webhook.controller";
import { jsonError } from "@/server/errors";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    await webhookController.handleStripeEvent(rawBody, signature);
    return NextResponse.json({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
