const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function killBlockingProcesses() {
  try {
    // Kill the idle in transaction
    await pool.query('SELECT pg_terminate_backend(1058532)');
    console.log('✓ Killed idle transaction (1058532)');

    // Kill migration lock holder
    await pool.query('SELECT pg_terminate_backend(1058540)');
    console.log('✓ Killed migration lock holder (1058540)');

    // Kill other active inserts
    await pool.query('SELECT pg_terminate_backend(1058693)');
    await pool.query('SELECT pg_terminate_backend(1058547)');
    await pool.query('SELECT pg_terminate_backend(1058615)');
    console.log('✓ Killed other blocking processes');

    console.log('\n✓ All blocking processes terminated');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

killBlockingProcesses();
