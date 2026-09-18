import { getProductBySlug, getRelatedProducts } from "@/server/services/product.service";
import { listApprovedReviewsForProduct } from "@/server/services/review.service";
import { ApiError, ok, handleApiError } from "@/lib/api/response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);
    if (!product) throw new ApiError("Product not found.", 404);

    const [related, reviews] = await Promise.all([
      getRelatedProducts(product.categoryId, product.id),
      listApprovedReviewsForProduct(product.id),
    ]);

    return ok({ product, related, reviews });
  } catch (error) {
    return handleApiError(error);
  }
}
