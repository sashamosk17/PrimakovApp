import { Router, Response, NextFunction } from "express";
import { BoardingController } from "../controllers/BoardingController";
import { IBoardingRepository } from "../../domain/repositories/IBoardingRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";

export function boardingRoutes(boardingRepository: IBoardingRepository): Router {
  const router = Router();
  const controller = new BoardingController(boardingRepository);

  router.use(authMiddleware);

  // POST /api/boarding/check-in
  router.post("/check-in", controller.checkIn);

  // GET /api/boarding/my-status
  router.get("/my-status", controller.getMyStatus);

  // POST /api/boarding/leave-request
  router.post("/leave-request", controller.createLeaveRequest);

  // GET /api/boarding/admin/roster (Admins and teachers)
  router.get(
    "/admin/roster",
    (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      const allowedRoles = ["ADMIN", "SUPERADMIN", "TEACHER"];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(new AuthorizationError("Staff access required"));
      }
      next();
    },
    controller.getRoster
  );

  return router;
}

