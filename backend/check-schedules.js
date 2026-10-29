const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakov'
});

async function checkSchedules() {
  try {
    const schedules = await pool.query('SELECT COUNT(*) FROM schedules');
    console.log(`Schedules in DB: ${schedules.rows[0].count}`);

    const lessons = await pool.query('SELECT COUNT(*) FROM lessons');
    console.log(`Lessons in DB: ${lessons.rows[0].count}`);

    if (schedules.rows[0].count > 0) {
      const sample = await pool.query('SELECT * FROM schedules LIMIT 3');
      console.log('\nSample schedules:');
      console.table(sample.rows);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchedules();
