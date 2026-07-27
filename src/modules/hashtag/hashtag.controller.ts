import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { HashtagService } from "./hashtag.service";
import { AppError } from "../../common/errors/app-error";

export class HashtagController {
  constructor(
    private readonly hashtagService = new HashtagService()
  ) {}

  getTrendingHashtags = asyncHandler(
    async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 10;
      const trending = await this.hashtagService.getTrendingHashtags(limit);

      res.status(200).json({
        success: true,
        data: trending,
      });
    }
  );

  getAllHashtags = asyncHandler(
    async (req: Request, res: Response) => {
      const query = typeof req.query.q === "string" ? req.query.q : undefined;
      const limit = Number(req.query.limit) || 20;

      const hashtags = await this.hashtagService.getAllHashtags(query, limit);

      res.status(200).json({
        success: true,
        data: hashtags,
      });
    }
  );

  getTweetsByHashtag = asyncHandler(
    async (req: Request, res: Response) => {
      const name = Array.isArray(req.params.name)
        ? req.params.name[0]
        : req.params.name;

      if (!name) {
        throw new AppError(400, "Hashtag name is required");
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const tweets = await this.hashtagService.getTweetsByHashtag(
        name,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: tweets,
      });
    }
  );
}
