import { Router } from "express";
import { DeadlineController } from "../controllers/DeadlineController";
import { CreateDeadlineUseCase } from "../../application/deadline/CreateDeadlineUseCase";
import { GetUserDeadlinesUseCase } from "../../application/deadline/GetUserDeadlinesUseCase";
import { CompleteDeadlineUseCase } from "../../application/deadline/CompleteDeadlineUseCase";
import { ProcessDeadlineNotificationsUseCase } from "../../application/deadline/ProcessDeadlineNotificationsUseCase";
import { DeadlineService } from "../../domain/services/DeadlineService";
import type { IDeadlineRepository } from "../../domain/repositories/IDeadlineRepository";
import { writeRateLimiter } from "../../infrastructure/config/rateLimiter";
import { validate } from "../middleware/validationMiddleware";
import { createDeadlineSchema } from "../../domain/validation/deadlineSchemas";
import { optionalAuthMiddleware } from "../middleware/authMiddleware";

export const deadlineRoutes = (
  repository: IDeadlineRepository,
  processDeadlineNotificationsUseCase?: ProcessDeadlineNotificationsUseCase
) => {
  const router = Router();
  const service = new DeadlineService(repository);
  const controller = new DeadlineController(
    new CreateDeadlineUseCase(service),
    new GetUserDeadlinesUseCase(service),
    new CompleteDeadlineUseCase(service),
    repository,
    processDeadlineNotificationsUseCase
  );

  router.get("/", optionalAuthMiddleware, controller.getDeadlines);
  router.post("/", optionalAuthMiddleware, writeRateLimiter, validate(createDeadlineSchema), controller.createDeadline);
  router.post("/check-alerts", optionalAuthMiddleware, controller.checkAlerts);
  router.patch("/:deadlineId/complete", optionalAuthMiddleware, writeRateLimiter, controller.completeDeadline);

  return router;
};
