import {prisma} from "../../config/database";

export class LikeRepository {

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

  async isLiked(
    userId: string,
    tweetId: string
  ) {
    return prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId,
          tweetId,
        },
      },
    });
  }

  async create(
    userId: string,
    tweetId: string
  ) {
    return prisma.like.create({
      data: {
        userId,
        tweetId,
      },
    });
  }

  async delete(
  userId: string,
  tweetId: string
) {
  return prisma.like.delete({
    where: {
      userId_tweetId: {
        userId,
        tweetId,
      },
    },
  });
}

async getLikes(
  tweetId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  return prisma.like.findMany({
    where: {
      tweetId,
    },

    skip,

    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    select: {
      user: {
        select: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
    },
  });
}

async getLikeCount(tweetId: string) {
  return prisma.like.count({
    where: {
      tweetId,
    },
  });
}
}