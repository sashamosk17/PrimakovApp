import { Result } from "../../shared/Result";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface MenuItem {
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
  isVegetarian: boolean;
  isVegan: boolean;
  allergens?: string[];
  displayOrder: number;
  createdAt: Date;
}

export interface CanteenMenu {
  id: string;
  date: Date;
  mealType: MealType;
  isActive: boolean;
  items: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICanteenMenuRepository {
  getByDate(date: Date): Promise<Result<CanteenMenu[]>>;
  getByDateAndMealType(date: Date, mealType: MealType): Promise<Result<CanteenMenu | null>>;
  getTodaysMenu(): Promise<Result<CanteenMenu[]>>;
  save(menu: CanteenMenu): Promise<Result<void>>;
  update(menu: CanteenMenu): Promise<Result<void>>;
  addMenuItem(item: MenuItem): Promise<Result<void>>;
  updateMenuItem(item: MenuItem): Promise<Result<void>>;
  removeMenuItem(itemId: string): Promise<Result<void>>;
}

