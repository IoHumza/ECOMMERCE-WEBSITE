"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { ApiClientError } from "@/lib/api-client";

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;
const TAX_RATE = 0.08;

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleQuantityChange(itemId: number, quantity: number) {
    setPendingId(itemId);
    try {
      await updateItem(itemId, quantity);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Could not update quantity", "error");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(itemId: number) {
    setPendingId(itemId);
    try {
      await removeItem(itemId);
      showToast("Item removed", "info");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Could not remove item", "error");
    } finally {
      setPendingId(null);
    }
  }

  const shipping = cart.subtotal === 0 || cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = Number((cart.subtotal * TAX_RATE).toFixed(2));
  const total = Number((cart.subtotal + shipping + tax).toFixed(2));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-950">Your Cart</h1>

      {isLoading ? (
        <div className="mt-8 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Let's find something you'll love."
            action={<LinkButton href="/shop">Continue Shopping</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col divide-y divide-slate-200 border-y border-slate-200">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.product.imageUrl && <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/product/${item.product.slug}`} className="text-sm font-semibold text-slate-900 hover:underline">
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.variant.color} / {item.variant.size}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      Qty
                      <select
                        value={item.quantity}
                        disabled={pendingId === item.id}
                        onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
                      >
                        {Array.from({ length: Math.max(item.quantity, item.variant.stock, 1) }, (_, i) => i + 1)
                          .slice(0, 10)
                          .map((n) => (
                            <option key={n} value={n} disabled={n > item.variant.stock}>
                              {n}
                            </option>
                          ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={pendingId === item.id}
                      className="text-sm font-medium text-red-600 underline hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end py-4">
              <button type="button" onClick={() => clearCart()} className="text-sm font-medium text-slate-500 underline hover:text-slate-700">
                Clear cart
              </button>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Estimated tax</dt>
                <dd>{formatCurrency(tax)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-950">
                <dt>Total</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
            </dl>
            {cart.subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="mt-3 text-xs text-slate-600">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - cart.subtotal)} more to qualify for free shipping.
              </p>
            )}
            <LinkButton href="/checkout" size="lg" className="mt-6 w-full">
              Proceed to Checkout
            </LinkButton>
          </aside>
        </div>
      )}
    </div>
  );
}
