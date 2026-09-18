import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from "./jwt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone: string | null;
};

/** Reads and validates the session cookie, returning the JWT payload only. */
export async function getAuthPayload(): Promise<AuthTokenPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

/** Loads the full current user record from the database (fresh role/data). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const payload = await getAuthPayload();
  if (!payload) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return user ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("Authentication required");
    error.name = "UnauthorizedError";
    throw error;
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    const error = new Error("Admin access required");
    error.name = "ForbiddenError";
    throw error;
  }
  return user;
}
