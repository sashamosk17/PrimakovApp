import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { EmptyState } from "../components/EmptyState";
import type { CanteenMenu, CanteenMenuItem, MealType } from "../types";

const ALLERGEN_OPTIONS = [
  "глютен",
  "молоко",
  "яйца",
  "орехи",
  "рыба",
  "соя",
  "морепродукты",
  "сельдерей",
];

const CATEGORY_OPTIONS = [
  "Каши и завтраки",
  "Супы",
  "Горячие блюда",
  "Гарниры",
  "Салаты",
  "Напитки",
  "Выпечка и десерты",
  "Закуски",
];

interface CanteenViewProps {
  isDemoMode?: boolean;
}

export const CanteenView: React.FC<CanteenViewProps> = ({ isDemoMode }) => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const localizedMealLabels: Record<MealType, { label: string; icon: string; time: string }> = {
    BREAKFAST: { label: t("canteen.breakfast"), icon: "bakery_dining", time: "08:15 — 09:30" },
    LUNCH: { label: t("canteen.lunch"), icon: "lunch_dining", time: "12:30 — 14:00" },
    SNACK: { label: t("canteen.snack"), icon: "cookie", time: "15:45 — 16:30" },
    DINNER: { label: t("canteen.dinner"), icon: "dinner_dining", time: "18:00 — 19:30" },
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [activeMealType, setActiveMealType] = useState<MealType | "ALL">("ALL");
  const [menus, setMenus] = useState<CanteenMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dish Modal state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CanteenMenuItem | null>(null);
  const [targetMenuId, setTargetMenuId] = useState<string>("");
  const [dishMealType, setDishMealType] = useState<MealType>("LUNCH");

  // Form fields
  const [dishName, setDishName] = useState("");
  const [dishCategory, setDishCategory] = useState("Горячие блюда");
  const [dishDesc, setDishDesc] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");
  const [carbs, setCarbs] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">(200);
  const [price, setPrice] = useState<number | "">(150);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Inline validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy Week Modal
  const [isCopyWeekModalOpen, setIsCopyWeekModalOpen] = useState(false);
  const [fromWeekStart, setFromWeekStart] = useState("");
  const [toWeekStart, setToWeekStart] = useState("");
  const [isCopying, setIsCopying] = useState(false);

  const fetchMenu = useCallback(
    async (date: string) => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
          // Mock data in demo mode
          const mockItems: CanteenMenuItem[] = [
            {
              id: "item-m-1",
              menuId: "menu-m-breakfast",
              name: "Овсяная каша с лесными ягодами",
              description: "Томленая овсянка на фермерском молоке с клубникой и черникой",
              category: "Каши и завтраки",
              calories: 260,
              protein: 8.5,
              fat: 5.2,
              carbs: 44.0,
              weight: 250,
              price: 130,
              isVegetarian: true,
              isVegan: false,
              allergens: ["молоко", "глютен"],
              displayOrder: 1,
            },
            {
              id: "item-m-2",
              menuId: "menu-m-breakfast",
              name: "Омлет с сыром моцарелла",
              description: "Пышный запеченный омлет со свежей моцареллой",
              category: "Горячие блюда",
              calories: 310,
              protein: 19.0,
              fat: 22.0,
              carbs: 4.0,
              weight: 180,
              price: 160,
              isVegetarian: true,
              isVegan: false,
              allergens: ["яйца", "молоко"],
              displayOrder: 2,
            },
            {
              id: "item-m-3",
              menuId: "menu-m-lunch",
              name: "Борщ сибирский со сметаной",
              description: "Насыщенный борщ из фермерской говядины",
              category: "Супы",
              calories: 220,
              protein: 12.0,
              fat: 9.5,
              carbs: 18.0,
              weight: 300,
              price: 180,
              isVegetarian: false,
              isVegan: false,
              allergens: ["молоко"],
              displayOrder: 1,
            },
            {
              id: "item-m-4",
              menuId: "menu-m-lunch",
              name: "Куриное филе су-вид с диким рисом",
              description: "Нежное филе с миксом дикого и бурого риса",
              category: "Горячие блюда",
              calories: 380,
              protein: 36.0,
              fat: 8.0,
              carbs: 38.0,
              weight: 280,
              price: 290,
              isVegetarian: false,
              isVegan: false,
              allergens: [],
              displayOrder: 2,
            },
          ];

          setMenus([
            {
              id: "menu-m-breakfast",
              date,
              mealType: "BREAKFAST",
              isActive: true,
              items: mockItems.filter((i) => i.menuId === "menu-m-breakfast"),
            },
            {
              id: "menu-m-lunch",
              date,
              mealType: "LUNCH",
              isActive: true,
              items: mockItems.filter((i) => i.menuId === "menu-m-lunch"),
            },
          ]);
          setIsLoading(false);
          return;
        }

        const res = await apiClient.get(`/canteen/menu/${date}`);
        if (res.data?.status === "success") {
          setMenus(res.data.data || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch canteen menu:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isDemoMode]
  );

  useEffect(() => {
    fetchMenu(selectedDate);
  }, [fetchMenu, selectedDate]);

  const handleOpenAddDish = (mealType: MealType = "LUNCH", menuId?: string) => {
    setEditingItem(null);
    setTargetMenuId(menuId || "");
    setDishMealType(mealType);
    setDishName("");
    setDishCategory("Горячие блюда");
    setDishDesc("");
    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");
    setWeight(200);
    setPrice(150);
    setIsVegetarian(false);
    setIsVegan(false);
    setSelectedAllergens([]);
    setFormErrors({});
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (item: CanteenMenuItem, mealType: MealType) => {
    setEditingItem(item);
    setTargetMenuId(item.menuId);
    setDishMealType(mealType);
    setDishName(item.name);
    setDishCategory(item.category || "Горячие блюда");
    setDishDesc(item.description || "");
    setCalories(item.calories ?? "");
    setProtein(item.protein ?? "");
    setFat(item.fat ?? "");
    setCarbs(item.carbs ?? "");
    setWeight(item.weight ?? 200);
    setPrice(item.price ?? 150);
    setIsVegetarian(item.isVegetarian);
    setIsVegan(item.isVegan);
    setSelectedAllergens(item.allergens || []);
    setFormErrors({});
    setIsDishModalOpen(true);
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const validateDishForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!dishName.trim()) {
      errors.name = "Название блюда обязательно для заполнения";
    }
    if (price !== "" && (Number(price) < 0 || isNaN(Number(price)))) {
      errors.price = "Цена не может быть отрицательной";
    }
    if (calories !== "" && (Number(calories) < 0 || isNaN(Number(calories)))) {
      errors.calories = "Калорийность должна быть положительным числом";
    }
    if (weight !== "" && (Number(weight) <= 0 || isNaN(Number(weight)))) {
      errors.weight = "Вес порции должен быть больше 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDishForm()) return;

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        // Demo mode state update
        if (editingItem) {
          setMenus((prev) =>
            prev.map((m) => ({
              ...m,
              items: m.items.map((i) =>
                i.id === editingItem.id
                  ? {
                      ...i,
                      name: dishName.trim(),
                      category: dishCategory,
                      description: dishDesc.trim(),
                      calories: calories === "" ? undefined : Number(calories),
                      protein: protein === "" ? undefined : Number(protein),
                      fat: fat === "" ? undefined : Number(fat),
                      carbs: carbs === "" ? undefined : Number(carbs),
                      weight: weight === "" ? undefined : Number(weight),
                      price: price === "" ? undefined : Number(price),
                      isVegetarian,
                      isVegan,
                      allergens: selectedAllergens,
                    }
                  : i
              ),
            }))
          );
          showToast(`Блюдо «${dishName}» успешно обновлено`, "success");
        } else {
          let currentMenu = menus.find((m) => m.mealType === dishMealType);
          const newItem: CanteenMenuItem = {
            id: `item-${Date.now()}`,
            menuId: currentMenu?.id || `menu-${dishMealType}-${selectedDate}`,
            name: dishName.trim(),
            category: dishCategory,
            description: dishDesc.trim(),
            calories: calories === "" ? undefined : Number(calories),
            protein: protein === "" ? undefined : Number(protein),
            fat: fat === "" ? undefined : Number(fat),
            carbs: carbs === "" ? undefined : Number(carbs),
            weight: weight === "" ? undefined : Number(weight),
            price: price === "" ? undefined : Number(price),
            isVegetarian,
            isVegan,
            allergens: selectedAllergens,
            displayOrder: (currentMenu?.items.length || 0) + 1,
          };

          if (currentMenu) {
            setMenus((prev) =>
              prev.map((m) =>
                m.id === currentMenu!.id ? { ...m, items: [...m.items, newItem] } : m
              )
            );
          } else {
            setMenus((prev) => [
              ...prev,
              {
                id: newItem.menuId,
                date: selectedDate,
                mealType: dishMealType,
                isActive: true,
                items: [newItem],
              },
            ]);
          }
          showToast(`Блюдо «${dishName}» добавлено в меню`, "success");
        }
        setIsDishModalOpen(false);
        setIsSubmitting(false);
        return;
      }

      // Real API mode
      let effectiveMenuId = targetMenuId;

      // Ensure menu exists for this mealType & date
      if (!effectiveMenuId) {
        const menuRes = await apiClient.post("/admin/canteen/menu", {
          date: selectedDate,
          mealType: dishMealType,
          isActive: true,
        });
        effectiveMenuId = menuRes.data.data.id;
      }

      if (editingItem) {
        await apiClient.put(`/admin/canteen/items/${editingItem.id}`, {
          menuId: effectiveMenuId,
          name: dishName.trim(),
          category: dishCategory,
          description: dishDesc.trim(),
          calories: calories === "" ? undefined : Number(calories),
          protein: protein === "" ? undefined : Number(protein),
          fat: fat === "" ? undefined : Number(fat),
          carbs: carbs === "" ? undefined : Number(carbs),
          weight: weight === "" ? undefined : Number(weight),
          price: price === "" ? undefined : Number(price),
          isVegetarian,
          isVegan,
          allergens: selectedAllergens,
        });
        showToast(`Блюдо «${dishName}» успешно обновлено`, "success");
      } else {
        await apiClient.post("/admin/canteen/items", {
          menuId: effectiveMenuId,
          name: dishName.trim(),
          category: dishCategory,
          description: dishDesc.trim(),
          calories: calories === "" ? undefined : Number(calories),
          protein: protein === "" ? undefined : Number(protein),
          fat: fat === "" ? undefined : Number(fat),
          carbs: carbs === "" ? undefined : Number(carbs),
          weight: weight === "" ? undefined : Number(weight),
          price: price === "" ? undefined : Number(price),
          isVegetarian,
          isVegan,
          allergens: selectedAllergens,
        });
        showToast(`Блюдо «${dishName}» добавлено в меню`, "success");
      }

      setIsDishModalOpen(false);
      await fetchMenu(selectedDate);
    } catch (err: any) {
      console.error("Save dish error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDish = async (itemId: string, dishTitle: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить блюдо «${dishTitle}» из меню?`)) {
      return;
    }

    try {
      if (isDemoMode) {
        setMenus((prev) =>
          prev.map((m) => ({
            ...m,
            items: m.items.filter((i) => i.id !== itemId),
          }))
        );
        showToast(`Блюдо «${dishTitle}» удалено`, "info");
        return;
      }

      await apiClient.delete(`/admin/canteen/items/${itemId}`);
      showToast(`Блюдо «${dishTitle}» удалено`, "info");
      await fetchMenu(selectedDate);
    } catch (err: any) {
      console.error("Delete dish error:", err);
    }
  };

  const handleOpenCopyWeek = () => {
    // Current date week Monday
    const curr = new Date(selectedDate);
    const day = curr.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diff);

    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    setFromWeekStart(monday.toISOString().split("T")[0]);
    setToWeekStart(nextMonday.toISOString().split("T")[0]);
    setIsCopyWeekModalOpen(true);
  };

  const handleExecuteCopyWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWeekStart || !toWeekStart) return;

    setIsCopying(true);
    try {
      if (isDemoMode) {
        showToast(
          `Рацион недели успешно скопирован с ${fromWeekStart} на ${toWeekStart} (4 меню, 12 блюд)`,
          "success"
        );
        setIsCopyWeekModalOpen(false);
        setIsCopying(false);
        return;
      }

      const res = await apiClient.post("/admin/canteen/copy-week", {
        fromWeekStart,
        toWeekStart,
      });

      const { copiedMenusCount, copiedItemsCount } = res.data.data;
      showToast(
        `Рацион успешно скопирован на следующую неделю! Скопировано меню: ${copiedMenusCount}, блюд: ${copiedItemsCount}`,
        "success"
      );
      setIsCopyWeekModalOpen(false);
      await fetchMenu(selectedDate);
    } catch (err: any) {
      console.error("Copy week error:", err);
    } finally {
      setIsCopying(false);
    }
  };

  // Filtered menus
  const filteredMenus =
    activeMealType === "ALL" ? menus : menus.filter((m) => m.mealType === activeMealType);

  // Total KBJU calculation
  const allCurrentItems = filteredMenus.flatMap((m) => m.items);
  const totalCalories = allCurrentItems.reduce((acc, i) => acc + (i.calories || 0), 0);
  const totalProtein = allCurrentItems.reduce((acc, i) => acc + (i.protein || 0), 0);
  const totalFat = allCurrentItems.reduce((acc, i) => acc + (i.fat || 0), 0);
  const totalCarbs = allCurrentItems.reduce((acc, i) => acc + (i.carbs || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm">restaurant</span>
              {language === "en" ? "Gymnasium Food Service" : "Комбинат питания гимназии"}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black font-headline tracking-tight">
              {t("canteen.title")}
            </h2>
            <p className="text-xs text-red-100 max-w-xl leading-relaxed">
              {t("canteen.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCopyWeek}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              {t("canteen.copyWeek")}
            </button>

            <button
              onClick={() => handleOpenAddDish("LUNCH")}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              {t("canteen.addDish")}
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Date Selector & KBJU Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Selector */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between gap-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
            {language === "en" ? "Select Meal Date:" : "Выбор даты рациона:"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {language === "en" ? "Today" : "Сегодня"}
            </button>
          </div>
        </div>

        {/* Nutritional Summary (КБЖУ) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-base">nutrition</span>
              {language === "en" ? `Daily Nutrition Totals (${allCurrentItems.length} items):` : `Суммарные показатели КБЖУ дня (${allCurrentItems.length} позиций):`}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">SanPiN / Healthy Standards</span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-orange-50/80 rounded-xl border border-orange-100">
              <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">{t("canteen.calories")}</p>
              <p className="text-base font-black text-orange-950 mt-0.5">{totalCalories} {language === "en" ? "kcal" : "ккал"}</p>
            </div>
            <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">{t("canteen.protein")}</p>
              <p className="text-base font-black text-blue-950 mt-0.5">
                {totalProtein.toFixed(1)} {language === "en" ? "g" : "г"}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">{t("canteen.fat")}</p>
              <p className="text-base font-black text-amber-950 mt-0.5">{totalFat.toFixed(1)} {language === "en" ? "g" : "г"}</p>
            </div>
            <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                {t("canteen.carbs")}
              </p>
              <p className="text-base font-black text-emerald-950 mt-0.5">
                {totalCarbs.toFixed(1)} {language === "en" ? "g" : "г"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Types Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveMealType("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMealType === "ALL"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t("canteen.allMeals")}
        </button>

        {(["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as MealType[]).map((type) => {
          const info = localizedMealLabels[type];
          const count = menus.find((m) => m.mealType === type)?.items.length || 0;
          const isActive = activeMealType === type;
          return (
            <button
              key={type}
              onClick={() => setActiveMealType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-red-900 text-white shadow-md shadow-red-900/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{info.icon}</span>
              <span>{info.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menus List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          <p className="text-xs font-bold mt-2">{language === "en" ? "Loading menu..." : "Загрузка меню столовой..."}</p>
        </div>
      ) : filteredMenus.length === 0 ? (
        <EmptyState
          icon="restaurant_menu"
          title={t("canteen.noMenu")}
          description={language === "en" ? "Chefs can add dishes or duplicate previous week's menu." : "Шеф-повар и комбинат питания могут добавить блюда или скопировать меню с прошлой недели."}
          actionLabel={t("canteen.addDish")}
          onAction={() => handleOpenAddDish("LUNCH")}
        />
      ) : (
        <div className="space-y-8">
          {filteredMenus.map((menu) => {
            const mealInfo = localizedMealLabels[menu.mealType];
            return (
              <div
                key={menu.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5"
              >
                {/* Meal header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-900 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">{mealInfo.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        {mealInfo.label}
                        <span className="text-[11px] font-semibold text-slate-400">
                          ({mealInfo.time})
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {language === "en" ? `Items in ration: ${menu.items.length}` : `Позиций в рационе: ${menu.items.length}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAddDish(menu.mealType, menu.id)}
                    className="self-start sm:self-center px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-900 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    {language === "en" ? `Add to ${mealInfo.label}` : `Добавить в ${mealInfo.label.toLowerCase()}`}
                  </button>
                </div>

                {/* Dishes grid */}
                {menu.items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">{language === "en" ? "No dishes added yet" : "Блюда пока не добавлены"}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {menu.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-4 border border-slate-200/70 shadow-xs flex flex-col justify-between gap-3 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {item.category || (language === "en" ? "Dish" : "Блюдо")}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800 leading-snug">
                                {item.name}
                              </h4>
                            </div>
                            <span className="text-xs font-extrabold text-red-900 bg-red-50 px-2 py-0.5 rounded-lg shrink-0">
                              {item.price ? `${item.price} ₽` : (language === "en" ? "Included" : "В рационе")}
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {/* Allergen & Dietary Badges */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.isVegetarian && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🌱 {t("canteen.vegetarian")}
                              </span>
                            )}
                            {item.isVegan && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                🌿 {t("canteen.vegan")}
                              </span>
                            )}
                            {item.allergens &&
                              item.allergens.map((alg) => (
                                <span
                                  key={alg}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                                >
                                  ⚠️ {alg}
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* KBJU footer */}
                        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {item.calories || 0} {language === "en" ? "kcal" : "ккал"}
                            </span>
                            <span>•</span>
                            <span>{item.weight || 200} {language === "en" ? "g" : "г"}</span>
                            <span>•</span>
                            <span>
                              {language === "en" ? `P:${item.protein || 0} F:${item.fat || 0} C:${item.carbs || 0}` : `Б:${item.protein || 0} Ж:${item.fat || 0} У:${item.carbs || 0}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditDish(item, menu.mealType)}
                              className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                              title={t("canteen.editDish")}
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDish(item.id, item.name)}
                              className="p-1 hover:bg-red-100 rounded-lg text-red-600 transition-colors cursor-pointer"
                              title={t("canteen.deleteDish")}
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT DISH */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-modal animate-modal-pop rounded-3xl p-6 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">restaurant</span>
                {editingItem ? (language === "en" ? "Edit Dish" : "Редактирование блюда") : (language === "en" ? "New Dish in Menu" : "Новое блюдо в меню")}
              </h4>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t("canteen.dishName")} *
                </label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder={language === "en" ? "e.g. Steamed Chicken Cutlets" : "Например: Котлеты куриные на пару"}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none ${
                    formErrors.name
                      ? "border-red-500 bg-red-50/50"
                      : "border-slate-200 focus:border-primary"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t("canteen.category")}</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {language === "en" ? "Meal Slot" : "Прием пищи"}
                  </label>
                  <select
                    value={dishMealType}
                    onChange={(e) => setDishMealType(e.target.value as MealType)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="BREAKFAST">{t("canteen.breakfast")}</option>
                    <option value="LUNCH">{t("canteen.lunch")}</option>
                    <option value="SNACK">{t("canteen.snack")}</option>
                    <option value="DINNER">{t("canteen.dinner")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t("canteen.desc")}
                </label>
                <textarea
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder={language === "en" ? "Ingredients, culinary specifics..." : "Ингредиенты, особенности приготовления..."}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              {/* KBJU Grid */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "en" ? "Nutrition (KBJU) & Portion Weight" : "Пищевая ценность (КБЖУ) и вес"}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      {language === "en" ? "Kcal" : "Ккал"}
                    </label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) =>
                        setCalories(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="350"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      {language === "en" ? "Protein (g)" : "Белки (г)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={protein}
                      onChange={(e) =>
                        setProtein(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="24"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      {language === "en" ? "Fat (g)" : "Жиры (г)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fat}
                      onChange={(e) =>
                        setFat(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="12"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      {language === "en" ? "Carbs (g)" : "Углеводы (г)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={carbs}
                      onChange={(e) =>
                        setCarbs(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="35"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      {t("canteen.weight")}
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) =>
                        setWeight(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="200"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      {t("canteen.price")}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="150"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Allergens & Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  {language === "en" ? "Allergens contained:" : "Аллергены в составе блюда:"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGEN_OPTIONS.map((alg) => {
                    const isSelected = selectedAllergens.includes(alg);
                    return (
                      <button
                        type="button"
                        key={alg}
                        onClick={() => toggleAllergen(alg)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-amber-100 border-amber-300 text-amber-900"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected ? `✓ ${alg}` : alg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>🌱 {t("canteen.vegetarian")}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs">
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>🌿 {t("canteen.vegan")}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t("canteen.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                      {language === "en" ? "Saving..." : "Сохранение..."}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      {editingItem ? (language === "en" ? "Save Changes" : "Сохранить изменения") : t("canteen.addDish")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COPY WEEK MENU */}
      {isCopyWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-modal animate-modal-pop rounded-3xl p-6 max-w-md w-full space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">content_copy</span>
                {t("canteen.copyWeek")}
              </h4>
              <button
                onClick={() => setIsCopyWeekModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {language === "en"
                ? "All meal plans (breakfast, lunch, snack, dinner) will be duplicated to target week with shifted dates."
                : "Все рационы (завтраки, обеды, полдники и ужины) выбранной недели будут автоматически скопированы на следующую неделю с пересчетом дат."}
            </p>

            <form onSubmit={handleExecuteCopyWeek} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {language === "en" ? "Source Week Monday:" : "Понедельник исходной недели:"}
                </label>
                <input
                  type="date"
                  value={fromWeekStart}
                  onChange={(e) => setFromWeekStart(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {language === "en" ? "Target Week Monday:" : "Понедельник целевой недели:"}
                </label>
                <input
                  type="date"
                  value={toWeekStart}
                  onChange={(e) => setToWeekStart(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCopyWeekModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t("canteen.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCopying}
                  className="px-5 py-2.5 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isCopying ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                      {language === "en" ? "Copying..." : "Копирование..."}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      {language === "en" ? "Duplicate Ration" : "Скопировать рацион"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

