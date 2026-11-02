import { ProcessDeadlineNotificationsUseCase } from "../../src/application/deadline/ProcessDeadlineNotificationsUseCase";
import { MockDeadlineRepository } from "../../src/infrastructure/database/memory/MockDeadlineRepository";
import { MockNotificationPreferencesRepository } from "../../src/infrastructure/database/memory/MockNotificationPreferencesRepository";
import { MockDeadlineNotificationLogRepository } from "../../src/infrastructure/database/memory/MockDeadlineNotificationLogRepository";
import { MockPushNotificationService } from "../../src/infrastructure/external-services/MockPushNotificationService";
import { Deadline } from "../../src/domain/entities/Deadline";
import { DeadlineStatus } from "../../src/domain/value-objects/DeadlineStatus";
import { NotificationPreferences } from "../../src/domain/entities/NotificationPreferences";
import { randomUUID } from "crypto";

describe("ProcessDeadlineNotificationsUseCase (Push Alerts for 24h and 2h)", () => {
  let deadlineRepo: MockDeadlineRepository;
  let notificationRepo: MockNotificationPreferencesRepository;
  let logRepo: MockDeadlineNotificationLogRepository;
  let pushService: MockPushNotificationService;
  let useCase: ProcessDeadlineNotificationsUseCase;

  const now = new Date("2026-11-02T12:00:00.000Z");

  beforeEach(() => {
    deadlineRepo = new MockDeadlineRepository();
    // clear default mock deadlines for deterministic testing
    (deadlineRepo as any).deadlines = [];
    notificationRepo = new MockNotificationPreferencesRepository();
    logRepo = new MockDeadlineNotificationLogRepository();
    pushService = new MockPushNotificationService();

    useCase = new ProcessDeadlineNotificationsUseCase(
      deadlineRepo,
      notificationRepo,
      logRepo,
      pushService
    );
  });

  it("should send a 24h alert for a pending deadline due in 24 hours", async () => {
    const userId = randomUUID();
    const deadlineId = randomUUID();
    const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24h away

    const deadline = new Deadline(
      deadlineId,
      "Курсовой проект",
      "Сдать финальный отчет",
      dueDate,
      userId,
      DeadlineStatus.PENDING,
      now,
      now,
      undefined,
      "Информатика"
    );
    await deadlineRepo.save(deadline);

    const result = await useCase.execute({ referenceTime: now });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sentCount).toBe(1);
    expect(pushService.sentNotifications).toHaveLength(1);

    const sent = pushService.sentNotifications[0];
    expect(sent.userId).toBe(userId);
    expect(sent.data.type).toBe("DEADLINE_ALERT");
    expect(sent.data.hoursRemaining).toBe(24);
    expect(sent.data.deadlineId).toBe(deadlineId);
    expect(sent.title).toContain("24");

    // Verify logged in notification history to avoid duplicate send
    const isLogged = await logRepo.hasNotificationBeenSent(deadlineId, 24);
    expect(isLogged).toBe(true);
  });

  it("should send an urgent 2h alert for a pending deadline due in 2 hours", async () => {
    const userId = randomUUID();
    const deadlineId = randomUUID();
    const dueDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours away

    const deadline = new Deadline(
      deadlineId,
      "Лабораторная работа №3",
      "Загрузить файл на портал",
      dueDate,
      userId,
      DeadlineStatus.PENDING,
      now,
      now,
      undefined,
      "Физика"
    );
    await deadlineRepo.save(deadline);

    const result = await useCase.execute({ referenceTime: now });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sentCount).toBe(1);
    expect(pushService.sentNotifications).toHaveLength(1);

    const sent = pushService.sentNotifications[0];
    expect(sent.data.hoursRemaining).toBe(2);
    expect(sent.title).toContain("Срочно");
    expect(sent.title).toContain("2");

    const isLogged = await logRepo.hasNotificationBeenSent(deadlineId, 2);
    expect(isLogged).toBe(true);
  });

  it("should not resend 24h alert if it has already been sent", async () => {
    const userId = randomUUID();
    const deadlineId = randomUUID();
    const dueDate = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);

    const deadline = new Deadline(
      deadlineId,
      "ДЗ по литературе",
      "Прочитать главу 4",
      dueDate,
      userId,
      DeadlineStatus.PENDING,
      now,
      now,
      undefined,
      "Литература"
    );
    await deadlineRepo.save(deadline);

    // Mark 24h alert as already sent
    await logRepo.markNotificationSent(deadlineId, 24, now);

    const result = await useCase.execute({ referenceTime: now });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sentCount).toBe(0);
    expect(pushService.sentNotifications).toHaveLength(0);
  });

  it("should send 2h alert even if 24h alert was previously sent", async () => {
    const userId = randomUUID();
    const deadlineId = randomUUID();
    const dueDate = new Date(now.getTime() + 1.5 * 60 * 60 * 1000); // 1.5 hours away

    const deadline = new Deadline(
      deadlineId,
      "Контрольный срез",
      "Подготовиться к тесту",
      dueDate,
      userId,
      DeadlineStatus.PENDING,
      now,
      now,
      undefined,
      "Химия"
    );
    await deadlineRepo.save(deadline);

    // 24h was already sent yesterday
    await logRepo.markNotificationSent(deadlineId, 24, new Date(now.getTime() - 22 * 60 * 60 * 1000));

    const result = await useCase.execute({ referenceTime: now });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sentCount).toBe(1);
    expect(pushService.sentNotifications[0].data.hoursRemaining).toBe(2);

    const is2hLogged = await logRepo.hasNotificationBeenSent(deadlineId, 2);
    expect(is2hLogged).toBe(true);
  });

  it("should suppress notification if user has disabled deadline push in preferences", async () => {
    const userId = randomUUID();
    const deadlineId = randomUUID();
    const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const deadline = new Deadline(
      deadlineId,
      "Тест по обществознанию",
      "Подготовка",
      dueDate,
      userId,
      DeadlineStatus.PENDING,
      now,
      now,
      undefined,
      "Обществознание"
    );
    await deadlineRepo.save(deadline);

    // User preferences disable deadline notifications
    const prefs = new NotificationPreferences(userId, true, false); // pushEnabled=true, deadlineNotifications=false
    await notificationRepo.save(prefs);

    const result = await useCase.execute({ referenceTime: now });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sentCount).toBe(0);
    expect(pushService.sentNotifications).toHaveLength(0);
  });

  it("should ignore completed deadlines", async () => {
    const userId = randomUUID();
    const deadlineId = randomUUID();
    const dueDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const deadline = new Deadline(
      deadlineId,
      "Уже сделано",
      "Все готово",
      dueDate,
      userId,
      DeadlineStatus.COMPLETED,
      now,
      now,
      now,
      "Алгебра"
    );
    await deadlineRepo.save(deadline);

    const result = await useCase.execute({ referenceTime: now });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sentCount).toBe(0);
    expect(pushService.sentNotifications).toHaveLength(0);
  });
});

