import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";

export async function listCustomersForAdmin() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpent: sql<string>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}

export async function updateProfile(userId: number, data: { name: string; phone?: string | null }) {
  const [updated] = await db
    .update(users)
    .set({ name: data.name, phone: data.phone ?? null, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone });
  return updated;
}

export async function changePassword(userId: number, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function ensureCustomerExists(userId: number) {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new ApiError("User not found.", 404);
  return user;
}
