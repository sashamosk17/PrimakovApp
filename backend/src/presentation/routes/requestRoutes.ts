import { Router } from "express";
import { IRequestRepository } from "../../domain/repositories/IRequestRepository";
import { RequestController } from "../controllers/RequestController";
import { authMiddleware } from "../middleware/authMiddleware";

export function requestRoutes(repository: IRequestRepository): Router {
  const router = Router();
  const controller = new RequestController(repository);

  router.use(authMiddleware);

  router.post("/", controller.create);
  router.get("/", controller.getUserRequests);
  router.get("/assigned", controller.getAssignedRequests);
  router.patch("/:id/status", controller.updateStatus);
  router.get("/active", controller.getActive);
  router.get("/type/:type", controller.getByType);

  return router;
}
