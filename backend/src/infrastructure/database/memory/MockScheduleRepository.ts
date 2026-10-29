import { IScheduleRepository } from "../../../domain/repositories/IScheduleRepository";
import { Result } from "../../../shared/Result";
import { Schedule } from "../../../domain/entities/Schedule";
import { Lesson } from "../../../domain/entities/Lesson";
import { TimeSlot } from "../../../domain/value-objects/TimeSlot";
import { Room } from "../../../domain/value-objects/Room";

// Маппинг userId → groupId
const USER_GROUP_MAP: Record<string, string> = {
  "user-1": "10A",
  "user-2": "10A",
  "user-3": "11B",
  "teacher-1": "teacher",
  "teacher-2": "teacher",
  "admin-1": "admin",
};

interface LessonDef {
  id: string;
  subject: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  building: string;
  floor: number;
  hasHomework: boolean;
}

// Расписание для 10A (пн-сб)
const SCHEDULE_10A: LessonDef[][] = [
  // Понедельник
  [
    { id: "10a-mon-1", subject: "Математика", teacherId: "teacher-1", startTime: "09:00", endTime: "09:45", roomNumber: "305", building: "A", floor: 3, hasHomework: true },
    { id: "10a-mon-2", subject: "Русский язык", teacherId: "teacher-2", startTime: "10:00", endTime: "10:45", roomNumber: "201", building: "A", floor: 2, hasHomework: false },
    { id: "10a-mon-3", subject: "История", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "404", building: "A", floor: 4, hasHomework: false },
    { id: "10a-mon-4", subject: "Физика", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "102", building: "A", floor: 1, hasHomework: true },
    { id: "10a-mon-5", subject: "Информатика", teacherId: "teacher-1", startTime: "13:45", endTime: "14:30", roomNumber: "501", building: "A", floor: 5, hasHomework: false },
  ],
  // Вторник
  [
    { id: "10a-tue-1", subject: "Английский язык", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "303", building: "A", floor: 3, hasHomework: true },
    { id: "10a-tue-2", subject: "Математика", teacherId: "teacher-1", startTime: "10:00", endTime: "10:45", roomNumber: "305", building: "A", floor: 3, hasHomework: false },
    { id: "10a-tue-3", subject: "Химия", teacherId: "teacher-2", startTime: "11:00", endTime: "11:45", roomNumber: "103", building: "A", floor: 1, hasHomework: false },
    { id: "10a-tue-4", subject: "Литература", teacherId: "teacher-1", startTime: "12:45", endTime: "13:30", roomNumber: "202", building: "A", floor: 2, hasHomework: true },
    { id: "10a-tue-5", subject: "Физкультура", teacherId: "teacher-2", startTime: "13:45", endTime: "14:30", roomNumber: "спортзал", building: "A", floor: 1, hasHomework: false },
  ],
  // Среда
  [
    { id: "10a-wed-1", subject: "Физика", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "102", building: "A", floor: 1, hasHomework: false },
    { id: "10a-wed-2", subject: "История", teacherId: "teacher-1", startTime: "10:00", endTime: "10:45", roomNumber: "404", building: "A", floor: 4, hasHomework: true },
    { id: "10a-wed-3", subject: "Математика", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "305", building: "A", floor: 3, hasHomework: false },
    { id: "10a-wed-4", subject: "Русский язык", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "201", building: "A", floor: 2, hasHomework: true },
    { id: "10a-wed-5", subject: "Английский язык", teacherId: "teacher-2", startTime: "13:45", endTime: "14:30", roomNumber: "303", building: "A", floor: 3, hasHomework: false },
  ],
  // Четверг
  [
    { id: "10a-thu-1", subject: "Химия", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "103", building: "A", floor: 1, hasHomework: true },
    { id: "10a-thu-2", subject: "Литература", teacherId: "teacher-1", startTime: "10:00", endTime: "10:45", roomNumber: "202", building: "A", floor: 2, hasHomework: false },
    { id: "10a-thu-3", subject: "Информатика", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "501", building: "A", floor: 5, hasHomework: true },
    { id: "10a-thu-4", subject: "Физика", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "102", building: "A", floor: 1, hasHomework: false },
    { id: "10a-thu-5", subject: "Математика", teacherId: "teacher-1", startTime: "13:45", endTime: "14:30", roomNumber: "305", building: "A", floor: 3, hasHomework: true },
  ],
  // Пятница
  [
    { id: "10a-fri-1", subject: "Русский язык", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "201", building: "A", floor: 2, hasHomework: false },
    { id: "10a-fri-2", subject: "Английский язык", teacherId: "teacher-2", startTime: "10:00", endTime: "10:45", roomNumber: "303", building: "A", floor: 3, hasHomework: true },
    { id: "10a-fri-3", subject: "История", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "404", building: "A", floor: 4, hasHomework: false },
    { id: "10a-fri-4", subject: "Химия", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "103", building: "A", floor: 1, hasHomework: false },
    { id: "10a-fri-5", subject: "Литература", teacherId: "teacher-1", startTime: "13:45", endTime: "14:30", roomNumber: "202", building: "A", floor: 2, hasHomework: true },
  ],
  // Суббота
  [
    { id: "10a-sat-1", subject: "Математика", teacherId: "teacher-1", startTime: "09:00", endTime: "09:45", roomNumber: "305", building: "A", floor: 3, hasHomework: false },
    { id: "10a-sat-2", subject: "Физкультура", teacherId: "teacher-2", startTime: "10:00", endTime: "10:45", roomNumber: "спортзал", building: "A", floor: 1, hasHomework: false },
    { id: "10a-sat-3", subject: "Информатика", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "501", building: "A", floor: 5, hasHomework: true },
  ],
];

