/**
 * StoryController
 * Handles HTTP requests for story management
 */

import { Request, Response, NextFunction } from "express";
import { GetStoriesUseCase } from "../../application/story/GetStoriesUseCase";
import { MarkStoryAsViewedUseCase } from "../../application/story/MarkStoryAsViewedUseCase";

export class StoryController {
  constructor(
    private readonly getStoriesUseCase: GetStoriesUseCase,
    private readonly markStoryAsViewedUseCase: MarkStoryAsViewedUseCase
  ) {}

  public getStories = async (req: Request, res: Response, next: NextFunction) => {
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
}
