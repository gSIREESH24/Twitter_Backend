import { Router } from "express";
import { UserController } from "./user.controller";

import { validate } from "../../common/middleware/validation.middleware";
import { registerUserSchema } from "./user.validation";
import { authenticate } from "../../common/middleware/auth.middleware";

const router = Router();

const userController = new UserController();

router.post(
  "/register",
  validate(registerUserSchema),
  userController.register.bind(userController)
);

router.get(
    "/me",
    authenticate,
    userController.me
);

export default router;