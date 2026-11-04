import { MenuItem } from "../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../shared/Result";

const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  nuts: ["орехи", "орех", "арахис", "грецкий орех", "фундук", "миндаль", "кешью", "пекан", "nuts", "peanuts", "tree nuts"],
  lactose: ["лактоза", "молоко", "сливки", "творог", "сыр", "рикотта", "молочный белок", "lactose", "milk", "dairy"],
  gluten: ["глютен", "пшеница", "мука", "рожь", "ячмень", "овес", "gluten", "wheat"],
  eggs: ["яйца", "яйцо", "меланж", "eggs", "egg"],
  fish: ["рыба", "морепродукты", "креветки", "тунец", "лосось", "fish", "seafood", "shellfish"],
  soy: ["соя", "соевый", "soy", "soya"],
  celery: ["сельдерей", "celery"],
  mustard: ["горчица", "mustard"],
};

export class AllergenSafetyGuard {
  /**
   * Validates selected menu items against registered student allergies.
   * Returns Result.ok() if completely safe, or Result.fail with exact allergen and dish name.
   */
  public checkSafety(studentAllergies: string[], selectedDishes: MenuItem[]): Result<void> {
    if (!studentAllergies || studentAllergies.length === 0 || !selectedDishes || selectedDishes.length === 0) {
      return Result.ok();
    }

    const normalizedStudentAllergies = studentAllergies.map((a) => this.canonicalizeAllergen(a));

    for (const dish of selectedDishes) {
      if (!dish.allergens || dish.allergens.length === 0) {
        continue;
      }

      for (const dishAllergen of dish.allergens) {
        const canonicalDishAllergen = this.canonicalizeAllergen(dishAllergen);

        for (const studentAllergy of normalizedStudentAllergies) {
          if (this.isAllergenMatch(canonicalDishAllergen, studentAllergy)) {
            return Result.fail(
              `Предупреждение безопасности питания: блюдо '${dish.name}' содержит аллерген '${dishAllergen}', противопоказанный учащемуся`
            );
          }
        }
      }
    }

    return Result.ok();
  }

  private canonicalizeAllergen(val: string): string {
    return val.trim().toLowerCase();
  }

  private isAllergenMatch(a: string, b: string): boolean {
    if (a === b || a.includes(b) || b.includes(a)) {
      return true;
    }

    // Check synonymous groups
    for (const group of Object.values(ALLERGEN_SYNONYMS)) {
      const inA = group.some((term) => a.includes(term) || term.includes(a));
      const inB = group.some((term) => b.includes(term) || term.includes(b));
      if (inA && inB) {
        return true;
      }
    }

    return false;
  }
}

