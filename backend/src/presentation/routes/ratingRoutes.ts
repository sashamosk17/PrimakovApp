import { Router } from "express";
import { RatingController } from "../controllers/RatingController";
import { RateTeacherUseCase } from "../../application/rating/RateTeacherUseCase";
import { GetTeacherRatingsUseCase } from "../../application/rating/GetTeacherRatingsUseCase";
import { RatingService } from "../../domain/services/RatingService";
import { MockRatingRepository } from "../../infrastructure/database/memory/MockRatingRepository";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware";
import type { IRatingRepository } from "../../domain/repositories/IRatingRepository";

export const ratingRoutes = (repository?: IRatingRepository) => {
  const router = Router();
  const service = new RatingService(repository || new MockRatingRepository());
  const controller = new RatingController(
    new RateTeacherUseCase(service),
    new GetTeacherRatingsUseCase(service)
  );

  router.get("/", optionalAuthMiddleware, controller.getRatings);
  router.post("/", authMiddleware, controller.rateTeacher);

  return router;
};
