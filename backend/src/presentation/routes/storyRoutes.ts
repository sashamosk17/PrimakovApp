/*
 * Routes for story management endpoints
 */

import { Router, Response, NextFunction } from "express";
import { StoryController } from "../controllers/StoryController";
import { GetStoriesUseCase } from "../../application/story/GetStoriesUseCase";
import { MarkStoryAsViewedUseCase } from "../../application/story/MarkStoryAsViewedUseCase";
import { CreateStoryUseCase } from "../../application/story/CreateStoryUseCase";
import { UpdateStoryUseCase } from "../../application/story/UpdateStoryUseCase";
import { DeleteStoryUseCase } from "../../application/story/DeleteStoryUseCase";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";
import type { IStoryRepository } from "../../domain/repositories/IStoryRepository";

export const storyRoutes = (storyRepository: IStoryRepository) => {
  const router = Router();
  const getStoriesUseCase = new GetStoriesUseCase(storyRepository);
  const markStoryAsViewedUseCase = new MarkStoryAsViewedUseCase(storyRepository);
  const createStoryUseCase = new CreateStoryUseCase(storyRepository);
  const updateStoryUseCase = new UpdateStoryUseCase(storyRepository);
  const deleteStoryUseCase = new DeleteStoryUseCase(storyRepository);

  const controller = new StoryController(
    getStoriesUseCase,
    markStoryAsViewedUseCase,
    createStoryUseCase,
    updateStoryUseCase,
    deleteStoryUseCase
  );

  const staffOnly = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const allowed = ["ADMIN", "SUPERADMIN", "TEACHER"];
    if (!req.user || !allowed.includes(req.user.role)) {
      return next(new AuthorizationError("Staff access required"));
    }
    next();
  };

  // Public/Student routes
  router.get("/", controller.getStories);
  router.post("/:storyId/view", optionalAuthMiddleware, controller.markAsViewed);

  // Admin/Teacher management routes
  router.post("/", authMiddleware, staffOnly, controller.createStory);
  router.put("/:storyId", authMiddleware, staffOnly, controller.updateStory);
  router.delete("/:storyId", authMiddleware, staffOnly, controller.deleteStory);

  return router;
};
