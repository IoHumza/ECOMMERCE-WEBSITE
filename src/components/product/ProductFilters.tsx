"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popularity", label: "Most Popular" },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<{ colors: string[]; sizes: string[] }>({ colors: [], sizes: [] });
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  useEffect(() => {
    apiFetch<{ colors: string[]; sizes: string[] }>("/api/products/options").then(setOptions).catch(() => {});
  }, []);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category") ?? "";
  const activeColor = searchParams.get("color") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activeRating = searchParams.get("minRating") ?? "";
  const inStockOnly = searchParams.get("inStock") === "true";
  const activeSort = searchParams.get("sort") ?? "newest";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <p className="text-sm text-slate-600" aria-live="polite">
          Refine your search
        </p>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          Sort by
          <select
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">Category</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam("category", null)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${!activeCategory ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam("category", cat.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeCategory === cat.slug ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">Price Range</legend>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            aria-label="Minimum price"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            aria-label="Maximum price"
          />
        </div>
      </fieldset>

      {options.colors.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-slate-900">Color</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateParam("color", null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${!activeColor ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            >
              Any
            </button>
            {options.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateParam("color", color)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeColor === color ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
              >
                {color}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {options.sizes.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-slate-900">Size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateParam("size", null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${!activeSize ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            >
              Any
            </button>
            {options.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateParam("size", size)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeSize === size ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">Minimum Rating</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {["", "4", "3", "2"].map((rating) => (
            <button
              key={rating || "any"}
              type="button"
              onClick={() => updateParam("minRating", rating || null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${activeRating === rating ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            >
              {rating ? `${rating}+ ★` : "Any"}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => updateParam("inStock", e.target.checked ? "true" : null)}
          className="h-4 w-4 rounded border-slate-300"
        />
        In stock only
      </label>

      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="self-start text-sm font-semibold text-slate-600 underline hover:text-slate-950"
      >
        Clear all filters
      </button>
    </div>
  );
}
