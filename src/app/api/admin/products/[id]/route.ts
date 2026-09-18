import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation";
import { db } from "@/db";
import { productImages, productVariants, products } from "@/db/schema";
import { ApiError, ok, handleApiError } from "@/lib/api/response";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const [product] = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
    if (!product) throw new ApiError("Product not found.", 404);
    const [images, variants] = await Promise.all([
      db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.position),
      db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    ]);
    return ok({ ...product, images, variants });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const productId = Number(id);
    const body = await request.json();
    const input = productSchema.parse(body);

    const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!existing) throw new ApiError("Product not found.", 404);

    if (input.slug !== existing.slug) {
      const [conflict] = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
      if (conflict) throw new ApiError("A product with this slug already exists.", 409);
    }

    const [updated] = await db
      .update(products)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    await db.delete(productImages).where(eq(productImages.productId, productId));
    await db.insert(productImages).values(
      input.images.map((image, index) => ({
        productId,
        url: image.url,
        altText: image.altText || updated.name,
        position: index,
        isPrimary: image.isPrimary ?? index === 0,
      }))
    );

    await db.delete(productVariants).where(eq(productVariants.productId, productId));
    await db.insert(productVariants).values(
      input.variants.map((variant) => ({
        productId,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        priceOverride: variant.priceOverride ? variant.priceOverride.toFixed(2) : null,
        stock: variant.stock,
        imageUrl: variant.imageUrl || null,
      }))
    );

    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const result = await db.delete(products).where(eq(products.id, Number(id))).returning({ id: products.id });
    if (!result.length) throw new ApiError("Product not found.", 404);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
