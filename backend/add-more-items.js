const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function addMoreItems() {
  try {
    // Add more breakfast items
    await pool.query(`
      INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
      VALUES
        ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Омлет с сыром', 'Воздушный омлет с сыром чеддер', 'BREAKFAST', 320, 18.0, 5.0, 24.0, 200, 150.00, true, false, ARRAY['яйца', 'молоко']::text[], 2),
        ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Блины с вареньем', 'Тонкие блины с клубничным вареньем', 'BREAKFAST', 280, 6.0, 52.0, 8.0, 250, 130.00, true, false, ARRAY['глютен', 'яйца']::text[], 3)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Added more breakfast items');

    // Add lunch menu
    await pool.query(`
      INSERT INTO canteen_menu (id, date, meal_type, is_active)
      VALUES ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'LUNCH', true)
      ON CONFLICT (id) DO NOTHING
    `);

    await pool.query(`
      INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
      VALUES
        ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Борщ украинский', 'Традиционный борщ со сметаной', 'LUNCH', 180, 8.0, 18.0, 9.0, 350, 160.00, false, false, ARRAY['молоко']::text[], 1),
        ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Куриная грудка гриль', 'Сочная куриная грудка с овощами', 'LUNCH', 320, 42.0, 8.0, 12.0, 300, 280.00, false, false, ARRAY[]::text[], 2),
        ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Рис с овощами', 'Отварной рис с тушеными овощами', 'LUNCH', 220, 5.0, 45.0, 3.0, 250, 140.00, true, true, ARRAY[]::text[], 3)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Added lunch menu');

    console.log('\n✓ Canteen menu complete!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

addMoreItems();
