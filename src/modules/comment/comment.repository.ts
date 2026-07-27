import {prisma} from "../../config/database";
import { Prisma } from "@prisma/client";
import { commentSelect } from "./comment.select";

export class CommentRepository {

  async findTweetById(id: string) {
    return prisma.tweet.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }

  async create(
    data: Prisma.CommentCreateInput
  ) {
    return prisma.comment.create({
      data,
      select: commentSelect,
    });
  }

  async getComments(
  tweetId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  return prisma.comment.findMany({
    where: {
      tweetId,
    },

    orderBy: {
      createdAt: "desc",
    },

    skip,

    take: limit,

    select: commentSelect,
  });
}

async findById(id: string) {
  return prisma.comment.findUnique({
    where: {
      id,
    },
    select: commentSelect,
  });
}

async findCommentById(id: string) {
  return prisma.comment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
    },
  });
}

async update(
  id: string,
  content: string
) {
  return prisma.comment.update({
    where: {
      id,
    },
    data: {
      content,
    },
    select: commentSelect,
  });
}

async delete(id: string) {
  return prisma.comment.delete({
    where: {
      id,
    },
  });
}
}