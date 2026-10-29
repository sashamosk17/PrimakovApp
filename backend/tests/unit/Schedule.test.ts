import { Schedule } from "../../src/domain/entities/Schedule";
import { Lesson } from "../../src/domain/entities/Lesson";
import { TimeSlot } from "../../src/domain/value-objects/TimeSlot";
import { Room } from "../../src/domain/value-objects/Room";

function makeTimeSlot(start: string, end: string): TimeSlot {
  const result = TimeSlot.create(start, end);
  if (result.isFailure) throw new Error(`Invalid time slot: ${start}-${end}`);
  return result.value;
}

function makeRoom(number = "101", building = "A", floor = 1): Room {
  const result = Room.create(number, building, floor);
  if (result.isFailure) throw new Error("Invalid room");
  return result.value;
}

function makeLesson(overrides: Partial<{
  id: string;
  subject: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  floor: number;
  hasHomework: boolean;
}> = {}): Lesson {
  return new Lesson(
    overrides.id ?? "lesson-1",
    overrides.subject ?? "Математика",
    overrides.teacherId ?? "teacher-1",
    makeTimeSlot(overrides.startTime ?? "09:00", overrides.endTime ?? "09:45"),
    makeRoom(),
    overrides.floor ?? 1,
    overrides.hasHomework ?? false
  );
}

function makeSchedule(lessons: Lesson[] = []): Schedule {
  return new Schedule(
    "schedule-1",
    "10A",
    new Date(),
    lessons,
    new Date()
  );
}

// ───────────────────────────────────────────
// TimeSlot Value Object
// ───────────────────────────────────────────
describe("TimeSlot Value Object", () => {
  describe("create()", () => {
    it("должен создать корректный временной слот", () => {
      const result = TimeSlot.create("09:00", "09:45");

      expect(result.isSuccess).toBe(true);
      expect(result.value.startTime).toBe("09:00");
      expect(result.value.endTime).toBe("09:45");
    });

    it("должен вернуть ошибку при пустом startTime", () => {
      const result = TimeSlot.create("", "09:45");
      expect(result.isFailure).toBe(true);
    });

    it("должен вернуть ошибку при пустом endTime", () => {
      const result = TimeSlot.create("09:00", "");
      expect(result.isFailure).toBe(true);
    });
  });

  describe("durationMinutes()", () => {
    it("должен вычислить продолжительность 45 минут", () => {
      const slot = makeTimeSlot("09:00", "09:45");
      expect(slot.durationMinutes()).toBe(45);
    });

    it("должен вычислить продолжительность 90 минут", () => {
      const slot = makeTimeSlot("10:00", "11:30");
      expect(slot.durationMinutes()).toBe(90);
    });

    it("должен вычислить продолжительность 60 минут", () => {
      const slot = makeTimeSlot("08:00", "09:00");
      expect(slot.durationMinutes()).toBe(60);
    });
  });

  describe("overlaps()", () => {
    it("должен обнаружить наложение двух слотов", () => {
      const slot1 = makeTimeSlot("09:00", "09:45");
      const slot2 = makeTimeSlot("09:30", "10:15");

      expect(slot1.overlaps(slot2)).toBe(true);
      expect(slot2.overlaps(slot1)).toBe(true);
    });

    it("должен вернуть false для неперекрывающихся слотов", () => {
      const slot1 = makeTimeSlot("09:00", "09:45");
      const slot2 = makeTimeSlot("10:00", "10:45");

      expect(slot1.overlaps(slot2)).toBe(false);
      expect(slot2.overlaps(slot1)).toBe(false);
    });

    it("должен вернуть false для смежных слотов (конец одного = начало другого)", () => {
      const slot1 = makeTimeSlot("09:00", "09:45");
      const slot2 = makeTimeSlot("09:45", "10:30");

      expect(slot1.overlaps(slot2)).toBe(false);
    });
  });
});

// ───────────────────────────────────────────
// Room Value Object
// ───────────────────────────────────────────
describe("Room Value Object", () => {
  describe("create()", () => {
    it("должен создать корректный кабинет", () => {
      const result = Room.create("301", "B", 3);

      expect(result.isSuccess).toBe(true);
      expect(result.value.number).toBe("301");
      expect(result.value.building).toBe("B");
      expect(result.value.floor).toBe(3);
    });

    it("должен вернуть ошибку при пустом номере", () => {
      const result = Room.create("", "A", 1);
      expect(result.isFailure).toBe(true);
    });

    it("должен вернуть ошибку при пустом корпусе", () => {
      const result = Room.create("101", "", 1);
      expect(result.isFailure).toBe(true);
    });
  });

  describe("fullName()", () => {
    it("должен вернуть полное название кабинета", () => {
      const room = makeRoom("204", "B", 2);
      expect(room.fullName()).toBe("204-B, floor 2");
    });
  });
});

