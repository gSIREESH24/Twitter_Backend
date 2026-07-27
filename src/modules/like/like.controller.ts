import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { LikeService } from "./like.service";

export class LikeController {

  constructor(
    private readonly likeService =
      new LikeService()
  ) {}

  likeTweet = asyncHandler(
    async (req: Request, res: Response) => {

      const targetUserId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      await this.likeService.likeTweet(
        req.user!.userId,
        targetUserId
      );

      res.status(201).json({
        success: true,
        message: "Tweet liked successfully",
      });

    }
  );

  unlikeTweet = asyncHandler(
  async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    await this.likeService.unlikeTweet(
      req.user!.userId,
        targetUserId
    );

    res.status(200).json({
      success: true,
      message: "Tweet unliked successfully",
    });

  }
);

getLikes = asyncHandler(
  async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const likes =
      await this.likeService.getLikes(
        targetUserId,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      data: likes,
    });

  }
);

getLikeCount = asyncHandler(
  async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const result =
      await this.likeService.getLikeCount(
        targetUserId
      );

    res.status(200).json({
      success: true,
      data: result,
    });

  }
);

checkIsLiked = asyncHandler(
  async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const result =
      await this.likeService.checkIsLiked(
        req.user!.userId,
        targetUserId
      );

    res.status(200).json({
      success: true,
      data: result,
    });

  }
);
}