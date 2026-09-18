import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type NotificationType = "order_update" | "promotion" | "system" | "review";

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string
) {
  await db.insert(notifications).values({ userId, type, title, message });
}

export async function listNotifications(userId: number, limit = 20) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(userId: number, notificationId: number) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}
