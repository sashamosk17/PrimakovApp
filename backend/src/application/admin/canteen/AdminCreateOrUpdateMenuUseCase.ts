import { randomUUID } from "crypto";
import {
  CanteenMenu,
  ICanteenMenuRepository,
  MealType,
} from "../../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../../shared/Result";

export interface CreateOrUpdateMenuDTO {
  id?: string;
  date: Date;
  mealType: MealType;
  isActive?: boolean;
}

export class AdminCreateOrUpdateMenuUseCase {
  constructor(private readonly canteenRepository: ICanteenMenuRepository) {}

  async execute(dto: CreateOrUpdateMenuDTO): Promise<Result<CanteenMenu>> {
    try {
      // 1. If id provided, check if exists
      if (dto.id) {
        const existing = await this.canteenRepository.findById(dto.id);
        if (existing.isSuccess && existing.value) {
          const updated: CanteenMenu = {
            ...existing.value,
            date: dto.date,
            mealType: dto.mealType,
            isActive: dto.isActive !== undefined ? dto.isActive : existing.value.isActive,
            updatedAt: new Date(),
          };
          const updateRes = await this.canteenRepository.update(updated);
          if (updateRes.isFailure) {
            return Result.fail(updateRes.error || "Failed to update menu");
          }
          return Result.ok(updated);
        }
      }

      // 2. Check if a menu already exists for this date and mealType
      const existingByDate = await this.canteenRepository.getByDateAndMealType(
        dto.date,
        dto.mealType
      );

      if (existingByDate.isSuccess && existingByDate.value) {
        const updated: CanteenMenu = {
          ...existingByDate.value,
          isActive: dto.isActive !== undefined ? dto.isActive : existingByDate.value.isActive,
          updatedAt: new Date(),
        };
        const updateRes = await this.canteenRepository.update(updated);
        if (updateRes.isFailure) {
          return Result.fail(updateRes.error || "Failed to update menu");
        }
        return Result.ok(updated);
      }

      // 3. Create new menu
      const now = new Date();
      const newMenu: CanteenMenu = {
        id: dto.id || randomUUID(),
        date: dto.date,
        mealType: dto.mealType,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        items: [],
        createdAt: now,
        updatedAt: now,
      };

      const saveRes = await this.canteenRepository.save(newMenu);
      if (saveRes.isFailure) {
        return Result.fail(saveRes.error || "Failed to save menu");
      }

      return Result.ok(newMenu);
    } catch (error) {
      return Result.fail(`Failed to create or update menu: ${error}`);
    }
  }
}
