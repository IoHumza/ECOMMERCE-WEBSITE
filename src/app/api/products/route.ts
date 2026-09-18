import { NextRequest } from "next/server";
import { listProducts, type ProductSortOption } from "@/server/services/product.service";
import { ok, handleApiError } from "@/lib/api/response";

const VALID_SORTS: ProductSortOption[] = ["newest", "price_asc", "price_desc", "rating", "popularity"];

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const sortParam = params.get("sort");
    const result = await listProducts({
      search: params.get("q") ?? undefined,
      categorySlug: params.get("category") ?? undefined,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      size: params.get("size") ?? undefined,
      color: params.get("color") ?? undefined,
      inStockOnly: params.get("inStock") === "true",
      minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
      featured: params.get("featured") === "true",
      newArrival: params.get("newArrival") === "true",
      sort: sortParam && VALID_SORTS.includes(sortParam as ProductSortOption) ? (sortParam as ProductSortOption) : "newest",
      page: params.get("page") ? Number(params.get("page")) : 1,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
    });
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
