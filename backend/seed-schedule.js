/**
 * Seed script: добавляет расписание на 4 недели для всех студентов
 * Использует реальные user_id из БД и teacher_id учителей
 */
const { Pool } = require('pg');
const { randomUUID: uuidv4 } = require('crypto');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Реальные ID из БД
const USERS = {
  ivan:    '3aa329de-750d-43f1-b19c-7b8dafeb522d', // ivan.petrov
  maria:   '5a5c19fb-aecf-4df7-a4a2-d83311cc6299', // maria.sokolova
  aleksei: '67b8da59-6eaf-439e-b2c3-fa9583cd53c8', // aleksei.smirnov
};

const TEACHERS = {
  ivanov:  '74ce600f-8955-40a5-a64d-cfb112d1abf1', // teacher.ivanov
  sidorov: '53e8516d-6669-48c3-9898-6882754c172e', // teacher.sidorov
};

// Шаблон расписания по дням недели (1=пн, 2=вт, ..., 6=сб)
// Для Ивана и Марии (одна группа 10A)
const SCHEDULE_10A = {
  1: [ // Понедельник
    { subject: 'Математика',      teacher: TEACHERS.ivanov,  start: '09:00', end: '09:45', room: '305', building: 'A', floor: 3, hw: true },
    { subject: 'Русский язык',    teacher: TEACHERS.sidorov, start: '10:00', end: '10:45', room: '201', building: 'A', floor: 2, hw: false },
    { subject: 'История',         teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '404', building: 'A', floor: 4, hw: false },
    { subject: 'Физика',          teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '102', building: 'A', floor: 1, hw: true },
    { subject: 'Информатика',     teacher: TEACHERS.ivanov,  start: '13:45', end: '14:30', room: '501', building: 'A', floor: 5, hw: false },
  ],
  2: [ // Вторник
    { subject: 'Английский язык', teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '303', building: 'A', floor: 3, hw: true },
    { subject: 'Математика',      teacher: TEACHERS.ivanov,  start: '10:00', end: '10:45', room: '305', building: 'A', floor: 3, hw: false },
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '11:00', end: '11:45', room: '103', building: 'A', floor: 1, hw: false },
    { subject: 'Литература',      teacher: TEACHERS.ivanov,  start: '12:45', end: '13:30', room: '202', building: 'A', floor: 2, hw: true },
    { subject: 'Физкультура',     teacher: TEACHERS.sidorov, start: '13:45', end: '14:30', room: 'Спортзал', building: 'A', floor: 1, hw: false },
  ],
  3: [ // Среда
    { subject: 'Физика',          teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '102', building: 'A', floor: 1, hw: false },
    { subject: 'История',         teacher: TEACHERS.ivanov,  start: '10:00', end: '10:45', room: '404', building: 'A', floor: 4, hw: true },
    { subject: 'Математика',      teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '305', building: 'A', floor: 3, hw: false },
    { subject: 'Русский язык',    teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '201', building: 'A', floor: 2, hw: true },
    { subject: 'Английский язык', teacher: TEACHERS.sidorov, start: '13:45', end: '14:30', room: '303', building: 'A', floor: 3, hw: false },
  ],
  4: [ // Четверг
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '103', building: 'A', floor: 1, hw: true },
    { subject: 'Литература',      teacher: TEACHERS.ivanov,  start: '10:00', end: '10:45', room: '202', building: 'A', floor: 2, hw: false },
    { subject: 'Информатика',     teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '501', building: 'A', floor: 5, hw: true },
    { subject: 'Физика',          teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '102', building: 'A', floor: 1, hw: false },
    { subject: 'Математика',      teacher: TEACHERS.ivanov,  start: '13:45', end: '14:30', room: '305', building: 'A', floor: 3, hw: true },
  ],
  5: [ // Пятница
    { subject: 'Русский язык',    teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '201', building: 'A', floor: 2, hw: false },
    { subject: 'Английский язык', teacher: TEACHERS.sidorov, start: '10:00', end: '10:45', room: '303', building: 'A', floor: 3, hw: true },
    { subject: 'История',         teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '404', building: 'A', floor: 4, hw: false },
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '103', building: 'A', floor: 1, hw: false },
    { subject: 'Литература',      teacher: TEACHERS.ivanov,  start: '13:45', end: '14:30', room: '202', building: 'A', floor: 2, hw: true },
  ],
  6: [ // Суббота
    { subject: 'Математика',      teacher: TEACHERS.ivanov,  start: '09:00', end: '09:45', room: '305', building: 'A', floor: 3, hw: false },
    { subject: 'Физкультура',     teacher: TEACHERS.sidorov, start: '10:00', end: '10:45', room: 'Спортзал', building: 'A', floor: 1, hw: false },
    { subject: 'Информатика',     teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '501', building: 'A', floor: 5, hw: true },
  ],
};

