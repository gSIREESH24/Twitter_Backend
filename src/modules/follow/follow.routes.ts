import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { FollowController } from "./follow.controller";

const router = Router();

const followController =
  new FollowController();

router.post(
  "/:id/follow",
  authenticate,
  followController.followUser
);

router.delete(
  "/:id/follow",
  authenticate,
  followController.unfollowUser
);

router.get(
  "/:id/followers",
  followController.getFollowers
);

router.get(
  "/:id/following",
  followController.getFollowing
);

router.get(
  "/:id/follow-stats",
  followController.getFollowStats
);

router.get(
  "/:id/is-following",
  authenticate,
  followController.checkIsFollowing
);

export default router;