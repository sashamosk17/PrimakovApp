const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function fixImagePaths() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing image paths...');
    
    // Убираем лишний assets/ из пути
    await client.query(`
      UPDATE stories 
      SET image_url = REPLACE(image_url, 'assets/images/', 'images/'),
          updated_at = NOW()
      WHERE image_url LIKE 'assets/images/%'
    `);
    
    console.log('✅ Image paths fixed!');
    
    // Проверяем результат
    const result = await client.query(
      "SELECT id, title, image_url FROM stories WHERE title LIKE '%конференция%' OR title LIKE '%космос%'"
    );
    
    console.log('\n📊 Fixed stories:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.title}`);
      console.log(`    New path: ${row.image_url}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixImagePaths();