import { Router } from "express";
import { IRoomRepository } from "../../domain/repositories/IRoomRepository";
import { RoomController } from "../controllers/RoomController";

export function roomRoutes(repository: IRoomRepository): Router {
  const router = Router();
  const controller = new RoomController(repository);

  router.get("/", controller.getAll);
  router.get("/:number", controller.getByNumber);
  router.get("/building/:building", controller.getByBuilding);
  router.get("/building/:building/floor/:floor", controller.getByFloor);

  return router;
}
