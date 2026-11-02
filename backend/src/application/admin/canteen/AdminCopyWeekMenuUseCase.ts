import { randomUUID } from "crypto";
import {
  CanteenMenu,
  ICanteenMenuRepository,
  MenuItem,
} from "../../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../../shared/Result";

export interface CopyWeekMenuDTO {
  fromWeekStart: Date;
  toWeekStart: Date;
}

export interface CopyWeekResult {
  copiedMenusCount: number;
  copiedItemsCount: number;
}

export class AdminCopyWeekMenuUseCase {
  constructor(private readonly canteenRepository: ICanteenMenuRepository) {}

  async execute(dto: CopyWeekMenuDTO): Promise<Result<CopyWeekResult>> {
    try {
      let copiedMenusCount = 0;
      let copiedItemsCount = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const sourceDate = new Date(dto.fromWeekStart);
        sourceDate.setUTCDate(sourceDate.getUTCDate() + dayOffset);

        const targetDate = new Date(dto.toWeekStart);
        targetDate.setUTCDate(targetDate.getUTCDate() + dayOffset);

        const sourceMenusRes = await this.canteenRepository.getByDate(sourceDate);
        if (sourceMenusRes.isFailure || !sourceMenusRes.value) continue;

        for (const sourceMenu of sourceMenusRes.value) {
          const newMenuId = randomUUID();
          const now = new Date();

          const clonedItems: MenuItem[] = sourceMenu.items.map((item, idx) => ({
            id: randomUUID(),
            menuId: newMenuId,
            name: item.name,
            description: item.description,
            category: item.category,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            weight: item.weight,
            price: item.price,
            imageUrl: item.imageUrl,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            allergens: item.allergens ? [...item.allergens] : [],
            displayOrder: item.displayOrder ?? idx + 1,
            createdAt: now,
          }));

          const clonedMenu: CanteenMenu = {
            id: newMenuId,
            date: targetDate,
            mealType: sourceMenu.mealType,
            isActive: sourceMenu.isActive,
            items: clonedItems,
            createdAt: now,
            updatedAt: now,
          };

          const saveRes = await this.canteenRepository.save(clonedMenu);
          if (saveRes.isSuccess) {
            copiedMenusCount++;
            copiedItemsCount += clonedItems.length;
          }
        }
      }

      return Result.ok({ copiedMenusCount, copiedItemsCount });
    } catch (error) {
      return Result.fail(`Failed to copy week menu: ${error}`);
    }
  }
}

