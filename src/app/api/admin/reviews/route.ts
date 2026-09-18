import { requireAdmin } from "@/lib/auth/session";
import { listAllReviewsForAdmin } from "@/server/services/review.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin();
    const reviews = await listAllReviewsForAdmin();
    return ok(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}
