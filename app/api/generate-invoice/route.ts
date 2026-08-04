/*
 * Thin HTTP layer: verify the session, parse the JSON body, call the
 * controller. Mirrors app/api/generate-document/route.ts, but invoices have
 * their own controller/service/validation since they aren't
 * GeneratedDocumentContent-shaped.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { invoiceGenerationController } from "@/server/controllers/invoice-generation.controller";
import { AppError, jsonError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }

    const body = await request.json();
    const result = await invoiceGenerationController.generate(user.id, body);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
