import {prisma} from "../../config/database";
import {
  userSearchSelect,
  tweetSearchSelect,
} from "./search.select";

export class SearchRepository {

  async searchUsers(query: string) {
    return prisma.user.findMany({

      where: {

        OR: [

          {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },

          {
            bio: {
              contains: query,
              mode: "insensitive",
            },
          },

        ],

      },

      take: 20,

      select: userSearchSelect,

    });
  }

async searchTweets(
  query: string,
  currentUserId: string,
  cursor: string | undefined,
  limit: number
) {
  return prisma.tweet.findMany({
    where: {
      content: {
        contains: query,
        mode: "insensitive",
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    cursor: cursor
      ? {
          id: cursor,
        }
      : undefined,

    skip: cursor ? 1 : 0,

    take: limit,

    select: {
      ...tweetSearchSelect,

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