import { MockAnnouncementRepository } from "../../src/infrastructure/database/memory/MockAnnouncementRepository";
import { CreateAnnouncementUseCase } from "../../src/application/announcement/CreateAnnouncementUseCase";
import { DeleteAnnouncementUseCase } from "../../src/application/announcement/DeleteAnnouncementUseCase";
import { UpdateAnnouncementUseCase } from "../../src/application/announcement/UpdateAnnouncementUseCase";

describe("Announcement Management UseCases", () => {
  let announcementRepo: MockAnnouncementRepository;
  let createUseCase: CreateAnnouncementUseCase;
  let deleteUseCase: DeleteAnnouncementUseCase;
  let updateUseCase: UpdateAnnouncementUseCase;

  beforeEach(() => {
    announcementRepo = new MockAnnouncementRepository();
    createUseCase = new CreateAnnouncementUseCase(announcementRepo);
    deleteUseCase = new DeleteAnnouncementUseCase(announcementRepo);
    updateUseCase = new UpdateAnnouncementUseCase(announcementRepo);
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

  it("should update an existing announcement", async () => {
    const result = await updateUseCase.execute({
      id: "announcement-1",
      title: "Начало второй четверти (Обновлено)",
      content: "Новые инструкции для учеников",
    });

    expect(result.isSuccess).toBe(true);
    const updated = result.value;
    expect(updated.title).toBe("Начало второй четверти (Обновлено)");
    expect(updated.content).toBe("Новые инструкции для учеников");

    const saved = await announcementRepo.getById("announcement-1");
    expect(saved.value?.title).toBe("Начало второй четверти (Обновлено)");
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

