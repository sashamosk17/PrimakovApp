import { Router } from "express";
import { ICanteenMenuRepository } from "../../domain/repositories/ICanteenMenuRepository";
import { CanteenController } from "../controllers/CanteenController";

export function canteenRoutes(repository: ICanteenMenuRepository): Router {
  const router = Router();
  const controller = new CanteenController(repository);

  router.get("/menu/today", controller.getTodaysMenu);
  router.get("/menu/:date", controller.getMenuByDate);
  router.get("/menu/:date/:mealType", controller.getMenuByDateAndMealType);

  return router;
}