// Расписание для 11B
const SCHEDULE_11B: LessonDef[][] = [
  // Понедельник
  [
    { id: "11b-mon-1", subject: "Алгебра", teacherId: "teacher-1", startTime: "09:00", endTime: "09:45", roomNumber: "306", building: "A", floor: 3, hasHomework: true },
    { id: "11b-mon-2", subject: "Биология", teacherId: "teacher-2", startTime: "10:00", endTime: "10:45", roomNumber: "205", building: "A", floor: 2, hasHomework: false },
    { id: "11b-mon-3", subject: "Обществознание", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "401", building: "A", floor: 4, hasHomework: true },
    { id: "11b-mon-4", subject: "Химия", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "103", building: "A", floor: 1, hasHomework: false },
    { id: "11b-mon-5", subject: "Английский язык", teacherId: "teacher-1", startTime: "13:45", endTime: "14:30", roomNumber: "303", building: "A", floor: 3, hasHomework: true },
  ],
  // Вторник
  [
    { id: "11b-tue-1", subject: "Алгебра", teacherId: "teacher-1", startTime: "09:00", endTime: "09:45", roomNumber: "306", building: "A", floor: 3, hasHomework: false },
    { id: "11b-tue-2", subject: "Физика", teacherId: "teacher-2", startTime: "10:00", endTime: "10:45", roomNumber: "102", building: "A", floor: 1, hasHomework: true },
    { id: "11b-tue-3", subject: "Биология", teacherId: "teacher-2", startTime: "11:00", endTime: "11:45", roomNumber: "205", building: "A", floor: 2, hasHomework: false },
    { id: "11b-tue-4", subject: "Литература", teacherId: "teacher-1", startTime: "12:45", endTime: "13:30", roomNumber: "202", building: "A", floor: 2, hasHomework: true },
    { id: "11b-tue-5", subject: "Физкультура", teacherId: "teacher-2", startTime: "13:45", endTime: "14:30", roomNumber: "спортзал", building: "A", floor: 1, hasHomework: false },
  ],
  // Среда
  [
    { id: "11b-wed-1", subject: "Химия", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "103", building: "A", floor: 1, hasHomework: false },
    { id: "11b-wed-2", subject: "Обществознание", teacherId: "teacher-1", startTime: "10:00", endTime: "10:45", roomNumber: "401", building: "A", floor: 4, hasHomework: true },
    { id: "11b-wed-3", subject: "Алгебра", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "306", building: "A", floor: 3, hasHomework: false },
    { id: "11b-wed-4", subject: "Английский язык", teacherId: "teacher-1", startTime: "12:45", endTime: "13:30", roomNumber: "303", building: "A", floor: 3, hasHomework: true },
    { id: "11b-wed-5", subject: "Физика", teacherId: "teacher-2", startTime: "13:45", endTime: "14:30", roomNumber: "102", building: "A", floor: 1, hasHomework: false },
  ],
  // Четверг
  [
    { id: "11b-thu-1", subject: "Биология", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "205", building: "A", floor: 2, hasHomework: true },
    { id: "11b-thu-2", subject: "Литература", teacherId: "teacher-1", startTime: "10:00", endTime: "10:45", roomNumber: "202", building: "A", floor: 2, hasHomework: false },
    { id: "11b-thu-3", subject: "Алгебра", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "306", building: "A", floor: 3, hasHomework: true },
    { id: "11b-thu-4", subject: "Химия", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "103", building: "A", floor: 1, hasHomework: false },
    { id: "11b-thu-5", subject: "Обществознание", teacherId: "teacher-1", startTime: "13:45", endTime: "14:30", roomNumber: "401", building: "A", floor: 4, hasHomework: true },
  ],
  // Пятница
  [
    { id: "11b-fri-1", subject: "Физика", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "102", building: "A", floor: 1, hasHomework: false },
    { id: "11b-fri-2", subject: "Английский язык", teacherId: "teacher-1", startTime: "10:00", endTime: "10:45", roomNumber: "303", building: "A", floor: 3, hasHomework: true },
    { id: "11b-fri-3", subject: "Литература", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "202", building: "A", floor: 2, hasHomework: false },
    { id: "11b-fri-4", subject: "Биология", teacherId: "teacher-2", startTime: "12:45", endTime: "13:30", roomNumber: "205", building: "A", floor: 2, hasHomework: false },
    { id: "11b-fri-5", subject: "Алгебра", teacherId: "teacher-1", startTime: "13:45", endTime: "14:30", roomNumber: "306", building: "A", floor: 3, hasHomework: true },
  ],
  // Суббота
  [
    { id: "11b-sat-1", subject: "Химия", teacherId: "teacher-2", startTime: "09:00", endTime: "09:45", roomNumber: "103", building: "A", floor: 1, hasHomework: false },
    { id: "11b-sat-2", subject: "Физкультура", teacherId: "teacher-2", startTime: "10:00", endTime: "10:45", roomNumber: "спортзал", building: "A", floor: 1, hasHomework: false },
    { id: "11b-sat-3", subject: "Обществознание", teacherId: "teacher-1", startTime: "11:00", endTime: "11:45", roomNumber: "401", building: "A", floor: 4, hasHomework: true },
  ],
];

