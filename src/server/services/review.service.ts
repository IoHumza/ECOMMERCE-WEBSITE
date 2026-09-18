import { db } from "@/db";
import { orderItems, orders, reviews, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";
import { recalculateProductRating } from "./product.service";
import type { ReviewInput } from "@/lib/validation";

export async function listApprovedReviewsForProduct(productId: number) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
}

/** Customers may only review products they have actually purchased and received/shipped. */
async function hasPurchasedProduct(userId: number, productId: number) {
  const [row] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orderItems.productId, productId)
      )
    )
    .limit(1);
  return Boolean(row);
}

export async function createReview(userId: number, input: ReviewInput) {
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, input.productId)))
    .limit(1);
  if (existing) {
    throw new ApiError("You have already reviewed this product.", 409);
  }

  const verifiedPurchase = await hasPurchasedProduct(userId, input.productId);

  const [created] = await db
    .insert(reviews)
    .values({
      userId,
      productId: input.productId,
      rating: input.rating,
      title: input.title || null,
      body: input.body,
      isApproved: true,
    })
    .returning();

  await recalculateProductRating(input.productId);
  return { ...created, verifiedPurchase };
}

export async function deleteReview(reviewId: number, requester: { id: number; role: string }) {
  const [existing] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!existing) throw new ApiError("Review not found.", 404);
  if (requester.role !== "admin" && existing.userId !== requester.id) {
    throw new ApiError("You cannot delete this review.", 403);
  }
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  await recalculateProductRating(existing.productId);
}

export async function setReviewApproval(reviewId: number, isApproved: boolean) {
  const [existing] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!existing) throw new ApiError("Review not found.", 404);
  await db.update(reviews).set({ isApproved }).where(eq(reviews.id, reviewId));
  await recalculateProductRating(existing.productId);
}

export async function listAllReviewsForAdmin() {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
      userName: users.name,
      userEmail: users.email,
      productId: reviews.productId,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));
}
