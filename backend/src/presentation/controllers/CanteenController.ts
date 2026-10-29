import { Request, Response } from "express";
import { ICanteenMenuRepository, MealType } from "../../domain/repositories/ICanteenMenuRepository";
import { GetTodaysMenuUseCase } from "../../application/canteen/GetTodaysMenuUseCase";
import { GetMenuByDateUseCase } from "../../application/canteen/GetMenuByDateUseCase";
import { GetMenuByDateAndMealTypeUseCase } from "../../application/canteen/GetMenuByDateAndMealTypeUseCase";

export class CanteenController {
  constructor(private repository: ICanteenMenuRepository) {}

  getTodaysMenu = async (req: Request, res: Response) => {
    const useCase = new GetTodaysMenuUseCase(this.repository);
    const result = await useCase.execute();

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getMenuByDate = async (req: Request, res: Response) => {
    const { date } = req.params;
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: "error",
        error: { message: "Invalid date format" },
      });
    }

    const useCase = new GetMenuByDateUseCase(this.repository);
    const result = await useCase.execute(parsedDate);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getMenuByDateAndMealType = async (req: Request, res: Response) => {
    const { date, mealType } = req.params;
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: "error",
        error: { message: "Invalid date format" },
      });
    }

    const mealTypeUpper = mealType.toUpperCase() as MealType;
    if (!["BREAKFAST", "LUNCH", "DINNER", "SNACK"].includes(mealTypeUpper)) {
      return res.status(400).json({
        status: "error",
        error: { message: "Invalid meal type" },
      });
    }

    const useCase = new GetMenuByDateAndMealTypeUseCase(this.repository);
    const result = await useCase.execute(parsedDate, mealTypeUpper);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    if (!result.value) {
      return res.status(404).json({
        status: "error",
        error: { message: "Menu not found" },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };
}
