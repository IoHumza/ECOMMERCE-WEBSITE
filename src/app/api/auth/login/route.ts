import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validation";
import { authenticateUser } from "@/server/services/auth.service";
import { mergeGuestCartIntoUser } from "@/server/services/cart.service";
import { signAuthToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/jwt";
import { ok, handleApiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const user = await authenticateUser(input);

    const token = signAuthToken({ userId: user.id, role: user.role, email: user.email });
    const store = await cookies();
    store.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });

    await mergeGuestCartIntoUser(user.id);

    return ok({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
