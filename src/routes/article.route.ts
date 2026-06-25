import express from "express";
import {
  crawlArticle,
  createArticle,
  getArticles,
  getArticleById,
} from "../controllers/article.controller";
import { auth, checkRole } from "../middleware/auth.midleware";

const router = express.Router();

// Proxy crawl API
router.post("/crawl", auth, checkRole("owner"), crawlArticle);

// CRUD
router.post("/", auth, checkRole("owner"), createArticle);
router.get("/", auth, getArticles);
router.get("/:id", auth, getArticleById);

export default router;
