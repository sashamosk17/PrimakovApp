/*
 * Routes for announcement management endpoints
 */

import { Router } from "express";
import { AnnouncementController } from "../controllers/AnnouncementController";
import { GetAnnouncementsUseCase } from "../../application/announcement/GetAnnouncementsUseCase";
import { GetAnnouncementByCategoryUseCase } from "../../application/announcement/GetAnnouncementByCategoryUseCase";
import type { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";

export const announcementRoutes = (announcementRepository: IAnnouncementRepository) => {
  const router = Router();
  const getAnnouncementsUseCase = new GetAnnouncementsUseCase(announcementRepository);
  const getAnnouncementByCategoryUseCase = new GetAnnouncementByCategoryUseCase(announcementRepository);
  const controller = new AnnouncementController(getAnnouncementsUseCase, getAnnouncementByCategoryUseCase);

  router.get("/", controller.getAnnouncements);
  router.get("/category/:category", controller.getByCategory);

  return router;
};
