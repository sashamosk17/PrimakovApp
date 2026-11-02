import { MockScheduleRepository } from "../../src/infrastructure/database/memory/MockScheduleRepository";
import { SubstituteTeacherUseCase } from "../../src/application/admin/SubstituteTeacherUseCase";
import { AddLessonToScheduleUseCase } from "../../src/application/admin/AddLessonToScheduleUseCase";
import { GetAllSchedulesAdminUseCase } from "../../src/application/admin/GetAllSchedulesAdminUseCase";
import { Schedule } from "../../src/domain/entities/Schedule";
import { Lesson } from "../../src/domain/entities/Lesson";
import { TimeSlot } from "../../src/domain/value-objects/TimeSlot";
import { Room } from "../../src/domain/value-objects/Room";
import { randomUUID } from "crypto";

describe("Schedule Substitution & Lesson Management Use Cases", () => {
  let scheduleRepo: MockScheduleRepository;
  let substituteUseCase: SubstituteTeacherUseCase;
  let addLessonUseCase: AddLessonToScheduleUseCase;
  let getAllSchedulesUseCase: GetAllSchedulesAdminUseCase;

  const today = new Date("2026-11-02");

  beforeEach(() => {
    scheduleRepo = new MockScheduleRepository();
    substituteUseCase = new SubstituteTeacherUseCase(scheduleRepo);
    addLessonUseCase = new AddLessonToScheduleUseCase(scheduleRepo);
    getAllSchedulesUseCase = new GetAllSchedulesAdminUseCase(scheduleRepo);
  });

  it("substitutes teacher for a specific lesson successfully", async () => {
    const scheduleId = randomUUID();
    const lessonId = randomUUID();
    const originalTeacherId = randomUUID();
    const replacementTeacherId = randomUUID();

    const timeSlot = TimeSlot.create("09:00", "09:45").value;
    const room = Room.create("204", "Main", 2).value;

    const lesson = new Lesson(
      lessonId,
      "История",
      originalTeacherId,
      timeSlot,
      room,
      2
    );

    const schedule = new Schedule(scheduleId, "10-A", today, [lesson], today);
    await scheduleRepo.save(schedule);

    const result = await substituteUseCase.execute({
      scheduleId,
      lessonId,
      newTeacherId: replacementTeacherId,
      comment: "Замена по болезни основного преподавателя",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.teacherId).toBe(replacementTeacherId);

    // Verify persisted
    const updatedSchedule = (await scheduleRepo.getScheduleByGroup("10-A")).value;
    const updatedLesson = updatedSchedule?.lessons.find((l) => l.id === lessonId);
    expect(updatedLesson?.teacherId).toBe(replacementTeacherId);
  });

  it("adds a new lesson to schedule", async () => {
    const scheduleId = randomUUID();
    const teacherId = randomUUID();
    const schedule = new Schedule(scheduleId, "11-B", today, [], today);
    await scheduleRepo.save(schedule);

    const result = await addLessonUseCase.execute({
      scheduleId,
      subject: "Обществознание",
      teacherId,
      startTime: "11:00",
      endTime: "11:45",
      roomNumber: "305",
      floor: 3,
      hasHomework: false,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.subject).toBe("Обществознание");
    expect(result.value.room.number).toBe("305");

    const fetched = (await scheduleRepo.getScheduleByGroup("11-B")).value;
    expect(fetched?.lessons).toHaveLength(1);
  });

  it("lists all schedules for admin view", async () => {
    const s1 = new Schedule(randomUUID(), "9-A", today, [], today);
    const s2 = new Schedule(randomUUID(), "9-B", today, [], today);
    await scheduleRepo.save(s1);
    await scheduleRepo.save(s2);

    const result = await getAllSchedulesUseCase.execute();
    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBeGreaterThanOrEqual(2);
  });
});
