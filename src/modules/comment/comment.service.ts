import { AppError } from "../../common/errors/app-error";
import { CommentRepository } from "./comment.repository";
import { CreateCommentDto } from "./comment.validation";
import { UpdateCommentDto } from "./comment.validation";

export class CommentService {

  constructor(
    private readonly commentRepository =
      new CommentRepository()
  ) {}

  async createComment(
    tweetId: string,
    userId: string,
    data: CreateCommentDto
  ) {

    const tweet =
      await this.commentRepository.findTweetById(
        tweetId
      );

    if (!tweet) {
      throw new AppError(
        404,
        "Tweet not found"
      );
    }

    return this.commentRepository.create({
      content: data.content,

      user: {
        connect: {
          id: userId,
        },
      },

      tweet: {
        connect: {
          id: tweetId,
        },
      },
    });
  }

  async getComments(
  tweetId: string,
  page: number,
  limit: number
) {
  return this.commentRepository.getComments(
    tweetId,
    page,
    limit
  );
}

async getCommentById(commentId: string) {
  const comment =
    await this.commentRepository.findById(commentId);

  if (!comment) {
    throw new AppError(
      404,
      "Comment not found"
    );
  }

  return comment;
}

async updateComment(
  commentId: string,
  userId: string,
  data: UpdateCommentDto
) {

  const comment =
    await this.commentRepository.findCommentById(
      commentId
    );

  if (!comment) {
    throw new AppError(
      404,
      "Comment not found"
    );
  }

  if (comment.userId !== userId) {
    throw new AppError(
      403,
      "You can only update your own comment"
    );
  }

  return this.commentRepository.update(
    commentId,
    data.content
  );
}

async deleteComment(
  commentId: string,
  userId: string
) {

  const comment =
    await this.commentRepository.findCommentById(
      commentId
    );

  if (!comment) {
    throw new AppError(
      404,
      "Comment not found"
    );
  }

  if (comment.userId !== userId) {
    throw new AppError(
      403,
      "You can only delete your own comment"
    );
  }

  await this.commentRepository.delete(
    commentId
  );
}
}