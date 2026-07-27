import { Router } from "express";
import mediaController from "./media.controller";
import { upload } from "../../common/middleware/upload.middleware";
import { authenticate } from "../../common/middleware/auth.middleware";

const router = Router();

router.post(
    "/tweet/:id/upload",
    authenticate,
    upload.single("image"),
    mediaController.upload
);

export default router;