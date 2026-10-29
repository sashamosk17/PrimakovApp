import { Router } from "express";
import { ScheduleController } from "../controllers/ScheduleController";
import { GetScheduleUseCase } from "../../application/schedule/GetScheduleUseCase";
import { GetScheduleByDateUseCase } from "../../application/schedule/GetScheduleByDateUseCase";
import { GetScheduleByUserIdUseCase } from "../../application/schedule/GetScheduleByUserIdUseCase";
import { ScheduleService } from "../../domain/services/ScheduleService";
import type { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";

export const scheduleRoutes = (repository: IScheduleRepository, userRepository: IUserRepository) => {
  const router = Router();
  const service = new ScheduleService(repository);
  const controller = new ScheduleController(
    new GetScheduleUseCase(service),
    new GetScheduleByDateUseCase(service),
    new GetScheduleByUserIdUseCase(service),
    userRepository
  );

  router.get("/user/:userId/:date", controller.getScheduleByUserId);
  router.get("/:groupId", controller.getSchedule);
  router.get("/:groupId/:date", controller.getScheduleByDate);

  return router;
};
