const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function checkMigrations() {
  try {
    // Check table names
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE '%migration%'
    `);
    console.log('Migration tables:', tables.rows);

    if (tables.rows.length > 0) {
      const tableName = tables.rows[0].table_name;
      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY executed_at`);
      console.log('\nMigrations:');
      result.rows.forEach(row => console.log(row));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMigrations();
