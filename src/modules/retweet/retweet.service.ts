import { AppError } from "../../common/errors/app-error";
import { RetweetRepository } from "./retweet.repository";

export class RetweetService {
  constructor(
    private readonly retweetRepository = new RetweetRepository()
  ) {}

  async retweet(userId: string, tweetId: string) {
    const tweet = await this.retweetRepository.findTweetById(tweetId);

    if (!tweet) {
      throw new AppError(404, "Tweet not found");
    }

    const alreadyRetweeted = await this.retweetRepository.isRetweeted(
      userId,
      tweetId
    );

    if (alreadyRetweeted) {
      throw new AppError(409, "Tweet already retweeted");
    }

    await this.retweetRepository.create(userId, tweetId);
  }

  async undoRetweet(userId: string, tweetId: string) {
    const tweet = await this.retweetRepository.findTweetById(tweetId);

    if (!tweet) {
      throw new AppError(404, "Tweet not found");
    }

    const retweeted = await this.retweetRepository.isRetweeted(
      userId,
      tweetId
    );

    if (!retweeted) {
      throw new AppError(404, "Tweet is not retweeted");
    }

    await this.retweetRepository.delete(userId, tweetId);
  }

  async getRetweets(tweetId: string, page: number, limit: number) {
    const retweets = await this.retweetRepository.getRetweets(
      tweetId,
      page,
      limit
    );

    return retweets.map((retweet) => retweet.user);
  }

  async getRetweetCount(tweetId: string) {
    const retweets = await this.retweetRepository.getRetweetCount(tweetId);

    return {
      retweets,
    };
  }

  async checkIsRetweeted(userId: string, tweetId: string) {
    const retweeted = await this.retweetRepository.isRetweeted(
      userId,
      tweetId
    );

    return {
      isRetweeted: !!retweeted,
    };
  }
}
