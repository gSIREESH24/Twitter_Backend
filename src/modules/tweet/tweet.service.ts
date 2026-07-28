import { Prisma } from "@prisma/client";
import { TweetRepository } from "./tweet.repository";
import { CreateTweetDto, UpdateTweetDto } from "./tweet.validation";
import { AppError } from "../../common/errors/app-error";
import { extractHashtags } from "../../common/utils/hashtag";
import redisClient from "../../config/redis";
import { eventBus } from "../../common/events";

export class TweetService {
  private readonly tweetRepository = new TweetRepository();

  async createTweet(userId: string, data: CreateTweetDto) {
    const tags = extractHashtags(data.content);

    const tweet = await this.tweetRepository.create({
      ...data,
      author: {
        connect: {
          id: userId,
        },
      },
      hashtags: {
        create: tags.map((tag) => ({
          hashtag: {
            connectOrCreate: {
              where: { name: tag },
              create: { name: tag },
            },
          },
        })),
      },
    });

    const uniqueHashtags = [...new Set(tags)];
    for (const hashtag of uniqueHashtags) {
      await redisClient.zIncrBy("trending:hashtags", 1, hashtag);
    }

    await redisClient.del(`feed:${userId}`);
    await eventBus.publish("tweet-created", { authorId: userId, tweetId: tweet.id });

    return tweet;
  }

  async getTweet(id: string) {
    const cacheKey = `tweet:${id}`;

    const cachedTweet = await redisClient.get(cacheKey);

    if (cachedTweet) {
        return JSON.parse(cachedTweet);
    }
    const tweet = await this.tweetRepository.findById(id);

    if (!tweet) {
      throw new AppError(404, "Tweet not found");
    }

    await redisClient.setEx(
        cacheKey,
        300,
        JSON.stringify(tweet)
    );

    return tweet;

  }

  async updateTweet(
    tweetId: string,
    userId: string,
    data: UpdateTweetDto
  ) {
    const tweet = await this.tweetRepository.findById(tweetId);

    if (!tweet) {
      throw new AppError(404, "Tweet not found");
    }

    if (tweet.author.id !== userId) {
      throw new AppError(
        403,
        "You are not allowed to update this tweet"
      );
    }

    const tags = extractHashtags(data.content);

    await redisClient.del(`tweet:${tweetId}`);
    await redisClient.del(`feed:${userId}`);

    return this.tweetRepository.update(
      tweetId,
      data.content,
      tags
    );

  }

  async deleteTweet(tweetId: string, userId: string) {
    const tweet = await this.tweetRepository.findById(tweetId);

    if (!tweet) {
      throw new AppError(404, "Tweet not found");
    }

    if (tweet.author.id !== userId) {
      throw new AppError(
        403,
        "You are not allowed to delete this tweet"
      );
    }

    await this.tweetRepository.delete(tweetId);

    await redisClient.del(`tweet:${tweetId}`);
    await redisClient.del(`feed:${userId}`);
    await eventBus.publish("tweet-deleted", { authorId: userId, tweetId });
  }

  async getUserTweets(
    userId: string,
    cursor: string | undefined,
    limit: number
  ) {
    return this.tweetRepository.findByUserIdCursor(
      userId,
      cursor,
      limit
    );
  }
}