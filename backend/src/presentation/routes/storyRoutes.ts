/*
 * Routes for story management endpoints
 */

import { Router } from "express";
import { StoryController } from "../controllers/StoryController";
import { GetStoriesUseCase } from "../../application/story/GetStoriesUseCase";
import { MarkStoryAsViewedUseCase } from "../../application/story/MarkStoryAsViewedUseCase";
import { optionalAuthMiddleware } from "../middleware/authMiddleware";
import type { IStoryRepository } from "../../domain/repositories/IStoryRepository";

export const storyRoutes = (storyRepository: IStoryRepository) => {
  const router = Router();
  const getStoriesUseCase = new GetStoriesUseCase(storyRepository);
  const markStoryAsViewedUseCase = new MarkStoryAsViewedUseCase(storyRepository);
  const controller = new StoryController(getStoriesUseCase, markStoryAsViewedUseCase);

  router.get("/", controller.getStories);
  router.post("/:storyId/view", optionalAuthMiddleware, controller.markAsViewed);

  return router;
};
