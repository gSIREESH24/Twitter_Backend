import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { tweetSelect } from "./tweet.select";

export class TweetRepository {
  async create(data: Prisma.TweetCreateInput) {
    return prisma.tweet.create({
      data,
      select: tweetSelect,
    });
  }

  async findById(id: string) {
    return prisma.tweet.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,

        author: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async update(id: string, content: string, tags: string[] = []) {
    return prisma.tweet.update({
      where: {
        id,
      },
      data: {
        content,
        hashtags: {
          deleteMany: {},
          create: tags.map((tag) => ({
            hashtag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag },
              },
            },
          })),
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.tweet.delete({
      where: {
        id,
      },
    });
  }

  async findByUserIdCursor(
    userId: string,
    cursor: string | undefined,
    limit: number
  ) {
    return prisma.tweet.findMany({
      where: {
        authorId: userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: limit,

      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),

      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });
  }
}