import { db } from "@/db";
import { orderItems, orders, products, users, productVariants } from "@/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";

const LOW_STOCK_THRESHOLD = 5;

export async function getAdminDashboardStats() {
  const [[salesRow], [orderCountRow], [customerCountRow], [productCountRow], lowStockItems, recentOrders, statusCounts, topProducts, salesTrend] =
    await Promise.all([
      db
        .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
        .from(orders)
        .where(sql`${orders.status} <> 'cancelled'`),
      db.select({ count: sql<number>`count(*)::int` }).from(orders),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "customer")),
      db.select({ count: sql<number>`count(*)::int` }).from(products),
      db
        .select({
          id: productVariants.id,
          color: productVariants.color,
          size: productVariants.size,
          stock: productVariants.stock,
          productName: products.name,
          productId: products.id,
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(sql`${productVariants.stock} <= ${LOW_STOCK_THRESHOLD}`)
        .orderBy(productVariants.stock)
        .limit(10),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
      db
        .select({ status: orders.status, count: sql<number>`count(*)::int` })
        .from(orders)
        .groupBy(orders.status),
      db
        .select({
          productId: orderItems.productId,
          productName: orderItems.productName,
          unitsSold: sql<number>`sum(${orderItems.quantity})::int`,
          revenue: sql<string>`sum(${orderItems.lineTotal})`,
        })
        .from(orderItems)
        .groupBy(orderItems.productId, orderItems.productName)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5),
      db
        .select({
          day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
          total: sql<string>`coalesce(sum(${orders.total}), 0)`,
          count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, sql`now() - interval '14 days'`), sql`${orders.status} <> 'cancelled'`))
        .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`),
    ]);

  return {
    totalSales: Number(salesRow?.total ?? 0),
    totalOrders: orderCountRow?.count ?? 0,
    totalCustomers: customerCountRow?.count ?? 0,
    totalProducts: productCountRow?.count ?? 0,
    lowStockItems,
    recentOrders,
    statusCounts,
    topProducts: topProducts.map((p) => ({ ...p, revenue: Number(p.revenue) })),
    salesTrend: salesTrend.map((s) => ({ ...s, total: Number(s.total) })),
  };
}
