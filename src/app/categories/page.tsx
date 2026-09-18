import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { listCategories } from "@/server/services/category.service";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-950">All Categories</h1>
      <p className="mt-2 text-sm text-slate-600">Browse our full range of curated collections.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl bg-slate-100 p-5 shadow-sm transition hover:shadow-lg"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative">
              <h2 className="text-lg font-bold text-white">{category.name}</h2>
              <p className="text-sm text-slate-200">{category.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
