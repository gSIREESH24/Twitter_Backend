import { Request, Response } from "express";
import { UserService } from "./user.service";
import { asyncHandler } from "../../common/utils/async-handler";

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getCurrentUser(
        req.user!.userId
    );

    res.status(200).json({
        success: true,
        data: user,
    });
});
}