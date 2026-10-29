const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function seedCanteenSimple() {
  const client = await pool.connect();

  try {
    console.log('Seeding canteen menu...');

    // Breakfast
    await client.query(`
      INSERT INTO canteen_menu (id, date, meal_type, is_active)
      VALUES ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'BREAKFAST', true)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
      VALUES
        ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Овсяная каша', 'Классическая овсяная каша на молоке с медом', 'BREAKFAST', 250, 8.5, 45.0, 5.0, 300, 120.00, true, false, ARRAY['молоко', 'глютен']::text[], 1),
        ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Омлет с сыром', 'Воздушный омлет с сыром чеддер', 'BREAKFAST', 320, 18.0, 5.0, 24.0, 200, 150.00, true, false, ARRAY['яйца', 'молоко']::text[], 2)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Breakfast added');

    // Lunch
    await client.query(`
      INSERT INTO canteen_menu (id, date, meal_type, is_active)
      VALUES ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'LUNCH', true)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
      VALUES
        ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Борщ украинский', 'Традиционный борщ со сметаной', 'LUNCH', 180, 8.0, 18.0, 9.0, 350, 160.00, false, false, ARRAY['молоко']::text[], 1),
        ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Куриная грудка гриль', 'Сочная куриная грудка с овощами гриль', 'LUNCH', 320, 42.0, 8.0, 12.0, 300, 280.00, false, false, ARRAY[]::text[], 2),
        ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Рис с овощами', 'Отварной рис с тушеными овощами', 'LUNCH', 220, 5.0, 45.0, 3.0, 250, 140.00, true, true, ARRAY[]::text[], 3)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Lunch added');

    // Dinner
    await client.query(`
      INSERT INTO canteen_menu (id, date, meal_type, is_active)
      VALUES ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 'DINNER', true)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
      VALUES
        ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Рыба запеченная', 'Филе трески запеченное с лимоном', 'DINNER', 240, 28.0, 2.0, 12.0, 250, 260.00, false, false, ARRAY['рыба']::text[], 1),
        ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Овощное рагу', 'Тушеные овощи с зеленью', 'DINNER', 150, 4.0, 28.0, 4.0, 300, 140.00, true, true, ARRAY[]::text[], 2)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Dinner added');

    console.log('\n✓ Canteen menu seeded successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCanteenSimple();
