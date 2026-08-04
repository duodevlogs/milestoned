import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { clauseBundleController } from "@/server/controllers/clause-bundle.controller";
import { AppError, jsonError } from "@/server/errors";

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
    await clauseBundleController.deleteForUser(user.id, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
