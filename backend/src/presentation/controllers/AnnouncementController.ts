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

      // Map to Flutter-compatible format (keep full content so client can display and expand without truncation)
      const announcements = result.value?.map(a => {
        const fullContent = a.content || a.description || '';
        return {
          id: a.id,
          title: a.title,
          content: fullContent,
          description: a.description || fullContent,
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

      // Map to Flutter-compatible format (keep full content so client can display and expand without truncation)
      const announcements = result.value?.map(a => {
        const fullContent = a.content || a.description || '';
        return {
          id: a.id,
          title: a.title,
          content: fullContent,
          description: a.description || fullContent,
          createdAt: a.createdAt.toISOString(),
        };
      }) || [];

      return res.json({ status: "success", data: announcements });
    } catch (error) {
      return next(error);
    }
  };

  public createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, category, content, description, imageUrl, authorId } = req.body;
      if (!title || !category || !content) {
        return res.status(400).json({
          status: "error",
          error: { message: "title, category, and content are required" },
        });
      }
      const authUser = (req as any).user;
      const effectiveAuthorId = authUser?.id || authorId || "admin";
      const created = {
        id: (await import("crypto")).randomUUID(),
        title,
        category,
        content,
        description: description || content.slice(0, 150),
        imageUrl,
        authorId: effectiveAuthorId,
        date: new Date(),
        createdAt: new Date(),
      };
      return res.status(201).json({ status: "success", data: created });
    } catch (error) {
      return next(error);
    }
  };
}
