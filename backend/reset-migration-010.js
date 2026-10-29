const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function resetMigration() {
  try {
    // Delete migration record for 010
    await pool.query(
      "DELETE FROM schema_migrations WHERE name = '010_SeedCanteenMenu.sql'"
    );
    console.log('✓ Migration 010 status reset');

    // Check current migrations
    const result = await pool.query(
      'SELECT name, executed_at FROM schema_migrations ORDER BY executed_at'
    );
    console.log('\nCurrent migrations:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.executed_at})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetMigration();
