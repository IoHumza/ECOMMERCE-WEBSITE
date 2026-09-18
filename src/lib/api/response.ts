import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

/** Centralized error handler for API route handlers. Never leaks internals. */
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    if (error.name === "UnauthorizedError") {
      return NextResponse.json(
        { success: false, message: "Please sign in to continue." },
        { status: 401 }
      );
    }
    if (error.name === "ForbiddenError") {
      return NextResponse.json(
        { success: false, message: "You do not have permission to do this." },
        { status: 403 }
      );
    }
  }

  // eslint-disable-next-line no-console
  console.error("[api-error]", error);
  return NextResponse.json(
    { success: false, message: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
