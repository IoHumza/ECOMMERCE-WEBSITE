import { Suspense } from "react";
import type { Metadata } from "next";
import { listProducts, type ProductSortOption } from "@/server/services/product.service";
import { listCategories } from "@/server/services/category.service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = { title: "Shop All Products" };

const VALID_SORTS: ProductSortOption[] = ["newest", "price_asc", "price_desc", "rating", "popularity"];

type SearchParams = { [key: string]: string | string[] | undefined };

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sort = getParam(params, "sort");
  const [categories, result] = await Promise.all([
    listCategories(),
    listProducts({
      categorySlug: getParam(params, "category"),
      color: getParam(params, "color"),
      size: getParam(params, "size"),
      minPrice: getParam(params, "minPrice") ? Number(getParam(params, "minPrice")) : undefined,
      maxPrice: getParam(params, "maxPrice") ? Number(getParam(params, "maxPrice")) : undefined,
      minRating: getParam(params, "minRating") ? Number(getParam(params, "minRating")) : undefined,
      inStockOnly: getParam(params, "inStock") === "true",
      featured: getParam(params, "featured") === "true",
      sort: sort && VALID_SORTS.includes(sort as ProductSortOption) ? (sort as ProductSortOption) : "newest",
      page: getParam(params, "page") ? Number(getParam(params, "page")) : 1,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-950">Shop All Products</h1>
        <p className="mt-2 text-sm text-slate-600">
          {result.pagination.total} product{result.pagination.total === 1 ? "" : "s"} found
        </p>
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
            <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} basePath="/shop" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
