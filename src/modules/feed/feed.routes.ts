import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { FeedController } from "./feed.controller";

const router = Router();

const feedController =
  new FeedController();

router.get(
  "/",
  authenticate,
  feedController.getFeed
);

router.get(
  "/discover",
  authenticate,
  feedController.getDiscoverFeed
);

router.get(
  "/trending",
  authenticate,
  feedController.getTrendingFeed
);

router.get(
  "/users/:id/feed",
  authenticate,
  feedController.getUserFeed
);

export default router;