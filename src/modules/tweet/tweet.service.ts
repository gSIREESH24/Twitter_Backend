import { Prisma } from "@prisma/client";
import { TweetRepository } from "./tweet.repository";
import { CreateTweetDto, UpdateTweetDto } from "./tweet.validation";
import { AppError } from "../../common/errors/app-error";

export class TweetService {
  private readonly tweetRepository = new TweetRepository();

  async createTweet(
    userId: string,
    data: CreateTweetDto
  ) {
    return this.tweetRepository.create({
      ...data,
      author: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async getTweet(id: string) {
    const tweet = await this.tweetRepository.findById(id);

    if(!tweet){
        throw new AppError(404,"Tweet not found");
    }

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

    return this.tweetRepository.update(
        tweetId,
        data.content
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