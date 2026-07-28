import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../common/middleware/validation.middleware";
import { loginSchema } from "./auth.validation";

import { rateLimiter } from "../../common/middleware/rate-limit.middleware";

const router = Router();

const authController = new AuthController();

router.post(
  "/login",
  rateLimiter("login", 5, 5 / 60),
  validate(loginSchema),
  authController.login
);

export default router;