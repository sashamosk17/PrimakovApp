const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function createStoryViews() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS story_views (
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (story_id, user_id)
      )
    `);
    console.log('✓ story_views table created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id)
    `);
    console.log('✓ Indexes created');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createStoryViews();
