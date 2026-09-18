"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Rating } from "@/components/ui/Rating";
import { formatCurrency } from "@/lib/format";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { WishlistEntry } from "@/types";

export default function WishlistPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [items, setItems] = useState<WishlistEntry[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?redirect=/account/wishlist");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) apiFetch<WishlistEntry[]>("/api/wishlist").then(setItems).catch(() => {});
  }, [user]);

  async function handleRemove(productId: number) {
    try {
      await apiFetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Could not remove item", "error");
    }
  }

  if (isLoading || !user) return <p className="text-sm text-slate-500">Loading...</p>;

  if (items.length === 0) {
    return <EmptyState title="Your wishlist is empty" description="Save products you love to find them here later." icon="♡" action={<LinkButton href="/shop">Discover Products</LinkButton>} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ product }) => (
        <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200">
          <Link href={`/product/${product.slug}`} className="relative aspect-square w-full bg-slate-100">
            {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill sizes="33vw" className="object-cover" />}
          </Link>
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <Link href={`/product/${product.slug}`} className="text-sm font-semibold text-slate-900 hover:underline">
              {product.name}
            </Link>
            <Rating value={Number(product.avgRating)} count={product.reviewCount} />
            <p className="text-base font-bold text-slate-900">{formatCurrency(product.basePrice)}</p>
            <div className="mt-auto flex gap-2 pt-2">
              <Link href={`/product/${product.slug}`} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800 hover:bg-slate-50">
                View
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(product.id)}
                className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only" aria-live="polite">
        {items.length} items in wishlist
      </span>
    </div>
  );
}
