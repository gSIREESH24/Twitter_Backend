import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../common/middleware/validation.middleware";
import { loginSchema } from "./auth.validation";

const router = Router();

const authController = new AuthController();

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

export default router;