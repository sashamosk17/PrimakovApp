import { MockScheduleRepository } from "../../src/infrastructure/database/memory/MockScheduleRepository";
import { DeleteLessonFromScheduleUseCase } from "../../src/application/admin/DeleteLessonFromScheduleUseCase";
import { Schedule } from "../../src/domain/entities/Schedule";
import { Lesson } from "../../src/domain/entities/Lesson";
import { Room } from "../../src/domain/value-objects/Room";
import { TimeSlot } from "../../src/domain/value-objects/TimeSlot";

describe("DeleteLessonFromScheduleUseCase", () => {
  let scheduleRepo: MockScheduleRepository;
  let useCase: DeleteLessonFromScheduleUseCase;
  let testSchedule: Schedule;

  beforeEach(async () => {
    scheduleRepo = new MockScheduleRepository();
    useCase = new DeleteLessonFromScheduleUseCase(scheduleRepo);

    const room = Room.create("305", "MAIN", 3).value;
    const timeSlot1 = TimeSlot.create("08:30", "09:15").value;
    const timeSlot2 = TimeSlot.create("09:30", "10:15").value;
    const lesson1 = new Lesson("lesson-1", "Математика", "teacher-1", timeSlot1, room, 3);
    const lesson2 = new Lesson("lesson-2", "Физика", "teacher-2", timeSlot2, room, 3);

    testSchedule = new Schedule(
      "schedule-1",
      "10-А",
      new Date("2026-11-03"),
      [lesson1, lesson2],
      new Date("2026-11-01")
    );

    await scheduleRepo.save(testSchedule);
  });

  it("should successfully remove a lesson from a schedule", async () => {
    const result = await useCase.execute({
      scheduleId: "schedule-1",
      lessonId: "lesson-1",
    });

    expect(result.isSuccess).toBe(true);
    const schedule = await scheduleRepo.findById("schedule-1");
    expect(schedule?.lessons.length).toBe(1);
    expect(schedule?.lessons[0].id).toBe("lesson-2");
  });

  it("should fail if schedule does not exist", async () => {
    const result = await useCase.execute({
      scheduleId: "non-existent-sched",
      lessonId: "lesson-1",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toMatch(/Schedule not found/i);
  });

  it("should fail if lesson is not found in schedule", async () => {
    const result = await useCase.execute({
      scheduleId: "schedule-1",
      lessonId: "non-existent-lesson",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toMatch(/Lesson not found/i);
  });
});
