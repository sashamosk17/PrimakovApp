import { MockStoryRepository } from "../../src/infrastructure/database/memory/MockStoryRepository";
import { CreateStoryUseCase } from "../../src/application/story/CreateStoryUseCase";
import { UpdateStoryUseCase } from "../../src/application/story/UpdateStoryUseCase";
import { DeleteStoryUseCase } from "../../src/application/story/DeleteStoryUseCase";

describe("Story Management UseCases", () => {
  let storyRepo: MockStoryRepository;
  let createUseCase: CreateStoryUseCase;
  let updateUseCase: UpdateStoryUseCase;
  let deleteUseCase: DeleteStoryUseCase;

  beforeEach(() => {
    storyRepo = new MockStoryRepository();
    createUseCase = new CreateStoryUseCase(storyRepo);
    updateUseCase = new UpdateStoryUseCase(storyRepo);
    deleteUseCase = new DeleteStoryUseCase(storyRepo);
  });

  describe("CreateStoryUseCase", () => {
    it("should successfully create a story with short text and interactive link", async () => {
      const result = await createUseCase.execute({
        title: "Хакатон Primakov Digital 2026",
        description: "Регистрация команд открыта! Успейте подать заявку до 10 ноября.",
        imageUrl: "https://primakov.school/images/hackathon.jpg",
        linkUrl: "https://primakov.school/hackathon",
        linkText: "Подать заявку",
        expiresInDays: 5,
      });

      expect(result.isSuccess).toBe(true);
      const story = result.value;
      expect(story.id).toBeDefined();
      expect(story.title).toBe("Хакатон Primakov Digital 2026");
      expect(story.description).toBe("Регистрация команд открыта! Успейте подать заявку до 10 ноября.");
      expect(story.linkUrl).toBe("https://primakov.school/hackathon");
      expect(story.linkText).toBe("Подать заявку");

      const saved = await storyRepo.getById(story.id);
      expect(saved.isSuccess).toBe(true);
      expect(saved.value?.title).toBe("Хакатон Primakov Digital 2026");
    });

    it("should fail when title is empty", async () => {
      const result = await createUseCase.execute({
        title: "",
        description: "Some description",
      });
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Title");
    });

    it("should fail when description is empty", async () => {
      const result = await createUseCase.execute({
        title: "Some title",
        description: "",
      });
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Description");
    });
  });

  describe("UpdateStoryUseCase", () => {
    it("should successfully update existing story fields", async () => {
      const result = await updateUseCase.execute({
        id: "story-1",
        title: "Обновленный день открытых дверей",
        description: "Новое расписание экскурсий по кампусу",
        linkUrl: "https://primakov.school/openday",
        linkText: "Подробнее о программе",
      });

      expect(result.isSuccess).toBe(true);
      const updated = result.value;
      expect(updated.title).toBe("Обновленный день открытых дверей");
      expect(updated.description).toBe("Новое расписание экскурсий по кампусу");
      expect(updated.linkUrl).toBe("https://primakov.school/openday");
      expect(updated.linkText).toBe("Подробнее о программе");

      const saved = await storyRepo.getById("story-1");
      expect(saved.value?.title).toBe("Обновленный день открытых дверей");
    });

    it("should fail when story is not found", async () => {
      const result = await updateUseCase.execute({
        id: "non-existent-id",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("not found");
    });
  });

  describe("DeleteStoryUseCase", () => {
    it("should delete a story by id", async () => {
      const result = await deleteUseCase.execute("story-2");
      expect(result.isSuccess).toBe(true);

      const found = await storyRepo.getById("story-2");
      expect(found.value).toBeNull();
    });
  });
});

