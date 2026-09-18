import { Suspense } from "react";
import type { Metadata } from "next";
import { listProducts } from "@/server/services/product.service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = { title: "Search Results" };

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";
  const page = sp.page ? Number(sp.page) : 1;

  const result = query
    ? await listProducts({ search: query, page })
    : { items: [], pagination: { page: 1, pageSize: 12, total: 0, totalPages: 1 } };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-950">Search Results</h1>
      <p className="mt-2 text-sm text-slate-600">
        {query ? (
          <>
            {result.pagination.total} result{result.pagination.total === 1 ? "" : "s"} for <strong>&ldquo;{query}&rdquo;</strong>
          </>
        ) : (
          "Enter a search term to find products."
        )}
      </p>
      <div className="mt-8">
        <ProductGrid products={result.items} />
        <Suspense fallback={null}>
          <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} basePath="/search" />
        </Suspense>
      </div>
    </div>
  );
}
