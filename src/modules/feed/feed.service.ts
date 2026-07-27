import { FeedRepository } from "./feed.repository";
import { AppError } from "../../common/errors/app-error";

export class FeedService {

  constructor(
    private readonly feedRepository =
      new FeedRepository()
  ) {}

  async getFeed(
  userId: string,
  cursor: string | undefined,
  limit: number
) {

  const tweets =
    await this.feedRepository.getFeed(
      userId,
      cursor,
      limit
    );

  return tweets.map((tweet) => ({

    id: tweet.id,

    content: tweet.content,

    createdAt: tweet.createdAt,

    updatedAt: tweet.updatedAt,

    author: tweet.author,

    likeCount: tweet._count.likes,

    commentCount: tweet._count.comments,

    isLiked: tweet.likes.some(
      (like) => like.userId === userId
    ),

  }));

}

async getDiscoverFeed(
  userId: string,
  cursor: string | undefined,
  limit: number
) {

  const tweets =
    await this.feedRepository.getDiscoverFeed(
      userId,
      cursor,
      limit
    );

  return tweets.map((tweet) => ({

    id: tweet.id,

    content: tweet.content,

    createdAt: tweet.createdAt,

    updatedAt: tweet.updatedAt,

    author: tweet.author,

    likeCount: tweet._count.likes,

    commentCount: tweet._count.comments,

    isLiked: tweet.likes.some(
      (like) => like.userId === userId
    ),

  }));

}

async getTrendingFeed(
  userId: string,
  page: number,
  limit: number
) {

  const tweets =
    await this.feedRepository.getTrendingFeed(
      userId,
      page,
      limit
    );

  return tweets.map((tweet) => ({

    id: tweet.id,

    content: tweet.content,

    createdAt: tweet.createdAt,

    updatedAt: tweet.updatedAt,

    author: tweet.author,

    likeCount: tweet._count.likes,

    commentCount: tweet._count.comments,

    isLiked: tweet.likes.some(
      (like) => like.userId === userId
    ),

  }));

}

async getUserFeed(
  profileUserId: string,
  currentUserId: string,
  page: number,
  limit: number
) {

  const user =
    await this.feedRepository.findUserById(
      profileUserId
    );

  if (!user) {
    throw new AppError(
      404,
      "User not found"
    );
  }

  const tweets =
    await this.feedRepository.getUserFeed(
      profileUserId,
      currentUserId,
      page,
      limit
    );

  return tweets.map((tweet) => ({
    id: tweet.id,
    content: tweet.content,
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,
    author: tweet.author,
    likeCount: tweet._count.likes,
    commentCount: tweet._count.comments,
    isLiked: tweet.likes.length > 0,
  }));
}

}