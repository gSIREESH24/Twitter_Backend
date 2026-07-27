import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../common/utils/async-handler";

export class AuthController {
  private readonly authService = new AuthService();

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });
}