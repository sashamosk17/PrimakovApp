const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakov'
});

async function runMigration() {
  try {
    console.log('🔄 Running migration 003_vision_features.sql...\n');

    const migrationPath = path.join(__dirname, 'migrations', '003_vision_features.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migration 003_vision_features.sql completed successfully!\n');

    // Проверим созданные таблицы
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('rooms', 'requests', 'canteen_menu', 'menu_items')
      ORDER BY tablename
    `);

    console.log('📊 New tables created:');
    tables.rows.forEach(row => console.log(`   ✓ ${row.tablename}`));

    await pool.end();
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    process.exit(1);
  }
}

runMigration();
