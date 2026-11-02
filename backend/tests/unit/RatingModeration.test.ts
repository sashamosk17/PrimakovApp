import { MockRatingRepository } from "../../src/infrastructure/database/memory/MockRatingRepository";
import { ModerateRatingUseCase } from "../../src/application/admin/ModerateRatingUseCase";
import { DeleteRatingUseCase } from "../../src/application/admin/DeleteRatingUseCase";
import { Rating } from "../../src/domain/entities/Rating";

describe("Rating Moderation and Deletion UseCases", () => {
  let ratingRepo: MockRatingRepository;
  let moderateUseCase: ModerateRatingUseCase;
  let deleteUseCase: DeleteRatingUseCase;
  let testRating: Rating;

  beforeEach(async () => {
    ratingRepo = new MockRatingRepository();
    moderateUseCase = new ModerateRatingUseCase(ratingRepo);
    deleteUseCase = new DeleteRatingUseCase(ratingRepo);

    testRating = new Rating(
      "rating-101",
      "teacher-1",
      "student-1",
      9,
      new Date(),
      "Прекрасный преподаватель, все очень понятно объясняет!"
    );
    await ratingRepo.save(testRating);
  });

  it("should change rating status to HIDDEN", async () => {
    const result = await moderateUseCase.execute({
      ratingId: "rating-101",
      status: "HIDDEN",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe("HIDDEN");

    const allRatings = await ratingRepo.getAll();
    const updated = allRatings.value?.find((r) => r.id === "rating-101");
    expect(updated?.status).toBe("HIDDEN");
  });

  it("should delete a rating", async () => {
    const result = await deleteUseCase.execute("rating-101");
    expect(result.isSuccess).toBe(true);

    const allRatings = await ratingRepo.getAll();
    const found = allRatings.value?.find((r) => r.id === "rating-101");
    expect(found).toBeUndefined();
  });

  it("should fail when moderating non-existent rating", async () => {
    const result = await moderateUseCase.execute({
      ratingId: "unknown-rating",
      status: "HIDDEN",
    });
    expect(result.isFailure).toBe(true);
  });
});

