const { Pool } = require('pg');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakov'
});

// Предметы и учителя
const subjects = [
  { name: 'Математика', teacherId: '74ce600f-8955-40a5-a64d-cfb112d1abf1' },
  { name: 'Физика', teacherId: '53e8516d-6669-48c3-9898-6882754c172e' },
  { name: 'Химия', teacherId: '74ce600f-8955-40a5-a64d-cfb112d1abf1' },
  { name: 'Литература', teacherId: '53e8516d-6669-48c3-9898-6882754c172e' },
  { name: 'История', teacherId: '74ce600f-8955-40a5-a64d-cfb112d1abf1' },
  { name: 'Английский язык', teacherId: '53e8516d-6669-48c3-9898-6882754c172e' },
  { name: 'Физкультура', teacherId: '74ce600f-8955-40a5-a64d-cfb112d1abf1' },
];

// Студенты
const students = [
  '3aa329de-750d-43f1-b19c-7b8dafeb522d', // Ivan
  '5a5c19fb-aecf-4df7-a4a2-d83311cc6299', // Maria
  '67b8da59-6eaf-439e-b2c3-fa9583cd53c8', // Aleksei
];

// Расписание звонков
const timeSlots = [
  { start: '08:30', end: '09:15' },
  { start: '09:25', end: '10:10' },
  { start: '10:20', end: '11:05' },
  { start: '11:25', end: '12:10' },
  { start: '12:30', end: '13:15' },
  { start: '13:25', end: '14:10' },
  { start: '14:20', end: '15:05' },
];

// Получить даты текущей недели (понедельник-пятница)
function getWeekDates() {
  const dates = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// Получить аудитории из БД
async function getRooms() {
  const result = await pool.query('SELECT id FROM rooms WHERE is_active = true LIMIT 10');
  return result.rows.map(r => r.id);
}

async function seedSchedules() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting schedule seeding...\n');

    const rooms = await getRooms();
    if (rooms.length === 0) {
      console.error('❌ No rooms found in database. Run migration 003_vision_features.sql first.');
      process.exit(1);
    }

    const weekDates = getWeekDates();
    console.log(`📅 Creating schedules for dates: ${weekDates.join(', ')}\n`);

    let totalSchedules = 0;
    let totalLessons = 0;

    // Создаем только для первого студента для теста
    const studentId = students[0];
    console.log(`👤 Creating schedules for student ${studentId.substring(0, 8)}...`);

    for (const date of weekDates) {
      const scheduleId = uuidv4();

      // Создать расписание
      await client.query(
        `INSERT INTO schedules (id, user_id, date, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [scheduleId, studentId, date]
      );

      totalSchedules++;

      // Создать 6 уроков
      const lessonsCount = 6;
      for (let i = 0; i < lessonsCount; i++) {
        const subject = subjects[i % subjects.length];
        const timeSlot = timeSlots[i];
        const roomId = rooms[Math.floor(Math.random() * rooms.length)];

        await client.query(
          `INSERT INTO lessons (id, schedule_id, subject, teacher_id, start_time, end_time, room_id, has_homework, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            uuidv4(),
            scheduleId,
            subject.name,
            subject.teacherId,
            timeSlot.start,
            timeSlot.end,
            roomId,
            Math.random() > 0.5,
          ]
        );

        totalLessons++;
      }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`   📊 Created ${totalSchedules} schedules`);
    console.log(`   📚 Created ${totalLessons} lessons`);
    console.log(`   👥 For 1 student (test)`);
    console.log(`   📅 Across ${weekDates.length} days\n`);

  } catch (error) {
    console.error('❌ Error seeding schedules:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedSchedules();
