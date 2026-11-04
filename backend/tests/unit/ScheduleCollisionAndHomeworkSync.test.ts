import { MockScheduleRepository } from "../../src/infrastructure/database/memory/MockScheduleRepository";
import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { MockDeadlineRepository } from "../../src/infrastructure/database/memory/MockDeadlineRepository";
import { ScheduleCollisionGuard } from "../../src/domain/services/ScheduleCollisionGuard";
import { SubstituteTeacherUseCase } from "../../src/application/admin/SubstituteTeacherUseCase";
import { AddLessonToScheduleUseCase } from "../../src/application/admin/AddLessonToScheduleUseCase";
import { AutoHomeworkSyncUseCase } from "../../src/application/schedule/AutoHomeworkSyncUseCase";
import { Schedule } from "../../src/domain/entities/Schedule";
import { Lesson } from "../../src/domain/entities/Lesson";
import { TimeSlot } from "../../src/domain/value-objects/TimeSlot";
import { Room } from "../../src/domain/value-objects/Room";
import { Email } from "../../src/domain/value-objects/Email";
import { Password } from "../../src/domain/value-objects/Password";
import { User } from "../../src/domain/entities/User";
import { randomUUID } from "crypto";

describe("Schedule Collision Guard & Auto Homework Sync", () => {
  let scheduleRepo: MockScheduleRepository;
  let userRepo: MockUserRepository;
  let deadlineRepo: MockDeadlineRepository;
  let collisionGuard: ScheduleCollisionGuard;
  let addLessonUseCase: AddLessonToScheduleUseCase;
  let substituteUseCase: SubstituteTeacherUseCase;
  let autoHomeworkSyncUseCase: AutoHomeworkSyncUseCase;

  const testDate = new Date("2026-11-10T00:00:00.000Z");

  beforeEach(() => {
    scheduleRepo = new MockScheduleRepository();
    userRepo = new MockUserRepository();
    deadlineRepo = new MockDeadlineRepository();
    collisionGuard = new ScheduleCollisionGuard();

    addLessonUseCase = new AddLessonToScheduleUseCase(scheduleRepo, collisionGuard);
    substituteUseCase = new SubstituteTeacherUseCase(scheduleRepo, collisionGuard);
    autoHomeworkSyncUseCase = new AutoHomeworkSyncUseCase(scheduleRepo, userRepo, deadlineRepo);
  });

  describe("ScheduleCollisionGuard Domain Service", () => {
    it("detects teacher collision when teacher is already teaching at that time", () => {
      const teacherId = "teacher-101";
      const slot1 = TimeSlot.create("09:00", "09:45").value;
      const slotOverlap = TimeSlot.create("09:30", "10:15").value;
      const room1 = Room.create("301", "A", 3).value;
      const room2 = Room.create("402", "A", 4).value;

      const lesson1 = new Lesson("l-1", "Математика", teacherId, slot1, room1, 3);
      const schedule1 = new Schedule("sch-1", "10-А", testDate, [lesson1], testDate);

      const check = collisionGuard.validate({
        date: testDate,
        timeSlot: slotOverlap,
        teacherId,
        room: room2,
        groupId: "11-Б",
        allSchedules: [schedule1],
      });

      expect(check.isFailure).toBe(true);
      expect(check.error).toContain("TEACHER_COLLISION");
      expect(check.error).toContain("Преподаватель уже ведет урок");
    });

    it("detects room collision when classroom is already occupied at that time", () => {
      const room = Room.create("305", "A", 3).value;
      const slot1 = TimeSlot.create("10:00", "10:45").value;
      const slotOverlap = TimeSlot.create("10:15", "11:00").value;

      const lesson1 = new Lesson("l-1", "Физика", "teacher-A", slot1, room, 3);
      const schedule1 = new Schedule("sch-1", "9-А", testDate, [lesson1], testDate);

      const check = collisionGuard.validate({
        date: testDate,
        timeSlot: slotOverlap,
        teacherId: "teacher-B",
        room,
        groupId: "10-Б",
        allSchedules: [schedule1],
      });

      expect(check.isFailure).toBe(true);
      expect(check.error).toContain("ROOM_COLLISION");
      expect(check.error).toContain("Аудитория 305-A");
    });

    it("detects group collision when class group already has an overlapping lesson", () => {
      const slot1 = TimeSlot.create("11:00", "11:45").value;
      const slotOverlap = TimeSlot.create("11:30", "12:15").value;
      const room1 = Room.create("101", "A", 1).value;
      const room2 = Room.create("102", "A", 1).value;

      const lesson1 = new Lesson("l-1", "Литература", "teacher-1", slot1, room1, 1);
      const schedule1 = new Schedule("sch-1", "10-А", testDate, [lesson1], testDate);

      const check = collisionGuard.validate({
        date: testDate,
        timeSlot: slotOverlap,
        teacherId: "teacher-2",
        room: room2,
        groupId: "10-А",
        allSchedules: [schedule1],
      });

      expect(check.isFailure).toBe(true);
      expect(check.error).toContain("GROUP_COLLISION");
      expect(check.error).toContain("Класс 10-А уже имеет урок");
    });

    it("allows non-overlapping slots on same date with same teacher and room", () => {
      const teacherId = "teacher-101";
      const room = Room.create("301", "A", 3).value;
      const slot1 = TimeSlot.create("09:00", "09:45").value;
      const slot2 = TimeSlot.create("10:00", "10:45").value;

      const lesson1 = new Lesson("l-1", "Математика", teacherId, slot1, room, 3);
      const schedule1 = new Schedule("sch-1", "10-А", testDate, [lesson1], testDate);

      const check = collisionGuard.validate({
        date: testDate,
        timeSlot: slot2,
        teacherId,
        room,
        groupId: "11-Б",
        allSchedules: [schedule1],
      });

      expect(check.isSuccess).toBe(true);
    });

    it("ignores self when excludeLessonId is specified", () => {
      const teacherId = "teacher-101";
      const room = Room.create("301", "A", 3).value;
      const slot1 = TimeSlot.create("09:00", "09:45").value;

      const lesson1 = new Lesson("l-1", "Математика", teacherId, slot1, room, 3);
      const schedule1 = new Schedule("sch-1", "10-А", testDate, [lesson1], testDate);

      const check = collisionGuard.validate({
        date: testDate,
        timeSlot: slot1,
        teacherId,
        room,
        groupId: "10-А",
        excludeLessonId: "l-1",
        allSchedules: [schedule1],
      });

      expect(check.isSuccess).toBe(true);
    });
  });

  describe("AddLessonToScheduleUseCase with Collision Guard", () => {
    it("prevents adding a colliding lesson into the schedule", async () => {
      const existingLesson = new Lesson(
        "ex-1",
        "Информатика",
        "teach-busy",
        TimeSlot.create("09:00", "09:45").value,
        Room.create("501", "A", 5).value,
        5
      );
      const existingSchedule = new Schedule("sch-target", "10-А", testDate, [existingLesson], testDate);
      await scheduleRepo.save(existingSchedule);

      const result = await addLessonUseCase.execute({
        scheduleId: "sch-target",
        subject: "Робототехника",
        teacherId: "teach-free",
        startTime: "09:15",
        endTime: "10:00",
        roomNumber: "502",
        building: "A",
        floor: 5,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("уже имеет урок");
    });
  });

  describe("SubstituteTeacherUseCase with Collision Guard", () => {
    it("blocks substitution if substitute teacher already has another lesson at that time", async () => {
      const busyTeacherId = "busy-teacher-id";
      const timeSlot = TimeSlot.create("10:00", "10:45").value;
      const testDateFuture = new Date("2026-12-15T00:00:00.000Z");

      // Schedule 1: 11-A has lesson taught by busyTeacherId
      const busyLesson = new Lesson("l-busy", "Химия", busyTeacherId, timeSlot, Room.create("103", "A", 1).value, 1);
      const schedule11A = new Schedule("sch-11a", "11-A", testDateFuture, [busyLesson], testDateFuture);
      await scheduleRepo.save(schedule11A);

      // Schedule 2: 10-A has lesson with teacher needing substitute
      const targetLesson = new Lesson("l-sub", "Биология", "sick-teacher", timeSlot, Room.create("204", "A", 2).value, 2);
      const schedule10A = new Schedule("sch-10a", "10-A", testDateFuture, [targetLesson], testDateFuture);
      await scheduleRepo.save(schedule10A);

      const result = await substituteUseCase.execute({
        scheduleId: "sch-10a",
        lessonId: "l-sub",
        newTeacherId: busyTeacherId,
        comment: "Замена",
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Преподаватель уже ведет урок");
    });
  });

  describe("AutoHomeworkSyncUseCase", () => {
    it("automatically creates deadlines for all students in group when homework is assigned", async () => {
      // 2 students in group 10-Ф
      const s1 = new User(
        "student-1",
        Email.create("st1@primakov.school").value,
        Password.create("pass123"),
        "Иван",
        "Иванов",
        "STUDENT",
        new Date(),
        undefined,
        true,
        undefined,
        undefined,
        false,
        undefined,
        "10-Ф"
      );
      const s2 = new User(
        "student-2",
        Email.create("st2@primakov.school").value,
        Password.create("pass123"),
        "Анна",
        "Петрова",
        "STUDENT",
        new Date(),
        undefined,
        true,
        undefined,
        undefined,
        false,
        undefined,
        "10-Ф"
      );
      // Student in 11-Б (should NOT receive deadline)
      const s3 = new User(
        "student-3",
        Email.create("st3@primakov.school").value,
        Password.create("pass123"),
        "Олег",
        "Сидоров",
        "STUDENT",
        new Date(),
        undefined,
        true,
        undefined,
        undefined,
        false,
        undefined,
        "11-Б"
      );

      await userRepo.save(s1);
      await userRepo.save(s2);
      await userRepo.save(s3);

      const syncResult = await autoHomeworkSyncUseCase.execute({
        lessonId: "l-math-1",
        groupId: "10-Ф",
        subject: "Алгебра",
        homeworkDescription: "Параграф 14, номера 14.1-14.8 в тетради",
        lessonDate: testDate,
      });

      expect(syncResult.isSuccess).toBe(true);
      expect(syncResult.value.createdCount).toBe(2);

      const s1Deadlines = (await deadlineRepo.getByUser("student-1")).value;
      const s2Deadlines = (await deadlineRepo.getByUser("student-2")).value;
      const s3Deadlines = (await deadlineRepo.getByUser("student-3")).value;

      expect(s1Deadlines?.length).toBe(1);
      expect(s1Deadlines?.[0].title).toContain("Алгебра");
      expect(s1Deadlines?.[0].description).toBe("Параграф 14, номера 14.1-14.8 в тетради");

      expect(s2Deadlines?.length).toBe(1);
      expect(s3Deadlines?.length).toBe(0);
    });

    it("skips sync cleanly when homework description is empty", async () => {
      const syncResult = await autoHomeworkSyncUseCase.execute({
        lessonId: "l-math-empty",
        groupId: "10-А",
        subject: "Алгебра",
        homeworkDescription: "   ",
        lessonDate: testDate,
      });

      expect(syncResult.isSuccess).toBe(true);
      expect(syncResult.value.createdCount).toBe(0);
    });
  });
});
