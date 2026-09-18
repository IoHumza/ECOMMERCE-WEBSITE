import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { cartItems, carts, productImages, productVariants, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";
import { GUEST_CART_COOKIE_NAME } from "@/lib/auth/jwt";
import type { SessionUser } from "@/lib/auth/session";

const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Resolves the active cart for the current request. Logged-in users always
 * get a persistent cart tied to their account; anonymous visitors get a
 * cart tied to a random guest token stored in an httpOnly cookie so the
 * cart survives page reloads without requiring an account.
 */
export async function resolveCartId(user: SessionUser | null): Promise<number> {
  if (user) {
    const [existing] = await db.select().from(carts).where(eq(carts.userId, user.id)).limit(1);
    if (existing) return existing.id;
    const [created] = await db.insert(carts).values({ userId: user.id }).returning();
    return created.id;
  }

  const store = await cookies();
  let token = store.get(GUEST_CART_COOKIE_NAME)?.value;

  if (token) {
    const [existing] = await db.select().from(carts).where(eq(carts.guestToken, token)).limit(1);
    if (existing) return existing.id;
  }

  token = randomUUID();
  const [created] = await db.insert(carts).values({ guestToken: token }).returning();
  store.set(GUEST_CART_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
  return created.id;
}

/** Merges a guest cart into a user's cart after login/registration. */
export async function mergeGuestCartIntoUser(userId: number) {
  const store = await cookies();
  const guestToken = store.get(GUEST_CART_COOKIE_NAME)?.value;
  if (!guestToken) return;

  const [guestCart] = await db.select().from(carts).where(eq(carts.guestToken, guestToken)).limit(1);
  if (!guestCart) return;

  let [userCart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!userCart) {
    [userCart] = await db.insert(carts).values({ userId }).returning();
  }

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.cartId, guestCart.id));
  for (const item of guestItems) {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, userCart.id), eq(cartItems.variantId, item.variantId)))
      .limit(1);
    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({ cartId: userCart.id, variantId: item.variantId, quantity: item.quantity });
    }
  }

  await db.delete(carts).where(eq(carts.id, guestCart.id));
  store.delete(GUEST_CART_COOKIE_NAME);
}

export async function getCartDetails(cartId: number) {
  const rows = await db
    .select()
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(cartItems.createdAt);

  const productIds = rows.map((r) => r.products.id);
  const images = productIds.length
    ? await db.select().from(productImages).where(eq(productImages.isPrimary, true))
    : [];
  const imageByProduct = new Map(images.filter((i) => productIds.includes(i.productId)).map((i) => [i.productId, i.url]));

  const items = rows.map((row) => {
    const unitPrice = Number(row.product_variants.priceOverride ?? row.products.basePrice);
    return {
      id: row.cart_items.id,
      quantity: row.cart_items.quantity,
      variant: {
        id: row.product_variants.id,
        color: row.product_variants.color,
        size: row.product_variants.size,
        stock: row.product_variants.stock,
        imageUrl: row.product_variants.imageUrl,
      },
      product: {
        id: row.products.id,
        name: row.products.name,
        slug: row.products.slug,
        imageUrl: row.product_variants.imageUrl ?? imageByProduct.get(row.products.id) ?? null,
      },
      unitPrice,
      lineTotal: Number((unitPrice * row.cart_items.quantity).toFixed(2)),
    };
  });

  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));

  return { items, subtotal, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) };
}

export async function addItemToCart(cartId: number, variantId: number, quantity: number) {
  const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1);
  if (!variant) throw new ApiError("This product variant is no longer available.", 404);

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)))
    .limit(1);

  const desiredQuantity = (existing?.quantity ?? 0) + quantity;
  if (desiredQuantity > variant.stock) {
    throw new ApiError(`Only ${variant.stock} left in stock for this option.`, 409);
  }

  if (existing) {
    await db.update(cartItems).set({ quantity: desiredQuantity }).where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ cartId, variantId, quantity });
  }
}

export async function updateCartItemQuantity(cartId: number, itemId: number, quantity: number) {
  const [item] = await db
    .select()
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .limit(1);
  if (!item) throw new ApiError("Cart item not found.", 404);
  if (quantity > item.product_variants.stock) {
    throw new ApiError(`Only ${item.product_variants.stock} left in stock for this option.`, 409);
  }
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
}

export async function removeCartItem(cartId: number, itemId: number) {
  const result = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .returning({ id: cartItems.id });
  if (!result.length) throw new ApiError("Cart item not found.", 404);
}

export async function clearCart(cartId: number) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
