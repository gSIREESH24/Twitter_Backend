import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AppError } from "../../common/errors/app-error";
import { FeedService } from "./feed.service";

export class FeedController {

  constructor(
    private readonly feedService =
      new FeedService()
  ) {}

  getFeed = asyncHandler(
    async (req: Request, res: Response) => {

      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, "Unauthorized");
      }

     const cursor =
        req.query.cursor as string | undefined;

      const limit =
        Number(req.query.limit) || 10;

      const feed =
        await this.feedService.getFeed(
          userId,
          cursor,
          limit
        );

      res.status(200).json({
        success: true,
        data: feed,
      });

    }
  );

  getDiscoverFeed = asyncHandler(
    async (req: Request, res: Response) => {

      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, "Unauthorized");
      }

      const cursor =
        req.query.cursor as string | undefined;

      const limit =
        Number(req.query.limit) || 10;

      const feed =
        await this.feedService.getDiscoverFeed(
          userId,
          cursor,
          limit
        );

      res.status(200).json({
        success: true,
        data: feed,
      });

    }
  );

  getTrendingFeed = asyncHandler(
    async (req: Request, res: Response) => {

      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, "Unauthorized");
      }

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const feed =
        await this.feedService.getTrendingFeed(
          userId,
          page,
          limit
        );

      res.status(200).json({
        success: true,
        data: feed,
      });

    }
  );

  getUserFeed = asyncHandler(
  async (req: Request, res: Response) => {

    const targetId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!targetId) {
      throw new AppError(
        400,
        "Invalid User ID"
      );
    }

    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const feed =
      await this.feedService.getUserFeed(
        targetId,
        currentUserId,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      data: feed,
    });

  }
);

}