import { Request, Response } from "express";
import { TweetService } from "./tweet.service";
import { asyncHandler } from "../../common/utils/async-handler";

export class TweetController {
  private readonly tweetService = new TweetService();

createTweet = asyncHandler(async (req: Request, res: Response) => {
    const tweet = await this.tweetService.createTweet(
      req.user!.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Tweet created successfully",
      data: tweet,
    });
  });

  getTweet = asyncHandler(async (req: Request, res: Response) => {
    const tweetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const tweet = await this.tweetService.getTweet(tweetId);

    res.status(200).json({
      success: true,
      data: tweet,
    });
  });

updateTweet = asyncHandler(async (req: Request, res: Response) => {
    const tweetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const tweet = await this.tweetService.updateTweet(
      tweetId,
      req.user!.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: tweet,
    });
  });

deleteTweet = asyncHandler(async (req: Request, res: Response) => {
    const tweetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await this.tweetService.deleteTweet(
      tweetId,
      req.user!.userId
    );

  res.status(200).json({
    success: true,
    message: "Tweet deleted successfully",
  });
});

getUserTweets = asyncHandler(async (req, res) => {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const page =
        Number(req.query.page) || 1;

      const cursor =
        req.query.cursor as string | undefined;

      const limit =
        Number(req.query.limit) || 10;

      const tweets =
        await this.tweetService.getUserTweets(
          userId,
          cursor,
          limit
        );

      res.status(200).json({
        success: true,
        data: tweets,
      });
});

}