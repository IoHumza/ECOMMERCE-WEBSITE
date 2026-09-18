"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { apiFetch } from "@/lib/api-client";
import type { Order, OrderItem } from "@/types";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<{ order: Order; items: OrderItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push(`/login?redirect=/account/orders/${params.id}`);
  }, [isLoading, user, router, params.id]);

  useEffect(() => {
    if (user) {
      apiFetch<{ order: Order; items: OrderItem[] }>(`/api/orders/${params.id}`)
        .then(setData)
        .catch(() => setError("We couldn't find that order."));
    }
  }, [user, params.id]);

  if (isLoading || !user) return <p className="text-sm text-slate-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading order...</p>;

  const { order, items } = data;
  const isTerminalNegative = order.status === "cancelled" || order.status === "returned";
  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Order {order.orderNumber}</h2>
          <p className="text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge tone={isTerminalNegative ? "danger" : "info"}>{formatOrderStatus(order.status)}</Badge>
      </div>

      {!isTerminalNegative && (
        <ol className="mt-8 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                  index <= currentStepIndex ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {index + 1}
              </span>
              <span className={index <= currentStepIndex ? "text-slate-900" : ""}>{formatOrderStatus(step)}</span>
              {index < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300" />}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Items</h3>
          <div className="mt-3 flex flex-col divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.productId ? (
                      <Link href={`/product/${item.productId}`} className="hover:underline">
                        {item.productName}
                      </Link>
                    ) : (
                      item.productName
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.variantLabel} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900">Shipping Address</h3>
          <p className="mt-2 text-sm text-slate-700">
            {order.shippingFullName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
            <br />
            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
            <br />
            {order.shippingCountry}
            <br />
            {order.shippingPhone}
          </p>

          <h3 className="mt-6 text-sm font-semibold text-slate-900">Payment</h3>
          <p className="mt-2 text-sm capitalize text-slate-700">
            {order.paymentMethod.replace("_", " ")} — {order.paymentStatus}
          </p>

          <dl className="mt-6 flex flex-col gap-2 border-t border-slate-300 pt-4 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.subtotal)}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                <dd>-{formatCurrency(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{Number(order.shipping) === 0 ? "Free" : formatCurrency(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>{formatCurrency(order.tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-950">
              <dt>Total</dt>
              <dd>{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
