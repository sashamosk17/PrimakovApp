import { MockAnnouncementRepository } from "../../src/infrastructure/database/memory/MockAnnouncementRepository";
import { CreateAnnouncementUseCase } from "../../src/application/announcement/CreateAnnouncementUseCase";
import { DeleteAnnouncementUseCase } from "../../src/application/announcement/DeleteAnnouncementUseCase";

describe("Announcement Management UseCases", () => {
  let announcementRepo: MockAnnouncementRepository;
  let createUseCase: CreateAnnouncementUseCase;
  let deleteUseCase: DeleteAnnouncementUseCase;

  beforeEach(() => {
    announcementRepo = new MockAnnouncementRepository();
    createUseCase = new CreateAnnouncementUseCase(announcementRepo);
    deleteUseCase = new DeleteAnnouncementUseCase(announcementRepo);
  });

  it("should create a new announcement successfully", async () => {
    const result = await createUseCase.execute({
      title: "Праздничный концерт ко Дню Гимназии",
      category: "EVENT",
      content: "Приглашаем всех учащихся 1-11 классов в актовый зал",
      authorId: "admin-1",
    });

    expect(result.isSuccess).toBe(true);
    const created = result.value;
    expect(created.title).toBe("Праздничный концерт ко Дню Гимназии");
    expect(created.category).toBe("EVENT");

    const all = await announcementRepo.getAll();
    expect(all.value?.some((a) => a.id === created.id)).toBe(true);
  });

  it("should delete an existing announcement", async () => {
    const result = await deleteUseCase.execute("announcement-1");
    expect(result.isSuccess).toBe(true);

    const all = await announcementRepo.getAll();
    expect(all.value?.some((a) => a.id === "announcement-1")).toBe(false);
  });

  it("should fail validation when title is missing", async () => {
    const result = await createUseCase.execute({
      title: "",
      category: "EVENT",
      content: "Содержание",
      authorId: "admin-1",
    });

    expect(result.isFailure).toBe(true);
  });
});

