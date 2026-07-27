import { Router } from "express";
import { TweetController } from "./tweet.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validation.middleware";
import { createTweetSchema, updateTweetSchema } from "./tweet.validation";

const router = Router();

const tweetController = new TweetController();

router.post(
  "/",
  authenticate,
  validate(createTweetSchema),
  tweetController.createTweet
);

router.get(
    "/:id",
    tweetController.getTweet
);

router.put(
    "/:id",
    authenticate,
    validate(updateTweetSchema),
    tweetController.updateTweet
);

router.delete(
  "/:id",
  authenticate,
  tweetController.deleteTweet
);

router.get(
    "/user/:id",
    tweetController.getUserTweets
);

export default router;