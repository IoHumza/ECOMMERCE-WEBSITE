import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export type AuthTokenPayload = {
  userId: number;
  role: "customer" | "admin";
  email: string;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "role" in decoded &&
      "email" in decoded
    ) {
      return decoded as AuthTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "session_token";
export const GUEST_CART_COOKIE_NAME = "guest_cart_token";
export const AUTH_COOKIE_MAX_AGE = TOKEN_TTL_SECONDS;
