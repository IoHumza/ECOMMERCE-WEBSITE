"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { apiFetch } from "@/lib/api-client";
import type { Order } from "@/types";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?redirect=/account/orders");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      apiFetch<Order[]>("/api/orders")
        .then(setOrders)
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (isLoading || !user || loadingOrders) return <p className="text-sm text-slate-500">Loading orders...</p>;

  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Once you place an order, it will show up here." icon="📦" action={<LinkButton href="/shop">Start Shopping</LinkButton>} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-5 transition hover:border-slate-400 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-900">{order.orderNumber}</p>
            <p className="text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>{formatOrderStatus(order.status)}</Badge>
            <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
