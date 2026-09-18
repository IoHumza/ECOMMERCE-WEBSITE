import { NextRequest } from "next/server";
import { z } from "zod";
import { findActiveCoupon, calculateDiscount } from "@/server/services/coupon.service";
import { ApiError, ok, handleApiError } from "@/lib/api/response";

const schema = z.object({ code: z.string().trim().min(1), subtotal: z.number().nonnegative() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = schema.parse(body);
    const coupon = await findActiveCoupon(code);
    if (!coupon) throw new ApiError("This coupon code is invalid or expired.", 404);
    const discount = calculateDiscount(coupon, subtotal);
    return ok({ code: coupon.code, discount, description: coupon.description });
  } catch (error) {
    return handleApiError(error);
  }
}
