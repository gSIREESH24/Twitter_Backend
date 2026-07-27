import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { notificationSelect } from "./notification.select";

export class NotificationRepository {
  async getNotifications(recipientId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return prisma.notification.findMany({
      where: {
        recipientId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      select: notificationSelect,
    });
  }

  async findNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        recipientId: true,
        isRead: true,
      },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
      select: notificationSelect,
    });
  }

  async markAllAsRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: {
        id,
      },
    });
  }

  async create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({
      data,
      select: notificationSelect,
    });
  }
}
