import {
  CanteenMenu,
  ICanteenMenuRepository,
  MealType,
  MenuItem,
} from "../../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../../shared/Result";

function toDateString(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export class MockCanteenMenuRepository implements ICanteenMenuRepository {
  private menus: CanteenMenu[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const today = new Date();

    const itemsBreakfast: MenuItem[] = [
      {
        id: "item-1",
        menuId: "menu-today-breakfast",
        name: "Овсяная каша с ягодами",
        description: "Овсянка на молоке со свежими ягодами",
        category: "Каши",
        calories: 250,
        protein: 8,
        carbs: 45,
        fat: 5,
        weight: 200,
        price: 120,
        isVegetarian: true,
        isVegan: false,
        displayOrder: 1,
        createdAt: today,
      },
      {
        id: "item-2",
        menuId: "menu-today-breakfast",
        name: "Омлет с сыром",
        description: "Пышный омлет с сыром моцарелла",
        category: "Горячее",
        calories: 320,
        protein: 18,
        carbs: 4,
        fat: 22,
        weight: 150,
        price: 180,
        isVegetarian: true,
        isVegan: false,
        displayOrder: 2,
        createdAt: today,
      },
    ];

    const itemsLunch: MenuItem[] = [
      {
        id: "item-3",
        menuId: "menu-today-lunch",
        name: "Борщ сибирский со сметаной",
        description: "Традиционный борщ с говядиной",
        category: "Первые блюда",
        calories: 280,
        protein: 14,
        carbs: 22,
        fat: 12,
        weight: 250,
        price: 200,
        isVegetarian: false,
        isVegan: false,
        displayOrder: 1,
        createdAt: today,
      },
      {
        id: "item-4",
        menuId: "menu-today-lunch",
        name: "Котлета куриная на пару с пюре",
        description: "Нежная куриная котлета с картофельным пюре",
        category: "Вторые блюда",
        calories: 420,
        protein: 28,
        carbs: 35,
        fat: 16,
        weight: 300,
        price: 280,
        isVegetarian: false,
        isVegan: false,
        displayOrder: 2,
        createdAt: today,
      },
    ];

    this.menus = [
      {
        id: "menu-today-breakfast",
        date: today,
        mealType: "BREAKFAST",
        isActive: true,
        items: itemsBreakfast,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: "menu-today-lunch",
        date: today,
        mealType: "LUNCH",
        isActive: true,
        items: itemsLunch,
        createdAt: today,
        updatedAt: today,
      },
    ];
  }

  async getByDate(date: Date): Promise<Result<CanteenMenu[]>> {
    const targetDateStr = toDateString(date);
    const filtered = this.menus.filter((m) => {
      const menuDateStr = toDateString(m.date);
      return menuDateStr === targetDateStr && m.isActive;
    });
    return Result.ok(filtered);
  }

  async getByDateAndMealType(date: Date, mealType: MealType): Promise<Result<CanteenMenu | null>> {
    const targetDateStr = toDateString(date);
    const menu = this.menus.find((m) => {
      const menuDateStr = toDateString(m.date);
      return (
        menuDateStr === targetDateStr &&
        m.mealType.toUpperCase() === mealType.toUpperCase() &&
        m.isActive
      );
    });
    return Result.ok(menu || null);
  }

  async getTodaysMenu(): Promise<Result<CanteenMenu[]>> {
    const today = new Date();
    return this.getByDate(today);
  }

  async save(menu: CanteenMenu): Promise<Result<void>> {
    this.menus.push(menu);
    return Result.ok();
  }

  async update(menu: CanteenMenu): Promise<Result<void>> {
    const index = this.menus.findIndex((m) => m.id === menu.id);
    if (index >= 0) {
      this.menus[index] = menu;
    }
    return Result.ok();
  }

  async addMenuItem(item: MenuItem): Promise<Result<void>> {
    const menu = this.menus.find((m) => m.id === item.menuId);
    if (menu) {
      menu.items.push(item);
    }
    return Result.ok();
  }

  async updateMenuItem(item: MenuItem): Promise<Result<void>> {
    for (const menu of this.menus) {
      const idx = menu.items.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        menu.items[idx] = item;
        break;
      }
    }
    return Result.ok();
  }

  async removeMenuItem(itemId: string): Promise<Result<void>> {
    for (const menu of this.menus) {
      menu.items = menu.items.filter((i) => i.id !== itemId);
    }
    return Result.ok();
  }
}
