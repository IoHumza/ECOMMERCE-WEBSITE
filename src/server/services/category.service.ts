import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export async function listCategories() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
      parentId: categories.parentId,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
  return rows;
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCategoryById(id: number) {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}
