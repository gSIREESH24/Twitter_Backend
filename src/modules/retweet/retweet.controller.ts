import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { RetweetService } from "./retweet.service";

export class RetweetController {
  constructor(
    private readonly retweetService = new RetweetService()
  ) {}

  retweet = asyncHandler(
    async (req: Request, res: Response) => {
      const targetTweetId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      await this.retweetService.retweet(
        req.user!.userId,
        targetTweetId
      );

      res.status(201).json({
        success: true,
        message: "Tweet retweeted successfully",
      });
    }
  );

  undoRetweet = asyncHandler(
    async (req: Request, res: Response) => {
      const targetTweetId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      await this.retweetService.undoRetweet(
        req.user!.userId,
        targetTweetId
      );

      res.status(200).json({
        success: true,
        message: "Retweet undone successfully",
      });
    }
  );

  getRetweets = asyncHandler(
    async (req: Request, res: Response) => {
      const targetTweetId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const retweets = await this.retweetService.getRetweets(
        targetTweetId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: retweets,
      });
    }
  );

  getRetweetCount = asyncHandler(
    async (req: Request, res: Response) => {
      const targetTweetId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await this.retweetService.getRetweetCount(
        targetTweetId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  checkIsRetweeted = asyncHandler(
    async (req: Request, res: Response) => {
      const targetTweetId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await this.retweetService.checkIsRetweeted(
        req.user!.userId,
        targetTweetId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );
}