// Маппинг groupId → шаблон расписания (по дням недели 0=пн, 5=сб)
const GROUP_SCHEDULE_MAP: Record<string, LessonDef[][]> = {
  "10A": SCHEDULE_10A,
  "11B": SCHEDULE_11B,
};

function buildLesson(def: LessonDef): Lesson {
  const timeSlot = TimeSlot.create(def.startTime, def.endTime).value!;
  const room = Room.create(def.roomNumber, def.building, def.floor).value!;
  return new Lesson(def.id, def.subject, def.teacherId, timeSlot, room, def.floor, def.hasHomework);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=вс, 1=пн, ...
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class MockScheduleRepository implements IScheduleRepository {
  private schedules: Schedule[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();
    // Генерируем расписание на 4 недели: -1, 0, +1, +2
    for (let weekOffset = -1; weekOffset <= 2; weekOffset++) {
      const weekStart = getMondayOfWeek(now);
      weekStart.setDate(weekStart.getDate() + weekOffset * 7);

      for (const [groupId, schedule] of Object.entries(GROUP_SCHEDULE_MAP)) {
        for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
          const lessonDefs = schedule[dayIdx];
          if (!lessonDefs || lessonDefs.length === 0) continue;

          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + dayIdx);
          date.setHours(0, 0, 0, 0);

          // Уникальные id уроков с учётом недели
          const lessons = lessonDefs.map((def) => {
            const uniqueDef = { ...def, id: `${def.id}-w${weekOffset}` };
            return buildLesson(uniqueDef);
          });

          const schedule_ = new Schedule(
            `schedule-${groupId}-${date.toISOString().split("T")[0]}`,
            groupId,
            date,
            lessons,
            new Date()
          );
          this.schedules.push(schedule_);
        }
      }
    }
  }

  async getScheduleByGroup(groupId: string): Promise<Result<Schedule | null>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const schedule = this.schedules.find(
      (s) => s.groupId === groupId && s.date.toDateString() === today.toDateString()
    ) || this.schedules.find((s) => s.groupId === groupId) || null;
    return Result.ok(schedule);
  }

  async getScheduleByDate(groupId: string, date: Date): Promise<Result<Schedule | null>> {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const schedule =
      this.schedules.find(
        (s) => s.groupId === groupId && s.date.toDateString() === target.toDateString()
      ) || null;
    return Result.ok(schedule);
  }

  async getScheduleByUserId(userId: string, date: Date): Promise<Result<Schedule | null>> {
    const groupId = USER_GROUP_MAP[userId];
    if (!groupId) return Result.ok(null);
    return this.getScheduleByDate(groupId, date);
  }

  async save(schedule: Schedule): Promise<Result<void>> {
    const existingIndex = this.schedules.findIndex(
      (s) => s.id === schedule.id
    );
    if (existingIndex >= 0) {
      this.schedules[existingIndex] = schedule;
    } else {
      this.schedules.push(schedule);
    }
    return Result.ok();
  }
}
