/*
 * Thin HTTP layer: verify the session, parse the JSON body, call the
 * controller. The AI call itself only ever happens inside
 * server/services/openai.service.ts — never reachable from the browser.
 */
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { documentGenerationController } from "@/server/controllers/document-generation.controller";
import { AppError, jsonError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }

    const body = await request.json();
    const result = await documentGenerationController.generate(user.id, body);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
