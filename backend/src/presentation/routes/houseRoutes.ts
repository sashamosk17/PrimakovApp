import { Router, Response, NextFunction } from "express";
import { HouseController } from "../controllers/HouseController";
import { IHouseRepository } from "../../domain/repositories/IHouseRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";

export function houseRoutes(houseRepository: IHouseRepository): Router {
  const router = Router();
  const controller = new HouseController(houseRepository);

  router.use(authMiddleware);

  // GET /api/houses/standings
  router.get("/standings", controller.getStandings);

  // POST /api/houses/award (Teachers and Admins only)
  router.post(
    "/award",
    (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      const allowedRoles = ["TEACHER", "ADMIN", "SUPERADMIN"];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(new AuthorizationError("Only teachers and administrators can award house points"));
      }
      next();
    },
    controller.awardPoints
  );

  return router;
}

