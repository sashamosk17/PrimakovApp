import { randomUUID } from "crypto";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IDeadlineRepository } from "../../domain/repositories/IDeadlineRepository";
import { Deadline } from "../../domain/entities/Deadline";
import { DeadlineStatus } from "../../domain/value-objects/DeadlineStatus";
import { Result } from "../../shared/Result";

export interface AutoHomeworkSyncInput {
  lessonId: string;
  scheduleId?: string;
  groupId: string;
  subject: string;
  homeworkDescription: string;
  lessonDate: Date;
  customDueDate?: Date;
}

export interface AutoHomeworkSyncOutput {
  createdCount: number;
  studentIds: string[];
}

export class AutoHomeworkSyncUseCase {
  constructor(
    private readonly scheduleRepo: IScheduleRepository,
    private readonly userRepo: IUserRepository,
    private readonly deadlineRepo: IDeadlineRepository
  ) {}

  public async execute(input: AutoHomeworkSyncInput): Promise<Result<AutoHomeworkSyncOutput>> {
    const homework = input.homeworkDescription?.trim();
    if (!homework) {
      return Result.ok({ createdCount: 0, studentIds: [] });
    }

    // 1. Determine dueDate
    let dueDate = input.customDueDate;
    if (!dueDate) {
      dueDate = await this.findNextLessonDueDate(input.groupId, input.subject, input.lessonDate);
    }

    // 2. Find all students belonging to the target class group
    const studentsRes = await this.userRepo.findByRole("STUDENT");
    if (studentsRes.isFailure || !studentsRes.value) {
      return Result.fail(studentsRes.error || "Failed to query students for homework sync");
    }

    const norm = (str?: string) => (str || "").replace(/[^0-9a-zA-Zа-яА-ЯёЁ]/g, "").toLowerCase();
    const targetGroupNorm = norm(input.groupId);

    const groupStudents = studentsRes.value.filter(
      (student) => norm(student.groupName) === targetGroupNorm && student.isActive
    );

    let createdCount = 0;
    const studentIds: string[] = [];

    // 3. Create or update deadline for each student in the group
    for (const student of groupStudents) {
      const existingDeadlinesRes = await this.deadlineRepo.getByUser(student.id);
      const existingDeadlines = existingDeadlinesRes.isSuccess && existingDeadlinesRes.value ? existingDeadlinesRes.value : [];

      const alreadyExists = existingDeadlines.some(
        (d) =>
          d.subject?.toLowerCase() === input.subject.toLowerCase() &&
          d.description === homework &&
          d.status !== DeadlineStatus.COMPLETED
      );

      if (!alreadyExists) {
        const deadline = new Deadline(
          randomUUID(),
          `${input.subject}: Домашнее задание`,
          homework,
          dueDate,
          student.id,
          DeadlineStatus.PENDING,
          new Date(),
          undefined,
          undefined,
          input.subject
        );

        const saveRes = await this.deadlineRepo.save(deadline);
        if (saveRes.isSuccess) {
          createdCount++;
          studentIds.push(student.id);
        }
      }
    }

    return Result.ok({ createdCount, studentIds });
  }

  private async findNextLessonDueDate(groupId: string, subject: string, currentDate: Date): Promise<Date> {
    const allSchedulesRes = await this.scheduleRepo.getAll();
    const norm = (str?: string) => (str || "").replace(/[^0-9a-zA-Zа-яА-ЯёЁ]/g, "").toLowerCase();
    const targetGroup = norm(groupId);
    const targetSubject = norm(subject);

    if (allSchedulesRes.isSuccess && allSchedulesRes.value) {
      const sorted = allSchedulesRes.value
        .filter((s) => norm(s.groupId) === targetGroup && new Date(s.date) > new Date(currentDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (const s of sorted) {
        const matchingLesson = s.lessons.find((l) => norm(l.subject) === targetSubject);
        if (matchingLesson) {
          const nextDate = new Date(s.date);
          const [hours, mins] = matchingLesson.timeSlot.startTime.split(":").map(Number);
          nextDate.setHours(hours || 8, mins || 30, 0, 0);
          return nextDate;
        }
      }
    }

    // Default: 7 days later at 18:00
    const fallback = new Date(currentDate);
    fallback.setDate(fallback.getDate() + 7);
    fallback.setHours(18, 0, 0, 0);
    return fallback;
  }
}

