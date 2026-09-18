import { db } from "@/db";
import { addresses } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";
import type { AddressInput } from "@/lib/validation";

export async function listAddresses(userId: number) {
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
}

export async function createAddress(userId: number, input: AddressInput) {
  if (input.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }
  const [existingCount] = await db.select().from(addresses).where(eq(addresses.userId, userId));
  const [created] = await db
    .insert(addresses)
    .values({
      userId,
      fullName: input.fullName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: input.isDefault ?? !existingCount,
    })
    .returning();
  return created;
}

export async function updateAddress(userId: number, addressId: number, input: AddressInput) {
  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .limit(1);
  if (!existing) throw new ApiError("Address not found.", 404);

  if (input.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }

  const [updated] = await db
    .update(addresses)
    .set({
      fullName: input.fullName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: input.isDefault ?? existing.isDefault,
    })
    .where(eq(addresses.id, addressId))
    .returning();
  return updated;
}

export async function deleteAddress(userId: number, addressId: number) {
  const [existing] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .limit(1);
  if (!existing) throw new ApiError("Address not found.", 404);
  await db.delete(addresses).where(eq(addresses.id, addressId));
}
