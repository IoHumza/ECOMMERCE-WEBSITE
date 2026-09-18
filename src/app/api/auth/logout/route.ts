import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { ok, handleApiError } from "@/lib/api/response";

export async function POST() {
  try {
    const store = await cookies();
    store.delete(AUTH_COOKIE_NAME);
    return ok({ loggedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}