// Для Алексея (группа 11B) — другое расписание
const SCHEDULE_11B = {
  1: [
    { subject: 'Алгебра',         teacher: TEACHERS.ivanov,  start: '09:00', end: '09:45', room: '306', building: 'A', floor: 3, hw: true },
    { subject: 'Биология',        teacher: TEACHERS.sidorov, start: '10:00', end: '10:45', room: '205', building: 'A', floor: 2, hw: false },
    { subject: 'Обществознание',  teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '401', building: 'A', floor: 4, hw: true },
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '103', building: 'A', floor: 1, hw: false },
    { subject: 'Английский язык', teacher: TEACHERS.ivanov,  start: '13:45', end: '14:30', room: '303', building: 'A', floor: 3, hw: true },
  ],
  2: [
    { subject: 'Алгебра',         teacher: TEACHERS.ivanov,  start: '09:00', end: '09:45', room: '306', building: 'A', floor: 3, hw: false },
    { subject: 'Физика',          teacher: TEACHERS.sidorov, start: '10:00', end: '10:45', room: '102', building: 'A', floor: 1, hw: true },
    { subject: 'Биология',        teacher: TEACHERS.sidorov, start: '11:00', end: '11:45', room: '205', building: 'A', floor: 2, hw: false },
    { subject: 'Литература',      teacher: TEACHERS.ivanov,  start: '12:45', end: '13:30', room: '202', building: 'A', floor: 2, hw: true },
    { subject: 'Физкультура',     teacher: TEACHERS.sidorov, start: '13:45', end: '14:30', room: 'Спортзал', building: 'A', floor: 1, hw: false },
  ],
  3: [
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '103', building: 'A', floor: 1, hw: false },
    { subject: 'Обществознание',  teacher: TEACHERS.ivanov,  start: '10:00', end: '10:45', room: '401', building: 'A', floor: 4, hw: true },
    { subject: 'Алгебра',         teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '306', building: 'A', floor: 3, hw: false },
    { subject: 'Английский язык', teacher: TEACHERS.ivanov,  start: '12:45', end: '13:30', room: '303', building: 'A', floor: 3, hw: true },
    { subject: 'Физика',          teacher: TEACHERS.sidorov, start: '13:45', end: '14:30', room: '102', building: 'A', floor: 1, hw: false },
  ],
  4: [
    { subject: 'Биология',        teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '205', building: 'A', floor: 2, hw: true },
    { subject: 'Литература',      teacher: TEACHERS.ivanov,  start: '10:00', end: '10:45', room: '202', building: 'A', floor: 2, hw: false },
    { subject: 'Алгебра',         teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '306', building: 'A', floor: 3, hw: true },
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '103', building: 'A', floor: 1, hw: false },
    { subject: 'Обществознание',  teacher: TEACHERS.ivanov,  start: '13:45', end: '14:30', room: '401', building: 'A', floor: 4, hw: true },
  ],
  5: [
    { subject: 'Физика',          teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '102', building: 'A', floor: 1, hw: false },
    { subject: 'Английский язык', teacher: TEACHERS.ivanov,  start: '10:00', end: '10:45', room: '303', building: 'A', floor: 3, hw: true },
    { subject: 'Литература',      teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '202', building: 'A', floor: 2, hw: false },
    { subject: 'Биология',        teacher: TEACHERS.sidorov, start: '12:45', end: '13:30', room: '205', building: 'A', floor: 2, hw: false },
    { subject: 'Алгебра',         teacher: TEACHERS.ivanov,  start: '13:45', end: '14:30', room: '306', building: 'A', floor: 3, hw: true },
  ],
  6: [
    { subject: 'Химия',           teacher: TEACHERS.sidorov, start: '09:00', end: '09:45', room: '103', building: 'A', floor: 1, hw: false },
    { subject: 'Физкультура',     teacher: TEACHERS.sidorov, start: '10:00', end: '10:45', room: 'Спортзал', building: 'A', floor: 1, hw: false },
    { subject: 'Обществознание',  teacher: TEACHERS.ivanov,  start: '11:00', end: '11:45', room: '401', building: 'A', floor: 4, hw: true },
  ],
};

const USER_SCHEDULES = [
  { userId: USERS.ivan,    schedule: SCHEDULE_10A },
  { userId: USERS.maria,   schedule: SCHEDULE_10A },
  { userId: USERS.aleksei, schedule: SCHEDULE_11B },
];

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const now = new Date();
    // Генерируем расписание на -1 до +3 недели от текущей
    const weekOffsets = [-1, 0, 1, 2, 3];
    let scheduleCount = 0;
    let lessonCount = 0;

    for (const { userId, schedule } of USER_SCHEDULES) {
      for (const weekOffset of weekOffsets) {
        const monday = getMondayOfWeek(now);
        monday.setDate(monday.getDate() + weekOffset * 7);

        for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
          const dayOfWeek = dayIdx + 1; // 1=пн, 6=сб
          const lessons = schedule[dayOfWeek];
          if (!lessons || lessons.length === 0) continue;

          const date = new Date(monday);
          date.setDate(monday.getDate() + dayIdx);
          // Форматируем дату как YYYY-MM-DD в локальном времени
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;

          // Проверяем, нет ли уже расписания для этого пользователя на эту дату
          const existing = await client.query(
            'SELECT id FROM schedules WHERE user_id = $1 AND date = $2',
            [userId, dateStr]
          );
          if (existing.rows.length > 0) {
            // Удаляем старое (cascade удалит уроки)
            await client.query('DELETE FROM schedules WHERE user_id = $1 AND date = $2', [userId, dateStr]);
          }

          const scheduleId = uuidv4();
          await client.query(
            'INSERT INTO schedules (id, user_id, group_id, date, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
            [scheduleId, userId, null, dateStr]
          );
          scheduleCount++;

          for (const lesson of lessons) {
            const lessonId = uuidv4();
            await client.query(
              `INSERT INTO lessons (id, schedule_id, subject, teacher_id, start_time, end_time, room_number, room_building, floor, has_homework, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
              [lessonId, scheduleId, lesson.subject, lesson.teacher, lesson.start, lesson.end, lesson.room, lesson.building, lesson.floor, lesson.hw]
            );
            lessonCount++;
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Seed complete: ${scheduleCount} schedules, ${lessonCount} lessons added`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', e.message);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
