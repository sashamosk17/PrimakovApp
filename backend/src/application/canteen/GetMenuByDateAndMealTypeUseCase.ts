import { Result } from "../../shared/Result";
import { CanteenMenu, MealType, ICanteenMenuRepository } from "../../domain/repositories/ICanteenMenuRepository";

export class GetMenuByDateAndMealTypeUseCase {
  constructor(private canteenMenuRepository: ICanteenMenuRepository) {}

  async execute(date: Date, mealType: MealType): Promise<Result<CanteenMenu | null>> {
    return await this.canteenMenuRepository.getByDateAndMealType(date, mealType);
  }
}
