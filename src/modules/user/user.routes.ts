import { Router } from "express";
import { UserController } from "./user.controller";

import { validate } from "../../common/middleware/validation.middleware";
import { registerUserSchema } from "./user.validation";
import { authenticate } from "../../common/middleware/auth.middleware";

import { rateLimiter } from "../../common/middleware/rate-limit.middleware";

const router = Router();

const userController = new UserController();

router.post(
  "/register",
  rateLimiter("signup", 3, 3 / 60),
  validate(registerUserSchema),
  userController.register.bind(userController)
);

router.get(
    "/me",
    authenticate,
    userController.me
);

export default router;