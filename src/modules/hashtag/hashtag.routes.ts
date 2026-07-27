import { Router } from "express";
import { HashtagController } from "./hashtag.controller";

const router = Router();

const hashtagController = new HashtagController();

router.get("/trending", hashtagController.getTrendingHashtags);
router.get("/", hashtagController.getAllHashtags);
router.get("/:name", hashtagController.getTweetsByHashtag);

export default router;
