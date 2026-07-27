import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AppError } from "../../common/errors/app-error";
import { SearchService } from "./search.service";

export class SearchController {

  constructor(
    private readonly searchService =
      new SearchService()
  ) {}

  searchUsers = asyncHandler(
    async (req: Request, res: Response) => {

      const query = Array.isArray(req.query.q)
        ? (req.query.q[0] as string)
        : (req.query.q as string);

      if (!query?.trim()) {
        throw new AppError(
          400,
          "Search query is required"
        );
      }

      const users =
        await this.searchService.searchUsers(
          query
        );

      res.status(200).json({
        success: true,
        data: users,
      });

    }
  );

  searchTweets = asyncHandler(
  async (req: Request, res: Response) => {

    const query = Array.isArray(req.query.q)
      ? (req.query.q[0] as string)
      : (req.query.q as string);

    if (!query?.trim()) {
      throw new AppError(
        400,
        "Search query is required"
      );
    }

    const cursor = Array.isArray(req.query.cursor)
      ? (req.query.cursor[0] as string)
      : (req.query.cursor as string | undefined);

    const limit =
      Number(req.query.limit) || 10;

    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const result =
      await this.searchService.searchTweets(
        query,
        currentUserId,
        cursor,
        limit
      );

    res.status(200).json({
      success: true,
      data: result.tweets,
      nextCursor: result.nextCursor,
    });

  }
);

}