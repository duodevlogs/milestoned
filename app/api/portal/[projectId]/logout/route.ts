import { NextResponse } from "next/server";
import { portalSessionService } from "@/server/services/portal-session.service";
import { jsonError } from "@/server/errors";

export async function POST() {
  try {
    await portalSessionService.clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
