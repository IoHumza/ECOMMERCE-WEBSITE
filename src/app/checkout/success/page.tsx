"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/LinkButton";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    apiFetch<{ order: Order }>(`/api/orders/${orderId}`)
      .then((data) => setOrder(data.order))
      .catch(() => {});
  }, [orderId]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700" aria-hidden="true">
        ✓
      </span>
      <h1 className="mt-6 text-3xl font-black text-slate-950">Thank you for your order!</h1>
      <p className="mt-3 text-slate-600">
        {order ? (
          <>
            Your order <strong>{order.orderNumber}</strong> has been placed successfully. We&apos;ve sent a confirmation to your
            account, and your total was <strong>{formatCurrency(order.total)}</strong>.
          </>
        ) : (
          "Your order has been placed successfully."
        )}
      </p>
      <div className="mt-8 flex gap-4">
        <LinkButton href="/account/orders">View My Orders</LinkButton>
        <LinkButton href="/shop" variant="outline">
          Continue Shopping
        </LinkButton>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-slate-500">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
