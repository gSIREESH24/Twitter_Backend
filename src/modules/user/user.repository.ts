import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { userSelect } from "./user.select";

export class UserRepository {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: userSelect,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
}


    async findById(id: string) {
    return prisma.user.findUnique({
        where: {
        id,
        },
        select: userSelect,
    });
 }
}