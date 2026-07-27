import { AppError } from "../../common/errors/app-error";
import { NotificationRepository } from "./notification.repository";

export class NotificationService {
  constructor(
    private readonly notificationRepository = new NotificationRepository()
  ) {}

  async getNotifications(recipientId: string, page: number, limit: number) {
    return this.notificationRepository.getNotifications(
      recipientId,
      page,
      limit
    );
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification =
      await this.notificationRepository.findNotificationById(notificationId);

    if (!notification) {
      throw new AppError(404, "Notification not found");
    }

    if (notification.recipientId !== userId) {
      throw new AppError(403, "You can only update your own notification");
    }

    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(recipientId: string) {
    return this.notificationRepository.markAllAsRead(recipientId);
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification =
      await this.notificationRepository.findNotificationById(notificationId);

    if (!notification) {
      throw new AppError(404, "Notification not found");
    }

    if (notification.recipientId !== userId) {
      throw new AppError(403, "You can only delete your own notification");
    }

    await this.notificationRepository.delete(notificationId);
  }
}
