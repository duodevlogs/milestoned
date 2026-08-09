/*
 * Thin HTTP layer: verify the session, parse the JSON body, call the
 * controller. Mirrors app/api/generate-invoice/route.ts — proposals have
 * their own controller/service/validation since they aren't
 * GeneratedDocumentContent-shaped.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { proposalGenerationController } from "@/server/controllers/proposal-generation.controller";
import { AppError, jsonError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }

    const body = await request.json();
    const result = await proposalGenerationController.generate(user.id, body);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
