import { db } from "@/db";
import { categories, productImages, productVariants, products, reviews } from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popularity";

export type ProductListFilters = {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStockOnly?: boolean;
  minRating?: number;
  featured?: boolean;
  newArrival?: boolean;
  sort?: ProductSortOption;
  page?: number;
  pageSize?: number;
  excludeProductId?: number;
};

const DEFAULT_PAGE_SIZE = 12;

function sortToOrderBy(sort: ProductSortOption | undefined) {
  switch (sort) {
    case "price_asc":
      return [asc(products.basePrice)];
    case "price_desc":
      return [desc(products.basePrice)];
    case "rating":
      return [desc(products.avgRating), desc(products.reviewCount)];
    case "popularity":
      return [desc(products.reviewCount), desc(products.avgRating)];
    case "newest":
    default:
      return [desc(products.createdAt)];
  }
}

export async function listProducts(filters: ProductListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(products.isActive, true)];

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.description, term),
        ilike(products.brand, term),
        ilike(products.shortDescription, term)
      )!
    );
  }

  if (filters.categorySlug) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(categories)
          .where(and(eq(categories.id, products.categoryId), eq(categories.slug, filters.categorySlug)))
      )
    );
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.basePrice, filters.minPrice.toFixed(2)));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.basePrice, filters.maxPrice.toFixed(2)));
  }
  if (filters.minRating !== undefined) {
    conditions.push(gte(products.avgRating, filters.minRating.toFixed(2)));
  }
  if (filters.featured) {
    conditions.push(eq(products.isFeatured, true));
  }
  if (filters.newArrival) {
    conditions.push(eq(products.isNewArrival, true));
  }
  if (filters.excludeProductId) {
    conditions.push(sql`${products.id} <> ${filters.excludeProductId}`);
  }

  if (filters.size || filters.color || filters.inStockOnly) {
    const variantConditions = [eq(productVariants.productId, products.id)];
    if (filters.size) variantConditions.push(eq(productVariants.size, filters.size));
    if (filters.color) variantConditions.push(eq(productVariants.color, filters.color));
    if (filters.inStockOnly) variantConditions.push(gte(productVariants.stock, 1));
    conditions.push(
      exists(db.select({ one: sql`1` }).from(productVariants).where(and(...variantConditions)))
    );
  }

  const whereClause = and(...conditions);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(...sortToOrderBy(filters.sort))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(whereClause),
  ]);

  const productIds = rows.map((row) => row.products.id);
  const images = productIds.length
    ? await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.position))
    : [];

  const imagesByProduct = new Map<number, typeof images>();
  for (const image of images) {
    const list = imagesByProduct.get(image.productId) ?? [];
    list.push(image);
    imagesByProduct.set(image.productId, list);
  }

  return {
    items: rows.map((row) => ({
      ...row.products,
      category: row.categories,
      images: imagesByProduct.get(row.products.id) ?? [],
    })),
    pagination: {
      page,
      pageSize,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!row) return null;

  const [images, variants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, row.products.id))
      .orderBy(asc(productImages.position)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, row.products.id)),
  ]);

  return {
    ...row.products,
    category: row.categories,
    images,
    variants,
  };
}

export async function getFeaturedProducts(limit = 8) {
  const { items } = await listProducts({ featured: true, pageSize: limit, sort: "rating" });
  return items;
}

export async function getNewArrivals(limit = 8) {
  const { items } = await listProducts({ newArrival: true, pageSize: limit, sort: "newest" });
  return items;
}

export async function getPopularProducts(limit = 8) {
  const { items } = await listProducts({ pageSize: limit, sort: "popularity" });
  return items;
}

export async function getRelatedProducts(categoryId: number, excludeProductId: number, limit = 4) {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
        sql`${products.id} <> ${excludeProductId}`
      )
    )
    .limit(limit);

  const ids = rows.map((r) => r.id);
  const images = ids.length
    ? await db.select().from(productImages).where(inArray(productImages.productId, ids))
    : [];
  const imagesByProduct = new Map<number, typeof images>();
  for (const image of images) {
    const list = imagesByProduct.get(image.productId) ?? [];
    list.push(image);
    imagesByProduct.set(image.productId, list);
  }
  return rows.map((r) => ({ ...r, images: imagesByProduct.get(r.id) ?? [] }));
}

/** Recomputes and persists the average rating + review count for a product. */
export async function recalculateProductRating(productId: number) {
  const [aggregate] = await db
    .select({
      avgRating: sql<string>`coalesce(avg(${reviews.rating}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));

  await db
    .update(products)
    .set({
      avgRating: Number(aggregate?.avgRating ?? 0).toFixed(2),
      reviewCount: aggregate?.count ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
}

export async function getDistinctVariantOptions() {
  const rows = await db
    .selectDistinct({ color: productVariants.color, size: productVariants.size })
    .from(productVariants);
  const colors = Array.from(new Set(rows.map((r) => r.color))).sort();
  const sizes = Array.from(new Set(rows.map((r) => r.size))).sort();
  return { colors, sizes };
}
