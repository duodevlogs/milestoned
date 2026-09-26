/*
 * Thin HTTP layer for editing an already-generated invoice in place. The
 * wizard's edit mode sends the same body as /api/generate-invoice.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { invoiceGenerationController } from "@/server/controllers/invoice-generation.controller";
import { AppError, jsonError } from "@/server/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }
    const { id } = await params;
    const body = await request.json();
    const result = await invoiceGenerationController.update(user.id, id, body);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
