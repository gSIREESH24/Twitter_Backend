import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { RetweetController } from "./retweet.controller";

const router = Router();

const retweetController = new RetweetController();

router.post(
  "/:id/retweet",
  authenticate,
  retweetController.retweet
);

router.delete(
  "/:id/retweet",
  authenticate,
  retweetController.undoRetweet
);

router.get(
  "/:id/retweets",
  retweetController.getRetweets
);

router.get(
  "/:id/retweet-count",
  retweetController.getRetweetCount
);

router.get(
  "/:id/is-retweeted",
  authenticate,
  retweetController.checkIsRetweeted
);

export default router;
