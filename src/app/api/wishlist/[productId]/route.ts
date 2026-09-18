import { requireUser } from "@/lib/auth/session";
import { removeFromWishlist } from "@/server/services/wishlist.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function DELETE(_request: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const user = await requireUser();
    await removeFromWishlist(user.id, Number(productId));
    return ok({ removed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
