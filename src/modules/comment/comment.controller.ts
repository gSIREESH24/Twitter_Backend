import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { CommentService } from "./comment.service";
import { AppError } from "../../common/errors/app-error";

export class CommentController {

  constructor(
    private readonly commentService =
      new CommentService()
  ) {}

  createComment = asyncHandler(
    async (req: Request, res: Response) => {

    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

      const comment =
        await this.commentService.createComment(
          targetUserId,
          req.user!.userId,
          req.body
        );

      res.status(201).json({
        success: true,
        data: comment,
      });

    }
  );

  getComments = asyncHandler(
  async (req: Request, res: Response) => {

    const targetId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!targetId) {
      throw new AppError(400, "Invalid Tweet ID");
    }

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const comments =
      await this.commentService.getComments(
        targetId,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      data: comments,
    });

  }
);

getComment = asyncHandler(
  async (req: Request, res: Response) => {

    const targetId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!targetId) {
      throw new AppError(400, "Invalid Comment ID");
    }

    const comment =
      await this.commentService.getCommentById(
        targetId
      );

    res.status(200).json({
      success: true,
      data: comment,
    });

  }
);

updateComment = asyncHandler(
  async (req: Request, res: Response) => {

    const targetId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!targetId) {
      throw new AppError(400, "Invalid Comment ID");
    }

    const comment =
      await this.commentService.updateComment(
        targetId,
        req.user!.userId,
        req.body
      );

    res.status(200).json({
      success: true,
      data: comment,
    });

  }
);

deleteComment = asyncHandler(
  async (req: Request, res: Response) => {

    const targetId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!targetId) {
      throw new AppError(400, "Invalid Comment ID");
    }

    await this.commentService.deleteComment(
      targetId,
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });

  }
);
}