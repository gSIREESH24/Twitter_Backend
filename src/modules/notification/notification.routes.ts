import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { NotificationController } from "./notification.controller";

const router = Router();
const notificationController = new NotificationController();

router.get(
  "/",
  authenticate,
  notificationController.getNotifications
);

router.patch(
  "/read-all",
  authenticate,
  notificationController.markAllAsRead
);

router.patch(
  "/:id/read",
  authenticate,
  notificationController.markAsRead
);

router.delete(
  "/:id",
  authenticate,
  notificationController.deleteNotification
);

export default router;
