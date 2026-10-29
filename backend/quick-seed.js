const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
  connectionTimeoutMillis: 5000,
  query_timeout: 5000,
});

async function quickSeed() {
  try {
    // Just insert one breakfast item to test
    const result = await pool.query(`
      INSERT INTO canteen_menu (id, date, meal_type, is_active)
      VALUES ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'BREAKFAST', true)
      ON CONFLICT (id) DO UPDATE SET is_active = true
      RETURNING id
    `);
    console.log('✓ Menu created:', result.rows[0]);

    const items = await pool.query(`
      INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
      VALUES ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Овсяная каша', 'Классическая овсяная каша', 'BREAKFAST', 250, 8.5, 45.0, 5.0, 300, 120.00, true, false, ARRAY['молоко']::text[], 1)
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);
    console.log('✓ Item added:', items.rows[0]);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

quickSeed();
