/*
 * Public route — verifies the OTP and, on success, sets the signed portal
 * session cookie. This is the only place a portal session is ever created.
 */
import { NextResponse } from "next/server";
import { portalAuthController } from "@/server/controllers/portal-auth.controller";
import { portalSessionService } from "@/server/services/portal-session.service";
import { jsonError } from "@/server/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const token = await portalAuthController.verifyOtp(projectId, body);
    await portalSessionService.setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
