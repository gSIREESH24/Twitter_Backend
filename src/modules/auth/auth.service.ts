import bcrypt from "bcrypt";
import { AppError } from "../../common/errors/app-error";
import { generateAccessToken } from "../../config/jwt";
import { UserRepository } from "../user/user.repository";
import { LoginDto } from "./auth.validation";

export class AuthService {
  private readonly userRepository = new UserRepository();

  async login(data: LoginDto) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const passwordMatched = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!passwordMatched) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = generateAccessToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
      },
    };
  }
}