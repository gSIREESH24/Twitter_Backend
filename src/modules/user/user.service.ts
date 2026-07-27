import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { UserRepository } from "./user.repository";
import { AppError } from "../../common/errors/app-error";

export class UserService {
  constructor(
    private readonly userRepository = new UserRepository()
  ) {}

  async register(data: Prisma.UserCreateInput) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    return user;
    }
}