// ───────────────────────────────────────────
// Lesson Entity
// ───────────────────────────────────────────
describe("Lesson Entity", () => {
  describe("getDuration()", () => {
    it("должен вернуть продолжительность урока в минутах", () => {
      const lesson = makeLesson({ startTime: "09:00", endTime: "09:45" });
      expect(lesson.getDuration()).toBe(45);
    });

    it("должен вернуть 90 минут для двойного урока", () => {
      const lesson = makeLesson({ startTime: "10:00", endTime: "11:30" });
      expect(lesson.getDuration()).toBe(90);
    });
  });

  describe("isNow()", () => {
    it("должен возвращать true если сейчас идёт урок", () => {
      const now = new Date();
      const startH = now.getHours();
      const startM = now.getMinutes() - 1; // минута назад
      const endH = now.getHours();
      const endM = now.getMinutes() + 44; // 44 минуты вперёд

      const start = `${String(startH).padStart(2, "0")}:${String(Math.max(startM, 0)).padStart(2, "0")}`;
      const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      const lesson = makeLesson({ startTime: start, endTime: end });
      expect(lesson.isNow()).toBe(true);
    });

    it("должен возвращать false для завтрашнего урока (те же часы не применимы, но слот в прошлом)", () => {
      // Урок полностью в прошлом
      const lesson = makeLesson({ startTime: "01:00", endTime: "01:45" });
      // isNow работает только с текущим временем суток
      // 01:00-01:45 сейчас точно закончился (если тест не в 1 ночи)
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (nowMinutes > 105) {
        // после 1:45
        expect(lesson.isNow()).toBe(false);
      }
    });
  });

  describe("isFinished()", () => {
    it("должен возвращать true для урока который уже закончился", () => {
      // 01:00-01:45 уже точно закончился (тест запускается не в 1 ночи)
      const lesson = makeLesson({ startTime: "01:00", endTime: "01:45" });
      const now = new Date();
      if (now.getHours() * 60 + now.getMinutes() > 105) {
        expect(lesson.isFinished()).toBe(true);
      }
    });

    it("должен возвращать false для урока который ещё не начался", () => {
      // 23:00-23:45 — ночью, скорее всего ещё не было
      const now = new Date();
      if (now.getHours() < 23) {
        const lesson = makeLesson({ startTime: "23:00", endTime: "23:45" });
        expect(lesson.isFinished()).toBe(false);
      }
    });
  });
});

// ───────────────────────────────────────────
// Schedule Entity
// ───────────────────────────────────────────
describe("Schedule Entity", () => {
  describe("isComplete()", () => {
    it("должен вернуть true если есть хотя бы один урок", () => {
      const schedule = makeSchedule([makeLesson()]);
      expect(schedule.isComplete()).toBe(true);
    });

    it("должен вернуть false если уроков нет", () => {
      const schedule = makeSchedule([]);
      expect(schedule.isComplete()).toBe(false);
    });
  });

  describe("getLessonAt()", () => {
    it("должен найти урок в заданный временной слот", () => {
      const lesson = makeLesson({ startTime: "09:00", endTime: "09:45", subject: "Физика" });
      const schedule = makeSchedule([lesson]);

      const found = schedule.getLessonAt(makeTimeSlot("09:10", "09:30"));

      expect(found).not.toBeNull();
      expect(found!.subject).toBe("Физика");
    });

    it("должен вернуть null если в заданный слот нет урока", () => {
      const lesson = makeLesson({ startTime: "09:00", endTime: "09:45" });
      const schedule = makeSchedule([lesson]);

      const found = schedule.getLessonAt(makeTimeSlot("10:00", "10:45"));

      expect(found).toBeNull();
    });
  });

  describe("hasFreeSlot()", () => {
    it("должен вернуть true если слот свободен", () => {
      const lesson = makeLesson({ startTime: "09:00", endTime: "09:45" });
      const schedule = makeSchedule([lesson]);

      expect(schedule.hasFreeSlot(makeTimeSlot("10:00", "10:45"))).toBe(true);
    });

    it("должен вернуть false если слот занят", () => {
      const lesson = makeLesson({ startTime: "09:00", endTime: "09:45" });
      const schedule = makeSchedule([lesson]);

      expect(schedule.hasFreeSlot(makeTimeSlot("09:20", "09:50"))).toBe(false);
    });

    it("должен вернуть true для пустого расписания", () => {
      const schedule = makeSchedule([]);
      expect(schedule.hasFreeSlot(makeTimeSlot("09:00", "09:45"))).toBe(true);
    });
  });
});
