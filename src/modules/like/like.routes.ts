import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { LikeController } from "./like.controller";

import { rateLimiter } from "../../common/middleware/rate-limit.middleware";

const router = Router();

const likeController =
  new LikeController();

router.post(
  "/:id/like",
  authenticate,
  rateLimiter("likes", 200, 200 / 60),
  likeController.likeTweet
);

router.delete(
  "/:id/like",
  authenticate,
  likeController.unlikeTweet
);


router.get(
  "/:id/likes",
  likeController.getLikes
);

router.get(
  "/:id/like-count",
  likeController.getLikeCount
);

router.get(
  "/:id/is-liked",
  authenticate,
  likeController.checkIsLiked
);

export default router;