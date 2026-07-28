import { Router } from "express";
import { SearchController } from "./search.controller";
import { authenticate } from "../../common/middleware/auth.middleware";

import { rateLimiter } from "../../common/middleware/rate-limit.middleware";

const router = Router();

const searchController =
  new SearchController();

router.get(
  "/users",
  rateLimiter("search", 100, 100 / 60),
  searchController.searchUsers
);

router.get(
  "/tweets",
  authenticate,
  rateLimiter("search", 100, 100 / 60),
  searchController.searchTweets
);

export default router;