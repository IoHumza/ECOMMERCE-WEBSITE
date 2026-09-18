import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listCategories } from "@/server/services/category.service";
import { listProducts, type ProductSortOption } from "@/server/services/product.service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";

const VALID_SORTS: ProductSortOption[] = ["newest", "price_asc", "price_desc", "rating", "popularity"];

type Params = { slug: string };
type SearchParams = { [key: string]: string | string[] | undefined };

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return { title: category.name, description: category.description ?? undefined };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = getParam(sp, "sort");
  const [categories, result] = await Promise.all([
    listCategories(),
    listProducts({
      categorySlug: slug,
      color: getParam(sp, "color"),
      size: getParam(sp, "size"),
      minPrice: getParam(sp, "minPrice") ? Number(getParam(sp, "minPrice")) : undefined,
      maxPrice: getParam(sp, "maxPrice") ? Number(getParam(sp, "maxPrice")) : undefined,
      minRating: getParam(sp, "minRating") ? Number(getParam(sp, "minRating")) : undefined,
      inStockOnly: getParam(sp, "inStock") === "true",
      sort: sort && VALID_SORTS.includes(sort as ProductSortOption) ? (sort as ProductSortOption) : "newest",
      page: getParam(sp, "page") ? Number(getParam(sp, "page")) : 1,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-950">{category.name}</h1>
        {category.description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{category.description}</p>}
      </header>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <aside aria-label="Product filters">
          <Suspense fallback={null}>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>
        <div>
          <ProductGrid products={result.items} />
          <Suspense fallback={null}>
            <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} basePath={`/category/${slug}`} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
