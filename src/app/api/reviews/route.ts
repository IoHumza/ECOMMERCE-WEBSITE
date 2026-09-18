import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { reviewSchema } from "@/lib/validation";
import { createReview } from "@/server/services/review.service";
import { created, handleApiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = reviewSchema.parse(body);
    const review = await createReview(user.id, input);
    return created(review);
  } catch (error) {
    return handleApiError(error);
  }
}
