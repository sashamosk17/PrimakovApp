const { Pool } = require('pg');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Меню на неделю
const weekMenu = {
  BREAKFAST: [
    { name: 'Овсяная каша', description: 'Классическая овсяная каша на молоке с медом', calories: 250, protein: 8.5, carbs: 45.0, fat: 5.0, weight: 300, price: 120.00, isVegetarian: true, isVegan: false, allergens: ['молоко', 'глютен'] },
    { name: 'Омлет с сыром', description: 'Воздушный омлет с сыром чеддер', calories: 320, protein: 18.0, carbs: 5.0, fat: 24.0, weight: 200, price: 150.00, isVegetarian: true, isVegan: false, allergens: ['яйца', 'молоко'] },
    { name: 'Блины с вареньем', description: 'Тонкие блины с клубничным вареньем', calories: 280, protein: 6.0, carbs: 52.0, fat: 8.0, weight: 250, price: 130.00, isVegetarian: true, isVegan: false, allergens: ['глютен', 'яйца', 'молоко'] },
    { name: 'Йогурт с гранолой', description: 'Натуральный йогурт с домашней гранолой и ягодами', calories: 180, protein: 8.0, carbs: 28.0, fat: 4.5, weight: 200, price: 140.00, isVegetarian: true, isVegan: false, allergens: ['молоко', 'орехи'] },
  ],
  LUNCH: [
    { name: 'Борщ украинский', description: 'Традиционный борщ со сметаной', calories: 180, protein: 8.0, carbs: 18.0, fat: 9.0, weight: 350, price: 160.00, isVegetarian: false, isVegan: false, allergens: ['молоко'] },
    { name: 'Куриная грудка гриль', description: 'Сочная куриная грудка с овощами гриль', calories: 320, protein: 42.0, carbs: 8.0, fat: 12.0, weight: 300, price: 280.00, isVegetarian: false, isVegan: false, allergens: [] },
    { name: 'Рис с овощами', description: 'Отварной рис с тушеными овощами', calories: 220, protein: 5.0, carbs: 45.0, fat: 3.0, weight: 250, price: 140.00, isVegetarian: true, isVegan: true, allergens: [] },
    { name: 'Салат Цезарь', description: 'Классический салат Цезарь с курицей', calories: 280, protein: 22.0, carbs: 12.0, fat: 18.0, weight: 250, price: 220.00, isVegetarian: false, isVegan: false, allergens: ['глютен', 'яйца', 'молоко'] },
    { name: 'Картофельное пюре', description: 'Нежное картофельное пюре с маслом', calories: 180, protein: 3.0, carbs: 32.0, fat: 6.0, weight: 200, price: 100.00, isVegetarian: true, isVegan: false, allergens: ['молоко'] },
    { name: 'Компот из сухофруктов', description: 'Домашний компот из сухофруктов', calories: 80, protein: 0.5, carbs: 20.0, fat: 0.0, weight: 250, price: 50.00, isVegetarian: true, isVegan: true, allergens: [] },
  ],
  DINNER: [
    { name: 'Рыба запеченная', description: 'Филе трески запеченное с лимоном', calories: 240, protein: 28.0, carbs: 2.0, fat: 12.0, weight: 250, price: 260.00, isVegetarian: false, isVegan: false, allergens: ['рыба'] },
    { name: 'Овощное рагу', description: 'Тушеные овощи с зеленью', calories: 150, protein: 4.0, carbs: 28.0, fat: 4.0, weight: 300, price: 140.00, isVegetarian: true, isVegan: true, allergens: [] },
    { name: 'Гречка отварная', description: 'Рассыпчатая гречневая каша', calories: 160, protein: 6.0, carbs: 30.0, fat: 3.0, weight: 200, price: 90.00, isVegetarian: true, isVegan: true, allergens: [] },
    { name: 'Салат из свежих овощей', description: 'Микс свежих овощей с оливковым маслом', calories: 80, protein: 2.0, carbs: 12.0, fat: 4.0, weight: 150, price: 110.00, isVegetarian: true, isVegan: true, allergens: [] },
  ],
  SNACK: [
    { name: 'Фруктовый салат', description: 'Микс сезонных фруктов', calories: 120, protein: 1.5, carbs: 28.0, fat: 0.5, weight: 200, price: 130.00, isVegetarian: true, isVegan: true, allergens: [] },
    { name: 'Сэндвич с индейкой', description: 'Цельнозерновой хлеб с индейкой и овощами', calories: 280, protein: 18.0, carbs: 32.0, fat: 8.0, weight: 180, price: 170.00, isVegetarian: false, isVegan: false, allergens: ['глютен'] },
    { name: 'Смузи ягодный', description: 'Смузи из свежих ягод и банана', calories: 150, protein: 3.0, carbs: 32.0, fat: 1.0, weight: 300, price: 160.00, isVegetarian: true, isVegan: true, allergens: [] },
    { name: 'Орехи микс', description: 'Смесь орехов и сухофруктов', calories: 220, protein: 6.0, carbs: 18.0, fat: 16.0, weight: 80, price: 140.00, isVegetarian: true, isVegan: true, allergens: ['орехи'] },
  ],
};

async function seedCanteenWeek() {
  const client = await pool.connect();

  try {
    console.log('🍽️  Seeding canteen menu for 5 days...\n');

    // Получаем сегодняшнюю дату
    const today = new Date();

    // Добавляем меню на 5 дней
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      const dateString = date.toISOString().split('T')[0];

      console.log(`📅 Adding menu for ${dateString}...`);

      // Для каждого типа приема пищи
      for (const [mealType, items] of Object.entries(weekMenu)) {
        const menuId = uuidv4();

        // Создаем меню
        await client.query(
          `INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING`,
          [menuId, dateString, mealType]
        );

        // Добавляем блюда
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemId = uuidv4();

          await client.query(
            `INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
             ON CONFLICT DO NOTHING`,
            [
              itemId,
              menuId,
              item.name,
              item.description,
              mealType,
              item.calories,
              item.protein,
              item.carbs,
              item.fat,
              item.weight,
              item.price,
              item.isVegetarian,
              item.isVegan,
              item.allergens,
              i + 1,
            ]
          );
        }

        console.log(`  ✓ ${mealType}: ${items.length} items`);
      }
      console.log('');
    }

    console.log('✅ Canteen menu seeded successfully for 5 days!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCanteenWeek();
