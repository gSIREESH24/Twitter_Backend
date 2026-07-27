import { prisma } from "../../config/database";
import { retweetUserSelect } from "./retweet.select";

export class RetweetRepository {
  async findTweetById(id: string) {
    return prisma.tweet.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        authorId: true,
      },
    });
  }

  async isRetweeted(userId: string, tweetId: string) {
    return prisma.retweet.findUnique({
      where: {
        userId_tweetId: {
          userId,
          tweetId,
        },
      },
    });
  }

  async create(userId: string, tweetId: string) {
    return prisma.retweet.create({
      data: {
        userId,
        tweetId,
      },
    });
  }

  async delete(userId: string, tweetId: string) {
    return prisma.retweet.delete({
      where: {
        userId_tweetId: {
          userId,
          tweetId,
        },
      },
    });
  }

  async getRetweets(tweetId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return prisma.retweet.findMany({
      where: {
        tweetId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: retweetUserSelect,
    });
  }

  async getRetweetCount(tweetId: string) {
    return prisma.retweet.count({
      where: {
        tweetId,
      },
    });
  }
}
