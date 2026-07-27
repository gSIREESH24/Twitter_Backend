import { Router } from "express";
import { SearchController } from "./search.controller";
import { authenticate } from "../../common/middleware/auth.middleware";

const router = Router();

const searchController =
  new SearchController();

router.get(
  "/users",
  searchController.searchUsers
);

router.get(
  "/tweets",
  authenticate,
  searchController.searchTweets
);

export default router;