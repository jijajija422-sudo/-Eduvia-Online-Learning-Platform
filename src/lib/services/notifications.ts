import { db } from "@/lib/db";
import type { NotificationType } from "@/types";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
        isRead: false,
      },
    });
  } catch (err) {
    // Notifications must never break a primary workflow.
    console.error("Failed to create notification:", err);
  }
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  await db.notification.deleteMany({
    where: { id, userId },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, isRead: false } });
}
