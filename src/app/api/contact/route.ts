import { NextRequest } from "next/server";
import { contactSchema } from "@/lib/validation";
import { ok, handleApiError } from "@/lib/api/response";

// In production this would enqueue an email via EMAIL_API_KEY (see
// src/lib/env.ts). For now we log the message server-side and acknowledge
// receipt so the contact form is fully functional end-to-end.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = contactSchema.parse(body);
    // eslint-disable-next-line no-console
    console.info("[contact-form]", { name: input.name, email: input.email, subject: input.subject });
    return ok({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
