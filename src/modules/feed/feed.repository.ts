import {prisma} from "../../config/database";
import { feedSelect } from "./feed.select";

export class FeedRepository {

async getFeed(
  userId: string,
  cursor: string | undefined,
  limit: number
) {
  return prisma.tweet.findMany({
    where: {
      author: {
        followers: {
          some: {
            followerId: userId,
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    cursor: cursor
      ? { id: cursor }
      : undefined,

    skip: cursor ? 1 : 0,

    take: limit,

    select: feedSelect,
  });
}

async getDiscoverFeed(
  userId: string,
  cursor: string | undefined,
  limit: number
) {
  return prisma.tweet.findMany({
    orderBy: {
      createdAt: "desc",
    },

    cursor: cursor
      ? { id: cursor }
      : undefined,

    skip: cursor ? 1 : 0,

    take: limit,

    select: feedSelect,
  });
}

async getTrendingFeed(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  return prisma.tweet.findMany({
    orderBy: [
      {
        likes: {
          _count: "desc",
        },
      },
      {
        comments: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],

    skip,

    take: limit,

    select: feedSelect,
  });
}

async findUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });
}

async getUserFeed(
  profileUserId: string,
  currentUserId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  return prisma.tweet.findMany({
    where: {
      authorId: profileUserId,
    },

    orderBy: {
      createdAt: "desc",
    },

    skip,

    take: limit,

    select: {
      ...feedSelect,

      likes: {
        where: {
          userId: currentUserId,
        },
        select: {
          userId: true,
        },
      },
    },
  });
}

}