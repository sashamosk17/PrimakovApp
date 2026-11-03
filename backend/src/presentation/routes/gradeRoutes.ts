import { Router, Response, NextFunction } from "express";
import { GradeController } from "../controllers/GradeController";
import { IGradeRepository } from "../../domain/repositories/IGradeRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";

export function gradeRoutes(
  gradeRepository: IGradeRepository,
  userRepository: IUserRepository
): Router {
  const router = Router();
  const controller = new GradeController(gradeRepository, userRepository);

  // Require authentication for all grade routes
  router.use(authMiddleware);

  // GET /api/grades/my
  router.get("/my", controller.getMyGrades);

  // POST /api/grades/admin/import (Admin only)
  router.post(
    "/admin/import",
    (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
        return next(new AuthorizationError("Admin access required"));
      }
      next();
    },
    controller.importMeshGrades
  );

  return router;
}

