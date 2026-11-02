import {
  ICanteenMenuRepository,
  MenuItem,
} from "../../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../../shared/Result";

export interface UpdateMenuItemDTO {
  id: string;
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

export class AdminUpdateMenuItemUseCase {
  constructor(private readonly canteenRepository: ICanteenMenuRepository) {}

  async execute(dto: UpdateMenuItemDTO): Promise<Result<MenuItem>> {
    try {
      if (!dto.name || !dto.name.trim()) {
        return Result.fail("Dish name cannot be empty");
      }

      const menuRes = await this.canteenRepository.findById(dto.menuId);
      if (menuRes.isFailure || !menuRes.value) {
        return Result.fail("Menu not found");
      }

      const existingItem = menuRes.value.items.find((i) => i.id === dto.id);
      if (!existingItem) {
        return Result.fail("Menu item not found");
      }

      const updatedItem: MenuItem = {
        ...existingItem,
        name: dto.name.trim(),
        description: dto.description !== undefined ? dto.description.trim() : existingItem.description,
        category: dto.category !== undefined ? dto.category.trim() : existingItem.category,
        calories: dto.calories !== undefined ? dto.calories : existingItem.calories,
        protein: dto.protein !== undefined ? dto.protein : existingItem.protein,
        carbs: dto.carbs !== undefined ? dto.carbs : existingItem.carbs,
        fat: dto.fat !== undefined ? dto.fat : existingItem.fat,
        weight: dto.weight !== undefined ? dto.weight : existingItem.weight,
        price: dto.price !== undefined ? dto.price : existingItem.price,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : existingItem.imageUrl,
        isVegetarian: dto.isVegetarian !== undefined ? dto.isVegetarian : existingItem.isVegetarian,
        isVegan: dto.isVegan !== undefined ? dto.isVegan : existingItem.isVegan,
        allergens: dto.allergens !== undefined ? dto.allergens : existingItem.allergens,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : existingItem.displayOrder,
      };

      const updateRes = await this.canteenRepository.updateMenuItem(updatedItem);
      if (updateRes.isFailure) {
        return Result.fail(updateRes.error || "Failed to update menu item");
      }

      return Result.ok(updatedItem);
    } catch (error) {
      return Result.fail(`Failed to update menu item: ${error}`);
    }
  }
}
