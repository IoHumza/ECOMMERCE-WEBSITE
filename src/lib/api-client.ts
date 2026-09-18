// Thin client-side fetch wrapper used by client components to talk to our
// own Next.js API routes. Centralizes error handling so components can
// simply `await apiFetch(...)` and catch a single `ApiClientError` type.

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: { path: string; message: string }[];
  constructor(message: string, status: number, fieldErrors?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // no body
  }

  const body = payload as { success?: boolean; message?: string; data?: T; errors?: { path: string; message: string }[] } | null;

  if (!response.ok || !body?.success) {
    throw new ApiClientError(
      body?.message ?? "Something went wrong. Please try again.",
      response.status,
      body?.errors
    );
  }

  return body.data as T;
}
