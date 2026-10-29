/**
 * Integration тесты для RatingService + AnnouncementService.
 */
import { RatingService } from "../../src/domain/services/RatingService";
import { MockRatingRepository } from "../../src/infrastructure/database/mock/MockRatingRepository";
import { RateTeacherUseCase } from "../../src/application/rating/RateTeacherUseCase";
import { GetTeacherRatingsUseCase } from "../../src/application/rating/GetTeacherRatingsUseCase";
import { Rating } from "../../src/domain/entities/Rating";

import { GetAnnouncementsUseCase } from "../../src/application/announcement/GetAnnouncementsUseCase";
import { GetAnnouncementByCategoryUseCase } from "../../src/application/announcement/GetAnnouncementByCategoryUseCase";
import { MockAnnouncementRepository } from "../../src/infrastructure/database/mock/MockAnnouncementRepository";

function makeRatingSetup() {
  const repo = new MockRatingRepository();
  const service = new RatingService(repo);
  return {
    repo,
    rate: new RateTeacherUseCase(service),
    getRatings: new GetTeacherRatingsUseCase(service),
  };
}

function makeRating(overrides: Partial<{
  id: string;
  teacherId: string;
  userId: string;
  value: number;
  comment: string;
}> = {}): Rating {
  return new Rating(
    overrides.id ?? "new-rating-1",
    overrides.teacherId ?? "teacher-99",
    overrides.userId ?? "user-99",
    overrides.value ?? 5,
    new Date(),
    overrides.comment ?? "Отлично"
  );
}

// ───────────────────────────────────────────
// RatingService
// ───────────────────────────────────────────
describe("RateTeacherUseCase + GetTeacherRatingsUseCase", () => {
  it("должен успешно сохранить оценку учителю", async () => {
    const { rate } = makeRatingSetup();
    const rating = makeRating();

    const result = await rate.execute(rating);

    expect(result.isSuccess).toBe(true);
  });

  it("сохранённая оценка должна появиться в списке для учителя", async () => {
    const { rate, getRatings } = makeRatingSetup();
    const rating = makeRating({ teacherId: "teacher-new" });

    await rate.execute(rating);
    const result = await getRatings.execute("teacher-new");

    expect(result.isSuccess).toBe(true);
    expect(result.value.some((r) => r.id === rating.id)).toBe(true);
  });

  it("должен вернуть все оценки учителя из тестовых данных", async () => {
    const { getRatings } = makeRatingSetup();

    const result = await getRatings.execute("teacher-1");

    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBeGreaterThan(0);
    result.value.forEach((r) => expect(r.teacherId).toBe("teacher-1"));
  });

  it("должен вернуть пустой массив для учителя без оценок", async () => {
    const { getRatings } = makeRatingSetup();

    const result = await getRatings.execute("unknown-teacher");

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it("должен правильно хранить значение оценки и комментарий", async () => {
    const { rate, getRatings } = makeRatingSetup();
    const rating = makeRating({
      teacherId: "teacher-with-comment",
      value: 8,
      comment: "Очень хорошо объясняет материал",
    });

    await rate.execute(rating);
    const result = await getRatings.execute("teacher-with-comment");

    const saved = result.value[0];
    expect(saved.value).toBe(8);
    expect(saved.comment).toBe("Очень хорошо объясняет материал");
  });

  it("несколько оценок от разных студентов одному учителю", async () => {
    const { rate, getRatings } = makeRatingSetup();
    const teacherId = "popular-teacher";

    await rate.execute(makeRating({ id: "r1", teacherId, userId: "user-a", value: 9 }));
    await rate.execute(makeRating({ id: "r2", teacherId, userId: "user-b", value: 7 }));
    await rate.execute(makeRating({ id: "r3", teacherId, userId: "user-c", value: 10 }));

    const result = await getRatings.execute(teacherId);
    expect(result.value).toHaveLength(3);
  });
});

// ───────────────────────────────────────────
// AnnouncementService
// ───────────────────────────────────────────
describe("GetAnnouncementsUseCase", () => {
  it("должен вернуть все объявления", async () => {
    const repo = new MockAnnouncementRepository();
    const useCase = new GetAnnouncementsUseCase(repo);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBeGreaterThan(0);
  });

  it("у каждого объявления должны быть обязательные поля", async () => {
    const repo = new MockAnnouncementRepository();
    const useCase = new GetAnnouncementsUseCase(repo);

    const result = await useCase.execute();

    result.value.forEach((a) => {
      expect(a.id).toBeDefined();
      expect(a.title).toBeDefined();
      expect(a.category).toMatch(/^(EVENT|NEWS|MAINTENANCE|IMPORTANT)$/);
      expect(a.date).toBeInstanceOf(Date);
    });
  });
});

describe("GetAnnouncementByCategoryUseCase", () => {
  it("должен вернуть только объявления категории EVENT", async () => {
    const repo = new MockAnnouncementRepository();
    const useCase = new GetAnnouncementByCategoryUseCase(repo);

    const result = await useCase.execute("EVENT");

    expect(result.isSuccess).toBe(true);
    result.value.forEach((a) => expect(a.category).toBe("EVENT"));
  });

  it("должен вернуть только объявления категории IMPORTANT", async () => {
    const repo = new MockAnnouncementRepository();
    const useCase = new GetAnnouncementByCategoryUseCase(repo);

    const result = await useCase.execute("IMPORTANT");

    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBeGreaterThan(0);
    result.value.forEach((a) => expect(a.category).toBe("IMPORTANT"));
  });

  it("должен вернуть пустой массив для несуществующей категории", async () => {
    const repo = new MockAnnouncementRepository();
    const useCase = new GetAnnouncementByCategoryUseCase(repo);

    const result = await useCase.execute("NONEXISTENT");

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it("не должен смешивать объявления разных категорий", async () => {
    const repo = new MockAnnouncementRepository();
    const useCase = new GetAnnouncementByCategoryUseCase(repo);

    const events = await useCase.execute("EVENT");
    const maintenance = await useCase.execute("MAINTENANCE");

    const eventIds = events.value.map((a) => a.id);
    const maintenanceIds = maintenance.value.map((a) => a.id);

    // Пересечение должно быть пустым
    const overlap = eventIds.filter((id) => maintenanceIds.includes(id));
    expect(overlap).toHaveLength(0);
  });
});
