import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validation";
import { registerUser } from "@/server/services/auth.service";
import { mergeGuestCartIntoUser } from "@/server/services/cart.service";
import { signAuthToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/jwt";
import { created, handleApiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);

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

    return created({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
