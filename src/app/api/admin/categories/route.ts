import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation";
import { listCategories } from "@/server/services/category.service";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ApiError, created, ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin();
    const items = await listCategories();
    return ok(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = categorySchema.parse(body);
    const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
    if (existing) throw new ApiError("A category with this slug already exists.", 409);
    const [category] = await db
      .insert(categories)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
      })
      .returning();
    return created(category);
  } catch (error) {
    return handleApiError(error);
  }
}
