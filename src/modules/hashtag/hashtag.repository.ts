import { prisma } from "../../config/database";
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

  async getTrendingHashtags(limit: number = 10) {
    const trending = await prisma.tweetHashtag.groupBy({
      by: ["hashtagId"],
      _count: {
        tweetId: true,
      },
      orderBy: {
        _count: {
          tweetId: "desc",
        },
      },
      take: limit,
    });

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

    return trending
      .map((item) => ({
        name: hashtagMap.get(item.hashtagId) ?? "",
        count: item._count.tweetId,
      }))
      .filter((item) => item.name !== "");
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
