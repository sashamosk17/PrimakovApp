const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
  connectionTimeoutMillis: 5000,
});

async function markComplete() {
  try {
    await pool.query(`
      INSERT INTO migrations (name, executed_at)
      VALUES ('010_SeedCanteenMenu.sql', CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Migration 010 marked as complete (skipped)');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

markComplete();
