/*
 * Thin HTTP layer: parse query params, call the controller, redirect.
 */
import { NextResponse } from "next/server";
import { authController } from "@/server/controllers/auth.controller";
import { publicMessage } from "@/server/errors";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  try {
    const { next } = await authController.handleCallback(
      searchParams.get("code"),
      searchParams.get("next")
    );
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(publicMessage(error))}`
    );
  }
}
