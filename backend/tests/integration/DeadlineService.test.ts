/**
 * Integration тесты для всех use cases дедлайнов.
 * Проверяем CreateDeadlineUseCase, CompleteDeadlineUseCase, GetUserDeadlinesUseCase
 * через DeadlineService + MockDeadlineRepository.
 */
import { CreateDeadlineUseCase } from "../../src/application/deadline/CreateDeadlineUseCase";
import { CompleteDeadlineUseCase } from "../../src/application/deadline/CompleteDeadlineUseCase";
import { GetUserDeadlinesUseCase } from "../../src/application/deadline/GetUserDeadlinesUseCase";
import { DeadlineService } from "../../src/domain/services/DeadlineService";
import { MockDeadlineRepository } from "../../src/infrastructure/database/mock/MockDeadlineRepository";
import { Deadline } from "../../src/domain/entities/Deadline";
import { DeadlineStatus } from "../../src/domain/value-objects/DeadlineStatus";

function makeUseCases() {
  const repo = new MockDeadlineRepository();
  const service = new DeadlineService(repo);
  return {
    repo,
    create: new CreateDeadlineUseCase(service),
    complete: new CompleteDeadlineUseCase(service),
    getByUser: new GetUserDeadlinesUseCase(service),
  };
}

function makeFutureDeadline(id = "test-1", userId = "new-user"): Deadline {
  return new Deadline(
    id,
    "Тест дедлайн",
    "Описание",
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId,
    DeadlineStatus.PENDING,
    new Date()
  );
}

describe("CreateDeadlineUseCase", () => {
  it("должен успешно создать дедлайн", async () => {
    const { create } = makeUseCases();
    const deadline = makeFutureDeadline();

    const result = await create.execute(deadline);

    expect(result.isSuccess).toBe(true);
  });

  it("созданный дедлайн должен появиться в репозитории", async () => {
    const { repo, create } = makeUseCases();
    const deadline = makeFutureDeadline("new-deadline-id");

    await create.execute(deadline);

    const found = await repo.findById("new-deadline-id");
    expect(found).toBeDefined();
    expect(found!.id).toBe("new-deadline-id");
  });

  it("должен создать дедлайн с предметом", async () => {
    const { repo, create } = makeUseCases();
    const deadline = new Deadline(
      "d-with-subject",
      "Контрольная",
      "Задание",
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      "user-x",
      DeadlineStatus.PENDING,
      new Date(),
      undefined,
      undefined,
      "Математика"
    );

    await create.execute(deadline);

    const found = await repo.findById("d-with-subject");
    expect(found!.subject).toBe("Математика");
  });

  it("должен создать несколько дедлайнов для одного пользователя", async () => {
    const { repo, create } = makeUseCases();
    const userId = "multi-user";

    await create.execute(makeFutureDeadline("d-1", userId));
    await create.execute(makeFutureDeadline("d-2", userId));
    await create.execute(makeFutureDeadline("d-3", userId));

    const d1 = await repo.findById("d-1");
    const d2 = await repo.findById("d-2");
    const d3 = await repo.findById("d-3");

    expect(d1!.userId).toBe(userId);
    expect(d2!.userId).toBe(userId);
    expect(d3!.userId).toBe(userId);
  });
});

describe("CompleteDeadlineUseCase", () => {
  it("должен изменить статус дедлайна на COMPLETED", async () => {
    const { repo, complete } = makeUseCases();
    const deadline = makeFutureDeadline("to-complete");
    await repo.save(deadline);

    deadline.complete();
    await complete.execute(deadline);

    const found = await repo.findById("to-complete");
    expect(found!.status).toBe(DeadlineStatus.COMPLETED);
  });

  it("не должен завершить несуществующий дедлайн — updateById просто не найдёт его", async () => {
    const { complete } = makeUseCases();
    const ghost = makeFutureDeadline("ghost-id");
    ghost.complete();

    // update возвращает ok даже если не нашёл (поведение mock — проверяем это)
    const result = await complete.execute(ghost);
    expect(result.isSuccess).toBe(true); // mock не кидает ошибку при отсутствующем id
  });
});

describe("GetUserDeadlinesUseCase", () => {
  it("должен вернуть все дедлайны из тестовых данных для user-1", async () => {
    const { getByUser } = makeUseCases();

    const result = await getByUser.execute("user-1");

    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBeGreaterThan(0);
    result.value.forEach((d) => expect(d.userId).toBe("user-1"));
  });

  it("должен вернуть пустой массив для пользователя без дедлайнов", async () => {
    const { getByUser } = makeUseCases();

    const result = await getByUser.execute("nobody");

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it("только что созданный дедлайн должен появляться в списке", async () => {
    const { repo, create, getByUser } = makeUseCases();
    const userId = "fresh-user";
    const deadline = makeFutureDeadline("fresh-d", userId);

    await create.execute(deadline);
    const result = await getByUser.execute(userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value.some((d) => d.id === "fresh-d")).toBe(true);
  });

  it("завершённые дедлайны должны включаться в результат", async () => {
    const { repo, complete, getByUser } = makeUseCases();
    const userId = "user-1";

    // Из тестовых данных берём первый дедлайн user-1
    const allResult = await getByUser.execute(userId);
    const firstPending = allResult.value.find((d) => d.status === DeadlineStatus.PENDING);
    if (!firstPending) return; // Guard

    firstPending.complete();
    await complete.execute(firstPending);

    const afterResult = await getByUser.execute(userId);
    const completed = afterResult.value.find((d) => d.id === firstPending.id);
    expect(completed!.status).toBe(DeadlineStatus.COMPLETED);
  });
});
