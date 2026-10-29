const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function checkLocks() {
  try {
    const locks = await pool.query(`
      SELECT
        pg_class.relname,
        pg_locks.mode,
        pg_locks.granted,
        pg_stat_activity.query,
        pg_stat_activity.state,
        pg_stat_activity.pid
      FROM pg_locks
      JOIN pg_class ON pg_locks.relation = pg_class.oid
      LEFT JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
      WHERE pg_class.relname IN ('canteen_menu', 'menu_items', 'migrations')
    `);

    console.log('Locks on canteen tables:');
    console.log(locks.rows);

    // Check migration lock
    const migLock = await pool.query(`
      SELECT * FROM pg_locks WHERE locktype = 'advisory'
    `);
    console.log('\nAdvisory locks (migration locks):');
    console.log(migLock.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLocks();
