import { requireUser } from "@/lib/auth/session";
import { deleteReview } from "@/server/services/review.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await deleteReview(Number(id), user);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
