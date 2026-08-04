/*
 * Thin HTTP layer. Called via client-side fetch from the Generate wizard's
 * Clauses step ("Save as bundle" action and applying an existing bundle),
 * so this can't be a server action/redirect without losing wizard state.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { clauseBundleController } from "@/server/controllers/clause-bundle.controller";
import { AppError, jsonError } from "@/server/errors";

export async function GET() {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }
    const bundles = await clauseBundleController.listForUser(user.id);
    return NextResponse.json({ bundles });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }
    const body = await request.json();
    const bundle = await clauseBundleController.create(user.id, body);
    return NextResponse.json({ bundle });
  } catch (error) {
    return jsonError(error);
  }
}
