import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AppError } from "../../common/errors/app-error";
import { NotificationService } from "./notification.service";

export class NotificationController {
  constructor(
    private readonly notificationService = new NotificationService()
  ) {}

  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const notifications = await this.notificationService.getNotifications(
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const notificationId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const notification = await this.notificationService.markAsRead(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    await this.notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const notificationId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    await this.notificationService.deleteNotification(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  });
}
