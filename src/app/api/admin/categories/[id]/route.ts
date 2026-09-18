import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ApiError, ok, handleApiError } from "@/lib/api/response";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const input = categorySchema.parse(body);
    const [updated] = await db
      .update(categories)
      .set({ name: input.name, slug: input.slug, description: input.description || null, imageUrl: input.imageUrl || null })
      .where(eq(categories.id, Number(id)))
      .returning();
    if (!updated) throw new ApiError("Category not found.", 404);
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const categoryId = Number(id);
    const [inUse] = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, categoryId)).limit(1);
    if (inUse) throw new ApiError("Cannot delete a category that still has products. Reassign or delete those products first.", 409);
    const result = await db.delete(categories).where(eq(categories.id, categoryId)).returning({ id: categories.id });
    if (!result.length) throw new ApiError("Category not found.", 404);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
