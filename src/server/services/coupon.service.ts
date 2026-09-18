import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/response";

export async function findActiveCoupon(code: string) {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
  if (!coupon || !coupon.isActive) return null;
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return null;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return null;
  return coupon;
}

export function calculateDiscount(
  coupon: { discountType: "percentage" | "fixed"; discountValue: string; minSubtotal: string },
  subtotal: number
) {
  if (subtotal < Number(coupon.minSubtotal)) {
    throw new ApiError(
      `This coupon requires a minimum order of $${Number(coupon.minSubtotal).toFixed(2)}.`,
      400
    );
  }
  const value = Number(coupon.discountValue);
  const discount = coupon.discountType === "percentage" ? (subtotal * value) / 100 : value;
  return Math.min(subtotal, Number(discount.toFixed(2)));
}
