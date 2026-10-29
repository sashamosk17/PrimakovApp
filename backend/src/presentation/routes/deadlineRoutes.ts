import { Router } from "express";
import { DeadlineController } from "../controllers/DeadlineController";
import { CreateDeadlineUseCase } from "../../application/deadline/CreateDeadlineUseCase";
import { GetUserDeadlinesUseCase } from "../../application/deadline/GetUserDeadlinesUseCase";
import { CompleteDeadlineUseCase } from "../../application/deadline/CompleteDeadlineUseCase";
import { DeadlineService } from "../../domain/services/DeadlineService";
import type { IDeadlineRepository } from "../../domain/repositories/IDeadlineRepository";
import { writeRateLimiter } from "../../infrastructure/config/rateLimiter";
import { validate } from "../middleware/validationMiddleware";
import { createDeadlineSchema } from "../../domain/validation/deadlineSchemas";
import { optionalAuthMiddleware } from "../middleware/authMiddleware";

export const deadlineRoutes = (repository: IDeadlineRepository) => {
  const router = Router();
  const service = new DeadlineService(repository);
  const controller = new DeadlineController(
    new CreateDeadlineUseCase(service),
    new GetUserDeadlinesUseCase(service),
    new CompleteDeadlineUseCase(service),
    repository
  );

  router.get("/", optionalAuthMiddleware, controller.getDeadlines);
  router.post("/", optionalAuthMiddleware, writeRateLimiter, validate(createDeadlineSchema), controller.createDeadline);
  router.patch("/:deadlineId/complete", optionalAuthMiddleware, writeRateLimiter, controller.completeDeadline);

  return router;
};
