/*
 * Handles HTTP requests for announcement management
 */

import { Request, Response, NextFunction } from "express";
import { GetAnnouncementsUseCase } from "../../application/announcement/GetAnnouncementsUseCase";
import { GetAnnouncementByCategoryUseCase } from "../../application/announcement/GetAnnouncementByCategoryUseCase";

export class AnnouncementController {
  constructor(
    private readonly getAnnouncementsUseCase: GetAnnouncementsUseCase,
    private readonly getAnnouncementByCategoryUseCase: GetAnnouncementByCategoryUseCase
  ) {}

  public getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAnnouncementsUseCase.execute();
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      // Map to Flutter-compatible format (truncate content for list view)
      const announcements = result.value?.map(a => {
        const fullContent = a.content || a.description || '';
        return {
          id: a.id,
          title: a.title,
          content: fullContent.length > 150 ? fullContent.slice(0, 150) + '...' : fullContent,
          createdAt: a.createdAt.toISOString(),
        };
      }) || [];

      return res.json({ status: "success", data: announcements });
    } catch (error) {
      return next(error);
    }
  };

  public getByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = (req.params.category || req.query.category) as string;
      if (!category || typeof category !== "string") {
        return res.status(400).json({
          status: "error",
          error: { message: "Category parameter is required" },
        });
      }

      const result = await this.getAnnouncementByCategoryUseCase.execute(category);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      // Map to Flutter-compatible format (truncate content for list view)
      const announcements = result.value?.map(a => {
        const fullContent = a.content || a.description || '';
        return {
          id: a.id,
          title: a.title,
          content: fullContent.length > 150 ? fullContent.slice(0, 150) + '...' : fullContent,
          createdAt: a.createdAt.toISOString(),
        };
      }) || [];

      return res.json({ status: "success", data: announcements });
    } catch (error) {
      return next(error);
    }
  };
}
