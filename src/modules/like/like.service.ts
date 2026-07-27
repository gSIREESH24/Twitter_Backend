import { AppError } from "../../common/errors/app-error";
import { LikeRepository } from "./like.repository";

export class LikeService {

  constructor(
    private readonly likeRepository =
      new LikeRepository()
  ) {}

  async likeTweet(
    userId: string,
    tweetId: string
  ) {

    const tweet =
      await this.likeRepository.findTweetById(
        tweetId
      );

    if (!tweet) {
      throw new AppError(
        404,
        "Tweet not found"
      );
    }

    const alreadyLiked =
      await this.likeRepository.isLiked(
        userId,
        tweetId
      );

    if (alreadyLiked) {
      throw new AppError(
        409,
        "Tweet already liked"
      );
    }

    await this.likeRepository.create(
      userId,
      tweetId
    );
  }

  async unlikeTweet(
    userId: string,
    tweetId: string
    ) {
    const tweet =
        await this.likeRepository.findTweetById(tweetId);

    if (!tweet) {
        throw new AppError(404, "Tweet not found");
    }

    const liked =
        await this.likeRepository.isLiked(
        userId,
        tweetId
        );

    if (!liked) {
        throw new AppError(
        404,
        "Tweet is not liked"
        );
    }

    await this.likeRepository.delete(
        userId,
        tweetId
    );
    }

    async getLikes(
    tweetId: string,
    page: number,
    limit: number
    ) {
    const likes =
        await this.likeRepository.getLikes(
        tweetId,
        page,
        limit
        );

    return likes.map(
        (like) => like.user
    );
    }

    async getLikeCount(tweetId: string) {
        const likes =
            await this.likeRepository.getLikeCount(tweetId);

        return {
            likes,
        };
    }

    async checkIsLiked(
        userId: string,
        tweetId: string
        ) {
        const liked =
            await this.likeRepository.isLiked(
            userId,
            tweetId
            );

        return {
            isLiked: !!liked,
        };
    }
}