/*
 * Thin HTTP layer. Called via client-side fetch from the Generate wizard's
 * "Save as preset" action — a full page navigation there would lose
 * in-progress wizard state, so this can't be a server action/redirect.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { templateController } from "@/server/controllers/template.controller";
import { AppError, jsonError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }
    const body = await request.json();
    const template = await templateController.createFromWizard(user.id, body);
    return NextResponse.json({ template });
  } catch (error) {
    return jsonError(error);
  }
}
