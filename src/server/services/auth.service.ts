import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ApiError } from "@/lib/api/response";
import type { RegisterInput, LoginInput } from "@/lib/validation";

export async function registerUser(input: RegisterInput) {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) {
    throw new ApiError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const [created] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, passwordHash, role: "customer" })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone });

  return created;
}

export async function authenticateUser(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user) {
    throw new ApiError("Invalid email or password.", 401);
  }
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError("Invalid email or password.", 401);
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
}
