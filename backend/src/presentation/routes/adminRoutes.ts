import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AdminController } from "../controllers/AdminController";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRequestRepository } from "../../domain/repositories/IRequestRepository";
import { IRatingRepository } from "../../domain/repositories/IRatingRepository";
import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";

export interface AdminRoutesDependencies {
  userRepository: IUserRepository;
  requestRepository: IRequestRepository;
  ratingRepository: IRatingRepository;
  announcementRepository?: IAnnouncementRepository;
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]),
  isActive: z.boolean().optional(),
});

export function adminRoutes(deps: AdminRoutesDependencies): Router {
  const router = Router();
  const controller = new AdminController(
    deps.userRepository,
    deps.requestRepository,
    deps.ratingRepository,
    deps.announcementRepository
  );

  // 1. Must be authenticated
  router.use(authMiddleware);

  // 2. Must have ADMIN or SUPERADMIN role
  router.use((req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
      return next(new AuthorizationError("Admin access required"));
    }
    next();
  });

  // Dashboard Overview
  router.get("/dashboard", controller.getDashboard);

  // Users Management
  router.get("/users", controller.getUsers);
  router.post("/users", validate(CreateUserSchema), controller.createUser);
  router.patch("/users/:id/status", controller.updateUserStatus);
  router.delete("/users/:id", controller.deleteUser);
  router.post("/users/import", controller.importUsers);

  // Service Requests
  router.get("/requests", controller.getRequests);
  router.patch("/requests/:id", controller.updateRequest);

  // Ratings Moderation
  router.get("/ratings", controller.getRatings);

  return router;
}
