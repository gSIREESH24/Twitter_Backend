import { prisma } from "../../config/database";
import redisClient from "../../config/redis";
import { hashtagTweetSelect } from "./hashtag.select";

export class HashtagRepository {
  async findByName(name: string) {
    return prisma.hashtag.findUnique({
      where: {
        name: name.toLowerCase(),
      },
    });
  }

  async getTweetsByHashtag(name: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return prisma.tweet.findMany({
      where: {
        hashtags: {
          some: {
            hashtag: {
              name: name.toLowerCase(),
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: hashtagTweetSelect,
    });
  }

  async rebuildTrendingCache() {
    const trending = await prisma.tweetHashtag.groupBy({
      by: ["hashtagId"],
      _count: {
        tweetId: true,
      },
    });

    if (trending.length === 0) return;

    const hashtagIds = trending.map((item) => item.hashtagId);

    const hashtags = await prisma.hashtag.findMany({
      where: {
        id: {
          in: hashtagIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const hashtagMap = new Map(hashtags.map((h) => [h.id, h.name]));

    const redisData = trending
      .map((item) => {
        const name = hashtagMap.get(item.hashtagId);
        return name ? { score: item._count.tweetId, value: name } : null;
      })
      .filter((item): item is { score: number; value: string } => item !== null);

    if (redisData.length > 0) {
      await redisClient.del("trending:hashtags");
      await redisClient.zAdd("trending:hashtags", redisData);
    }
  }

  async getTrendingHashtags(limit: number = 10) {
    let trending = await redisClient.zRangeWithScores(
      "trending:hashtags",
      0,
      limit - 1,
      {
        REV: true,
      }
    );

    if (trending.length === 0) {
      await this.rebuildTrendingCache();
      trending = await redisClient.zRangeWithScores(
        "trending:hashtags",
        0,
        limit - 1,
        {
          REV: true,
        }
      );
    }

    return trending.map((item) => ({
      name: item.value,
      count: item.score,
    }));
  }

  async getAllHashtags(query?: string, limit: number = 20) {
    return prisma.hashtag.findMany({
      where: query
        ? {
            name: {
              contains: query.toLowerCase(),
              mode: "insensitive",
            },
          }
        : {},
      take: limit,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
