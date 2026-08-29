/*
 * Public route — no Supabase auth, no proxy.ts protection. This is the
 * Client Portal's entry point: a project id (unguessable UUID) + an email
 * the provider has invited. Always returns 200 regardless of whether the
 * email is actually invited (portalOtpService.requestCode stays silent on
 * that) — only whether the PROJECT exists is ever revealed.
 */
import { NextResponse } from "next/server";
import { portalAuthController } from "@/server/controllers/portal-auth.controller";
import { jsonError } from "@/server/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    await portalAuthController.requestOtp(projectId, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
