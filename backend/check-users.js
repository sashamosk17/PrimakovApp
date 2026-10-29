const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakov'
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, first_name, last_name, role, created_at FROM users LIMIT 5');
    console.log('Users in database:');
    console.table(result.rows);

    const count = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\nTotal users: ${count.rows[0].count}`);

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
