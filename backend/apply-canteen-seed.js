const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
});

async function seedCanteen() {
  const client = await pool.connect();

  try {
    console.log('Starting canteen menu seed...');

    // Insert breakfast menu
    await client.query(`
      INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
      VALUES ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'BREAKFAST', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Breakfast menu created');

    // Insert breakfast items (one by one to avoid timeout)
    const breakfastItems = [
      ['660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Овсяная каша', 'Классическая овсяная каша на молоке с медом', 'BREAKFAST', 250, 8.5, 45.0, 5.0, 300, 120.00, true, false, ['молоко', 'глютен'], 1],
      ['660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Омлет с сыром', 'Воздушный омлет с сыром чеддер', 'BREAKFAST', 320, 18.0, 5.0, 24.0, 200, 150.00, true, false, ['яйца', 'молоко'], 2],
      ['660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Блины с вареньем', 'Тонкие блины с клубничным вареньем', 'BREAKFAST', 280, 6.0, 52.0, 8.0, 250, 130.00, true, false, ['глютен', 'яйца', 'молоко'], 3],
      ['660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Йогурт с гранолой', 'Натуральный йогурт с домашней гранолой и ягодами', 'BREAKFAST', 180, 8.0, 28.0, 4.5, 200, 140.00, true, false, ['молоко', 'орехи'], 4],
    ];

    for (const item of breakfastItems) {
      await client.query(`
        INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
      `, item);
      console.log(`✓ Added: ${item[2]}`);
    }

    // Mark migration as complete
    await client.query(`
      INSERT INTO migrations (name, executed_at)
      VALUES ('010_SeedCanteenMenu.sql', CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
    `);
    console.log('\n✓ Migration 010 marked as complete');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCanteen();
