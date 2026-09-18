import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation";
import { listProducts } from "@/server/services/product.service";
import { db } from "@/db";
import { productImages, productVariants, products } from "@/db/schema";
import { ApiError, created, ok, handleApiError } from "@/lib/api/response";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = request.nextUrl.searchParams;
    const result = await listProducts({
      search: params.get("q") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : 1,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : 20,
      sort: "newest",
    });
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = productSchema.parse(body);

    const [existingSlug] = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
    if (existingSlug) throw new ApiError("A product with this slug already exists.", 409);

    const [product] = await db
      .insert(products)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        shortDescription: input.shortDescription || null,
        brand: input.brand || null,
        categoryId: input.categoryId,
        basePrice: input.basePrice.toFixed(2),
        compareAtPrice: input.compareAtPrice ? input.compareAtPrice.toFixed(2) : null,
        sku: input.sku,
        isFeatured: input.isFeatured ?? false,
        isNewArrival: input.isNewArrival ?? false,
        isActive: input.isActive ?? true,
      })
      .returning();

    await db.insert(productImages).values(
      input.images.map((image, index) => ({
        productId: product.id,
        url: image.url,
        altText: image.altText || product.name,
        position: index,
        isPrimary: image.isPrimary ?? index === 0,
      }))
    );

    await db.insert(productVariants).values(
      input.variants.map((variant) => ({
        productId: product.id,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        priceOverride: variant.priceOverride ? variant.priceOverride.toFixed(2) : null,
        stock: variant.stock,
        imageUrl: variant.imageUrl || null,
      }))
    );

    return created(product);
  } catch (error) {
    return handleApiError(error);
  }
}
