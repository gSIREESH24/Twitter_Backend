import {prisma} from "../../config/database";

export class FollowRepository {

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }

  async isFollowing(
    followerId: string,
    followingId: string
  ) {
    return prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async create(
    followerId: string,
    followingId: string
  ) {
    return prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async delete(
    followerId: string,
    followingId: string
  ) {
    return prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

async getFollowers(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  return prisma.follow.findMany({
    where: {
      followingId: userId,
    },

    skip,

    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    select: {
      follower: {
        select: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
    },
  });
}

async getFollowing(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  return prisma.follow.findMany({
    where: {
      followerId: userId,
    },

    skip,

    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    select: {
      following: {
        select: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
    },
  });
}

async getFollowStats(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.follow.count({
      where: {
        followingId: userId,
      },
    }),

    prisma.follow.count({
      where: {
        followerId: userId,
      },
    }),
  ]);

  return {
    followers,
    following,
  };
}

}