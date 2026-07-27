import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { FollowService } from "./follow.service";

export class FollowController {
  constructor(
    private readonly followService =
      new FollowService()
  ) {}

  followUser = asyncHandler(
    async (req: Request, res: Response) => {
      const targetUserId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      await this.followService.followUser(
        req.user!.userId,
        targetUserId
      );

      res.status(201).json({
        success: true,
        message: "User followed successfully",
      });
    }
  );

  unfollowUser = asyncHandler(
  async (req: Request, res: Response) => {
    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    await this.followService.unfollowUser(
      req.user!.userId,
      targetUserId
    );

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  }
);

getFollowers = asyncHandler(
  async (req: Request, res: Response) => {

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const followers =
      await this.followService.getFollowers(
        targetUserId,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      data: followers,
    });

  }
);

getFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const following =
      await this.followService.getFollowing(
        targetUserId,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      data: following,
    });
  }
);

getFollowStats = asyncHandler(
  async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const stats =
      await this.followService.getFollowStats(
        targetUserId
      );

    res.status(200).json({
      success: true,
      data: stats,
    });

  }
);

checkIsFollowing = asyncHandler(
  async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result =
      await this.followService.checkIsFollowing(
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