import { Rating } from "../../src/domain/entities/Rating";

function makeRating(overrides: Partial<{
  id: string;
  teacherId: string;
  userId: string;
  value: number;
  comment: string;
}> = {}): Rating {
  return new Rating(
    overrides.id ?? "rating-1",
    overrides.teacherId ?? "teacher-1",
    overrides.userId ?? "user-1",
    overrides.value ?? 5,
    new Date(),
    overrides.comment ?? "Хороший учитель"
  );
}

describe("Rating Entity", () => {
  describe("canBeUpdated()", () => {
    it("должен возвращать true для значения в диапазоне 1–10", () => {
      expect(makeRating({ value: 1 }).canBeUpdated()).toBe(true);
      expect(makeRating({ value: 5 }).canBeUpdated()).toBe(true);
      expect(makeRating({ value: 10 }).canBeUpdated()).toBe(true);
    });

    it("должен возвращать false для значения 0", () => {
      expect(makeRating({ value: 0 }).canBeUpdated()).toBe(false);
    });

    it("должен возвращать false для значения 11", () => {
      expect(makeRating({ value: 11 }).canBeUpdated()).toBe(false);
    });
  });

  describe("update()", () => {
    it("должен успешно обновить значение в диапазоне 1–10", () => {
      const rating = makeRating({ value: 3 });

      const result = rating.update(8);

      expect(result.isSuccess).toBe(true);
      expect(rating.value).toBe(8);
    });

    it("должен увеличить version при обновлении", () => {
      const rating = makeRating();
      const originalVersion = rating.version;

      rating.update(7);

      expect(rating.version).toBe(originalVersion + 1);
    });

    it("должен обновить updatedAt при обновлении", () => {
      const before = Date.now();
      const rating = makeRating();

      rating.update(9);

      expect(rating.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("должен вернуть ошибку для значения 0", () => {
      const rating = makeRating();

      const result = rating.update(0);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("Invalid rating value");
    });

    it("должен вернуть ошибку для значения 11", () => {
      const rating = makeRating();

      const result = rating.update(11);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("Invalid rating value");
    });

    it("должен вернуть ошибку для отрицательного значения", () => {
      const rating = makeRating();

      const result = rating.update(-1);

      expect(result.isFailure).toBe(true);
    });

    it("НЕ должен менять значение при ошибке", () => {
      const rating = makeRating({ value: 5 });

      rating.update(999);

      // Значение должно остаться прежним
      expect(rating.value).toBe(5);
    });
  });

  describe("isOlderThan()", () => {
    it("должен возвращать true для оценки старше указанного числа дней", () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 дней назад
      const rating = new Rating("r1", "t1", "u1", 5, oldDate, "comment", oldDate);

      expect(rating.isOlderThan(5)).toBe(true);
    });

    it("должен возвращать false для свежей оценки", () => {
      const rating = makeRating(); // updatedAt = сейчас

      expect(rating.isOlderThan(1)).toBe(false);
    });

    it("должен возвращать false для оценки ровно в указанный день", () => {
      // Ровно 5 дней назад — граничный случай (не "старше", а "равно")
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const rating = new Rating("r1", "t1", "u1", 5, fiveDaysAgo, "comment", fiveDaysAgo);

      // Ровно 5 дней — не "старше 5 дней" (зависит от реализации)
      // Тест фиксирует текущее поведение: > days * ms, так что ровно 5 = false
      expect(rating.isOlderThan(5)).toBe(false);
    });
  });
});
