/**
 * StoryController
 * Handles HTTP requests for story management
 */

import { Request, Response, NextFunction } from "express";
import { GetStoriesUseCase } from "../../application/story/GetStoriesUseCase";
import { MarkStoryAsViewedUseCase } from "../../application/story/MarkStoryAsViewedUseCase";
import { CreateStoryUseCase } from "../../application/story/CreateStoryUseCase";
import { UpdateStoryUseCase } from "../../application/story/UpdateStoryUseCase";
import { DeleteStoryUseCase } from "../../application/story/DeleteStoryUseCase";

export class StoryController {
  constructor(
    private readonly getStoriesUseCase: GetStoriesUseCase,
    private readonly markStoryAsViewedUseCase: MarkStoryAsViewedUseCase,
    private readonly createStoryUseCase: CreateStoryUseCase,
    private readonly updateStoryUseCase: UpdateStoryUseCase,
    private readonly deleteStoryUseCase: DeleteStoryUseCase
  ) {}

  public getStories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getStoriesUseCase.execute();
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };

  public markAsViewed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storyId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).userId || req.body?.userId || "user-1";
      const result = await this.markStoryAsViewedUseCase.execute(storyId, userId);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.json({ status: "success", data: {} });
    } catch (error) {
      return next(error);
    }
  };

  public createStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, imageUrl, videoUrl, linkUrl, linkText, expiresInDays } = req.body;
      const author = (req as any).user?.userId || (req as any).user?.id || "admin";
      const result = await this.createStoryUseCase.execute({
        title,
        description,
        imageUrl,
        videoUrl,
        linkUrl,
        linkText,
        expiresInDays,
        author,
      });

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(201).json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };

  public updateStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storyId } = req.params;
      const { title, description, imageUrl, videoUrl, linkUrl, linkText, expiresInDays } = req.body;
      const result = await this.updateStoryUseCase.execute({
        id: storyId,
        title,
        description,
        imageUrl,
        videoUrl,
        linkUrl,
        linkText,
        expiresInDays,
      });

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };

  public deleteStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storyId } = req.params;
      const result = await this.deleteStoryUseCase.execute(storyId);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.json({ status: "success", data: {} });
    } catch (error) {
      return next(error);
    }
  };
}
