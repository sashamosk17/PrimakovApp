import { randomUUID } from "crypto";
import {
  ICanteenMenuRepository,
  MenuItem,
} from "../../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../../shared/Result";

export interface AddMenuItemDTO {
  menuId: string;
  name: string;
  description?: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  weight?: number;
  price?: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: string[];
  displayOrder?: number;
}

export class AdminAddMenuItemUseCase {
  constructor(private readonly canteenRepository: ICanteenMenuRepository) {}

  async execute(dto: AddMenuItemDTO): Promise<Result<MenuItem>> {
    try {
      if (!dto.name || !dto.name.trim()) {
        return Result.fail("Dish name cannot be empty");
      }

      const menuRes = await this.canteenRepository.findById(dto.menuId);
      if (menuRes.isFailure || !menuRes.value) {
        return Result.fail("Menu not found");
      }

      const newItem: MenuItem = {
        id: randomUUID(),
        menuId: dto.menuId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        category: dto.category?.trim() || "Главные блюда",
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
        weight: dto.weight,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isVegetarian: dto.isVegetarian ?? false,
        isVegan: dto.isVegan ?? false,
        allergens: dto.allergens ?? [],
        displayOrder: dto.displayOrder ?? (menuRes.value.items.length + 1),
        createdAt: new Date(),
      };

      const addRes = await this.canteenRepository.addMenuItem(newItem);
      if (addRes.isFailure) {
        return Result.fail(addRes.error || "Failed to add menu item");
      }

      return Result.ok(newItem);
    } catch (error) {
      return Result.fail(`Failed to add menu item: ${error}`);
    }
  }
}
