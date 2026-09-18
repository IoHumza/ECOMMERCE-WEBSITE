import { getCurrentUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
