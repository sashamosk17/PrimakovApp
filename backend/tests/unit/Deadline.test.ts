import { Deadline } from "../../src/domain/entities/Deadline";
import { DeadlineStatus } from "../../src/domain/value-objects/DeadlineStatus";

// Фабричная функция для создания тестового дедлайна
function makeDeadline(overrides: Partial<{
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  userId: string;
  status: DeadlineStatus;
  subject: string;
}> = {}): Deadline {
  return new Deadline(
    overrides.id ?? "deadline-1",
    overrides.title ?? "Тестовый дедлайн",
    overrides.description ?? "Описание",
    overrides.dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через 7 дней
    overrides.userId ?? "user-1",
    overrides.status ?? DeadlineStatus.PENDING,
    new Date(),
    undefined,
    undefined,
    overrides.subject
  );
}

describe("Deadline Entity", () => {
  describe("complete()", () => {
    it("должен изменить статус на COMPLETED", () => {
      const deadline = makeDeadline();

      const result = deadline.complete();

      expect(result.isSuccess).toBe(true);
      expect(deadline.status).toBe(DeadlineStatus.COMPLETED);
    });

    it("должен установить completedAt при завершении", () => {
      const deadline = makeDeadline();
      const before = Date.now();

      deadline.complete();

      expect(deadline.completedAt).toBeDefined();
      expect(deadline.completedAt!.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("должен обновить updatedAt при завершении", () => {
      const deadline = makeDeadline();
      const before = Date.now();

      deadline.complete();

      expect(deadline.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("должен вернуть ошибку если дедлайн уже завершён", () => {
      const deadline = makeDeadline({ status: DeadlineStatus.COMPLETED });

      const result = deadline.complete();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("Deadline already completed");
    });
  });

  describe("uncomplete()", () => {
    it("должен вернуть статус PENDING из COMPLETED", () => {
      const deadline = makeDeadline({ status: DeadlineStatus.COMPLETED });

      const result = deadline.uncomplete();

      expect(result.isSuccess).toBe(true);
      expect(deadline.status).toBe(DeadlineStatus.PENDING);
    });

    it("должен очистить completedAt при отмене завершения", () => {
      const deadline = makeDeadline({ status: DeadlineStatus.COMPLETED });

      deadline.uncomplete();

      expect(deadline.completedAt).toBeUndefined();
    });

    it("должен вернуть ошибку если дедлайн ещё не завершён", () => {
      const deadline = makeDeadline({ status: DeadlineStatus.PENDING });

      const result = deadline.uncomplete();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("Deadline is not completed");
    });
  });

  describe("isOverdue()", () => {
    it("должен возвращать true если срок прошёл и статус PENDING", () => {
      const overdueDeadline = makeDeadline({
        dueDate: new Date(Date.now() - 1000), // 1 секунда назад
      });

      expect(overdueDeadline.isOverdue()).toBe(true);
    });

    it("должен возвращать false если срок не прошёл", () => {
      const futureDeadline = makeDeadline({
        dueDate: new Date(Date.now() + 60 * 60 * 1000), // через час
      });

      expect(futureDeadline.isOverdue()).toBe(false);
    });

    it("должен возвращать false если дедлайн завершён, даже если срок прошёл", () => {
      const completedOverdue = makeDeadline({
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // вчера
        status: DeadlineStatus.COMPLETED,
      });

      expect(completedOverdue.isOverdue()).toBe(false);
    });
  });

  describe("getDaysLeft()", () => {
    it("должен возвращать примерно 7 для дедлайна через 7 дней", () => {
      const deadline = makeDeadline({
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const daysLeft = deadline.getDaysLeft();

      expect(daysLeft).toBe(7);
    });

    it("должен возвращать 1 для дедлайна завтра", () => {
      const deadline = makeDeadline({
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(deadline.getDaysLeft()).toBe(1);
    });

    it("должен возвращать отрицательное число для просроченного дедлайна", () => {
      const deadline = makeDeadline({
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
      });

      expect(deadline.getDaysLeft()).toBeLessThan(0);
    });
  });

  describe("extend()", () => {
    it("должен перенести дедлайн на более позднюю дату", () => {
      const deadline = makeDeadline();
      const originalDue = deadline.dueDate;
      const newDate = new Date(originalDue.getTime() + 3 * 24 * 60 * 60 * 1000);

      const result = deadline.extend(newDate);

      expect(result.isSuccess).toBe(true);
      expect(deadline.dueDate).toEqual(newDate);
    });

    it("должен вернуть ошибку если новая дата раньше текущей", () => {
      const deadline = makeDeadline();
      const earlierDate = new Date(deadline.dueDate.getTime() - 1000);

      const result = deadline.extend(earlierDate);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("New date must be later than current date");
    });

    it("должен вернуть ошибку если новая дата равна текущей", () => {
      const deadline = makeDeadline();
      const sameDue = new Date(deadline.dueDate.getTime());

      const result = deadline.extend(sameDue);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("changeTitle()", () => {
    it("должен изменить заголовок дедлайна", () => {
      const deadline = makeDeadline({ title: "Старый заголовок" });

      const result = deadline.changeTitle("Новый заголовок");

      expect(result.isSuccess).toBe(true);
      expect(deadline.title).toBe("Новый заголовок");
    });

    it("должен вернуть ошибку для пустого заголовка", () => {
      const deadline = makeDeadline();

      const result = deadline.changeTitle("");

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("Invalid title");
    });

    it("должен вернуть ошибку для заголовка из пробелов", () => {
      const deadline = makeDeadline();

      const result = deadline.changeTitle("   ");

      expect(result.isFailure).toBe(true);
    });
  });

  describe("complete() + uncomplete() цикл", () => {
    it("должен корректно выполнять полный цикл complete → uncomplete → complete", () => {
      const deadline = makeDeadline();

      const r1 = deadline.complete();
      expect(r1.isSuccess).toBe(true);
      expect(deadline.status).toBe(DeadlineStatus.COMPLETED);

      const r2 = deadline.uncomplete();
      expect(r2.isSuccess).toBe(true);
      expect(deadline.status).toBe(DeadlineStatus.PENDING);

      const r3 = deadline.complete();
      expect(r3.isSuccess).toBe(true);
      expect(deadline.status).toBe(DeadlineStatus.COMPLETED);
    });
  });
});
