import { db } from "@/db";
import { productImages, products, wishlistItems } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";

export async function listWishlist(userId: number) {
  const rows = await db
    .select()
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));

  const productIds = rows.map((r) => r.products.id);
  const images = productIds.length
    ? await db.select().from(productImages).where(eq(productImages.isPrimary, true))
    : [];
  const imageByProduct = new Map(images.filter((i) => productIds.includes(i.productId)).map((i) => [i.productId, i.url]));

  return rows.map((row) => ({
    wishlistItemId: row.wishlist_items.id,
    addedAt: row.wishlist_items.createdAt,
    product: { ...row.products, imageUrl: imageByProduct.get(row.products.id) ?? null },
  }));
}

export async function addToWishlist(userId: number, productId: number) {
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) throw new ApiError("Product not found.", 404);

  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .limit(1);
  if (existing) return existing;

  const [created] = await db.insert(wishlistItems).values({ userId, productId }).returning();
  return created;
}

export async function removeFromWishlist(userId: number, productId: number) {
  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
}

export async function isInWishlist(userId: number, productId: number) {
  const [existing] = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .limit(1);
  return Boolean(existing);
}
