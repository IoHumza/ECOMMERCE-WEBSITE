import { db } from "@/db";
import {
  addresses,
  cartItems,
  carts,
  coupons,
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";
import type { CheckoutInput } from "@/lib/validation";
import { findActiveCoupon, calculateDiscount } from "./coupon.service";
import { createNotification } from "./notification.service";

const FLAT_SHIPPING_RATE = 9.99;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.08;

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Creates an order from the customer's current cart. All pricing is
 * calculated authoritatively on the server: the client can never influence
 * unit prices, discounts, shipping, or tax. Stock is validated and
 * decremented inside a single database transaction to avoid race
 * conditions/overselling.
 */
export async function createOrderFromCart(userId: number, cartId: number, input: CheckoutInput) {
  return db.transaction(async (tx) => {
    const items = await tx
      .select()
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      throw new ApiError("Your cart is empty.", 400);
    }

    // Resolve shipping address: either an existing saved address or a new one.
    let shippingAddress: {
      fullName: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      addressId: number | null;
    };

    if (input.addressId) {
      const [existing] = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, input.addressId), eq(addresses.userId, userId)))
        .limit(1);
      if (!existing) throw new ApiError("Shipping address not found.", 404);
      shippingAddress = { ...existing, addressId: existing.id };
    } else if (input.address) {
      const [created] = await tx
        .insert(addresses)
        .values({
          userId,
          fullName: input.address.fullName,
          phone: input.address.phone,
          line1: input.address.line1,
          line2: input.address.line2 || null,
          city: input.address.city,
          state: input.address.state,
          postalCode: input.address.postalCode,
          country: input.address.country,
          isDefault: input.address.isDefault ?? false,
        })
        .returning();
      shippingAddress = { ...created, addressId: created.id };
    } else {
      throw new ApiError("A shipping address is required.", 400);
    }

    // Validate stock and compute authoritative line totals.
    let subtotal = 0;
    const orderItemDrafts: {
      productId: number;
      variantId: number;
      productName: string;
      variantLabel: string;
      imageUrl: string | null;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const row of items) {
      const variant = row.product_variants;
      const product = row.products;
      const quantity = row.cart_items.quantity;

      if (variant.stock < quantity) {
        throw new ApiError(
          `"${product.name}" (${variant.color}/${variant.size}) only has ${variant.stock} unit(s) left in stock.`,
          409
        );
      }

      const unitPrice = Number(variant.priceOverride ?? product.basePrice);
      const lineTotal = Number((unitPrice * quantity).toFixed(2));
      subtotal += lineTotal;

      orderItemDrafts.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantLabel: `${variant.color} / ${variant.size}`,
        imageUrl: variant.imageUrl,
        unitPrice,
        quantity,
        lineTotal,
      });
    }
    subtotal = Number(subtotal.toFixed(2));

    // Apply coupon (server-validated, never trusts client-provided discount).
    let discount = 0;
    let appliedCouponCode: string | null = null;
    if (input.couponCode) {
      const coupon = await findActiveCoupon(input.couponCode);
      if (!coupon) {
        throw new ApiError("This coupon code is invalid or expired.", 400);
      }
      discount = calculateDiscount(coupon, subtotal);
      appliedCouponCode = coupon.code;
      await tx.update(coupons).set({ usedCount: coupon.usedCount + 1 }).where(eq(coupons.id, coupon.id));
    }

    const discountedSubtotal = Number((subtotal - discount).toFixed(2));
    const shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0 ? 0 : FLAT_SHIPPING_RATE;
    const tax = Number((discountedSubtotal * TAX_RATE).toFixed(2));
    const total = Number((discountedSubtotal + shipping + tax).toFixed(2));

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        status: "pending",
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        couponCode: appliedCouponCode,
        shippingAddressId: shippingAddress.addressId,
        shippingFullName: shippingAddress.fullName,
        shippingPhone: shippingAddress.phone,
        shippingLine1: shippingAddress.line1,
        shippingLine2: shippingAddress.line2,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        paymentMethod: input.paymentMethod,
        // Payment abstraction: in this demo, card payments are treated as
        // captured immediately (see src/server/services/payment.service.ts
        // for how a real provider like Stripe would be wired in here).
        paymentStatus: input.paymentMethod === "card" ? "paid" : "unpaid",
      })
      .returning();

    for (const draft of orderItemDrafts) {
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: draft.productId,
        variantId: draft.variantId,
        productName: draft.productName,
        variantLabel: draft.variantLabel,
        imageUrl: draft.imageUrl,
        unitPrice: draft.unitPrice.toFixed(2),
        quantity: draft.quantity,
        lineTotal: draft.lineTotal.toFixed(2),
      });
      // Atomic decrement guards against race conditions between concurrent checkouts.
      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${draft.quantity}` })
        .where(eq(productVariants.id, draft.variantId));
    }

    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return order;
  }).then(async (order) => {
    await createNotification(
      userId,
      "order_update",
      "Order placed successfully",
      `Your order ${order.orderNumber} has been placed and is now pending confirmation.`
    );
    return order;
  });
}

export async function listOrdersForUser(userId: number) {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderDetails(orderId: number, requester: { id: number; role: string }) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new ApiError("Order not found.", 404);
  if (requester.role !== "admin" && order.userId !== requester.id) {
    throw new ApiError("You cannot view this order.", 403);
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { order, items };
}

export async function listAllOrdersForAdmin(filters: { status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const whereClause = filters.status ? eq(orders.status, filters.status as typeof orders.status.enumValues[number]) : undefined;

  const rows = whereClause
    ? await db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(pageSize).offset(offset)
    : await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(pageSize).offset(offset);

  return rows;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) throw new ApiError("Order not found.", 404);

  const [updated] = await db
    .update(orders)
    .set({ status: status as typeof orders.status.enumValues[number], updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await createNotification(
    existing.userId,
    "order_update",
    "Order status updated",
    `Your order ${existing.orderNumber} is now "${status.replace("_", " ")}".`
  );

  return updated;
}
