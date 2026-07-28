import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validation.middleware";
import {
  createCommentSchema,
  updateCommentSchema,
} from "./comment.validation";
import { CommentController } from "./comment.controller";

import { rateLimiter } from "../../common/middleware/rate-limit.middleware";

const router = Router();

const commentController =
  new CommentController();

router.post(
  "/tweets/:id/comments",
  authenticate,
  rateLimiter("comments", 60, 60 / 60),
  validate(createCommentSchema),
  commentController.createComment
);

router.get(
  "/tweets/:id/comments",
  commentController.getComments
);

// Comment-related APIs
router.get(
  "/comments/:id",
  commentController.getComment
);

router.put(
  "/comments/:id",
  authenticate,
  validate(updateCommentSchema),
  commentController.updateComment
);

router.delete(
  "/comments/:id",
  authenticate,
  commentController.deleteComment
);

export default router;