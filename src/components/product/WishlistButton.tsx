"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export function WishlistButton({ productId }: { productId: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsWishlisted(false);
      return;
    }
    apiFetch<{ product: { id: number } }[]>("/api/wishlist")
      .then((items) => setIsWishlisted(items.some((item) => item.product.id === productId)))
      .catch(() => {});
  }, [user, productId]);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    try {
      if (isWishlisted) {
        await apiFetch(`/api/wishlist/${productId}`, { method: "DELETE" });
        setIsWishlisted(false);
        showToast("Removed from wishlist", "info");
      } else {
        await apiFetch("/api/wishlist", { method: "POST", body: JSON.stringify({ productId }) });
        setIsWishlisted(true);
        showToast("Added to wishlist", "success");
      }
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-pressed={isWishlisted}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
        isWishlisted ? "border-red-300 bg-red-50 text-red-700" : "border-slate-300 text-slate-800 hover:bg-slate-50"
      }`}
    >
      <span aria-hidden="true">{isWishlisted ? "♥" : "♡"}</span>
      {isWishlisted ? "Saved" : "Save"}
    </button>
  );
}
