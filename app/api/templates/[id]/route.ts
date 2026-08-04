/*
 * Thin HTTP layer. GET is used by the Generate wizard to pre-fill the store
 * when opened as /generate?template=<id>; DELETE is used by the Templates
 * page's delete button.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { templateController } from "@/server/controllers/template.controller";
import { AppError, jsonError } from "@/server/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }
    const { id } = await params;
    const template = await templateController.getForUser(user.id, id);
    return NextResponse.json({ template });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }
    const { id } = await params;
    await templateController.deleteForUser(user.id, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
