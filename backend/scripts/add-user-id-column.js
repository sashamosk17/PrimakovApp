const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakov'
});

async function addUserIdColumn() {
  try {
    console.log('🔄 Adding user_id column to schedules table...\n');

    // Add user_id column
    await pool.query(`
      ALTER TABLE schedules
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    `);

    console.log('✓ user_id column added');

    // Copy data from group_id to user_id (if group_id contains user IDs)
    await pool.query(`
      UPDATE schedules
      SET user_id = group_id::uuid
      WHERE user_id IS NULL AND group_id IS NOT NULL;
    `);

    console.log('✓ Existing data migrated');

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_schedules_user_id_date ON schedules(user_id, date);
    `);

    console.log('✓ Index created');

    console.log('\n✅ Migration completed successfully!\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUserIdColumn();
