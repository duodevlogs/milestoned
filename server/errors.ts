import { NextResponse } from "next/server";
import { ZodError } from "zod";

/*
 * Standard error type for the whole backend. Services and controllers throw
 * AppError with a safe, user-facing message; anything else is treated as an
 * internal error and never leaks details to the client.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }

  static badRequest(message: string, code = "bad_request") {
    return new AppError(message, 400, code);
  }
  static unauthorized(message = "You need to be signed in.", code = "unauthorized") {
    return new AppError(message, 401, code);
  }
  static paymentRequired(message: string, code = "payment_required") {
    return new AppError(message, 402, code);
  }
  static forbidden(message = "You don't have access to this.", code = "forbidden") {
    return new AppError(message, 403, code);
  }
  static notFound(message = "Not found.", code = "not_found") {
    return new AppError(message, 404, code);
  }
  static tooManyRequests(message: string, code = "rate_limited") {
    return new AppError(message, 429, code);
  }
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/** Safe user-facing message for any thrown value. Internal details stay on the server. */
export function publicMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }
  return GENERIC_MESSAGE;
}

/**
 * Standard JSON error shape for API routes:
 *   { "error": { "code": string, "message": string } }
 */
export function jsonError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: publicMessage(error) } },
      { status: 400 }
    );
  }
  console.error("[internal_error]", error);
  return NextResponse.json(
    { error: { code: "internal_error", message: GENERIC_MESSAGE } },
    { status: 500 }
  );
}
