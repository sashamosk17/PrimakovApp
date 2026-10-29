import { IDeadlineRepository } from "../../../domain/repositories/IDeadlineRepository";
import { Deadline } from "../../../domain/entities/Deadline";
import { Result } from "../../../shared/Result";
import { DeadlineStatus } from "../../../domain/value-objects/DeadlineStatus";
import { randomUUID } from "crypto";

export class MockDeadlineRepository implements IDeadlineRepository {
  private deadlines: Deadline[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const today = new Date();
    const subjects = ["Математика", "Русский язык", "История", "Физика", "Химия", "Литература"];
    const defaultUserId = "user-1";

    const mockDeadlines = [
      {
        id: randomUUID(),
        title: "Реферат по истории",
        description: "Написать реферат про Французскую революцию",
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        userId: defaultUserId,
        status: DeadlineStatus.PENDING,
        subject: subjects[2],
      },
      {
        id: randomUUID(),
        title: "Задачи по математике",
        description: "Решить задачи с параграфа 5.3",
        dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        userId: defaultUserId,
        status: DeadlineStatus.PENDING,
        subject: subjects[0],
      },
      {
        id: randomUUID(),
        title: "Проект по физике",
        description: "Провести эксперимент и написать отчет",
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        userId: defaultUserId,
        status: DeadlineStatus.PENDING,
        subject: subjects[3],
      },
      {
        id: randomUUID(),
        title: "Сочинение на русском",
        description: "Написать сочинение на тему 'Моя семья'",
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        userId: defaultUserId,
        status: DeadlineStatus.PENDING,
        subject: subjects[1],
      },
      {
        id: randomUUID(),
        title: "Практическая работа по химии",
        description: "Провести опыт и оформить результаты",
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        userId: defaultUserId,
        status: DeadlineStatus.PENDING,
        subject: subjects[4],
      },
      {
        id: randomUUID(),
        title: "Анализ стихотворения",
        description: "Проанализировать произведение Пушкина",
        dueDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        userId: defaultUserId,
        status: DeadlineStatus.COMPLETED,
        subject: subjects[5],
      },
    ];

    mockDeadlines.forEach((data) => {
      const deadline = new Deadline(
        data.id,
        data.title,
        data.description,
        data.dueDate,
        data.userId,
        data.status,
        today,
        data.status === DeadlineStatus.COMPLETED ? today : undefined,
        undefined,
        data.subject
      );
      this.deadlines.push(deadline);
    });
  }

  async getByUser(userId: string): Promise<Result<Deadline[]>> {
    return Result.ok(this.deadlines.filter((d) => d.userId === userId));
  }

  async findById(id: string): Promise<Deadline | undefined> {
    return this.deadlines.find((d) => d.id === id);
  }

  async save(deadline: Deadline): Promise<Result<void>> {
    this.deadlines.push(deadline);
    return Result.ok();
  }

  async update(deadline: Deadline): Promise<Result<void>> {
    const index = this.deadlines.findIndex((d) => d.id === deadline.id);
    if (index >= 0) {
      this.deadlines[index] = deadline;
    }
    return Result.ok();
  }
}
