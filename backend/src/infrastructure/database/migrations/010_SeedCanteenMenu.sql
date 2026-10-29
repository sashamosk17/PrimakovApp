-- Seed canteen menu data for today
-- Insert breakfast menu
INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'BREAKFAST', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert breakfast items
INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Овсяная каша', 'Классическая овсяная каша на молоке с медом', 'BREAKFAST', 250, 8.5, 45.0, 5.0, 300, 120.00, true, false, ARRAY['молоко', 'глютен'], 1, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Омлет с сыром', 'Воздушный омлет с сыром чеддер', 'BREAKFAST', 320, 18.0, 5.0, 24.0, 200, 150.00, true, false, ARRAY['яйца', 'молоко'], 2, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Блины с вареньем', 'Тонкие блины с клубничным вареньем', 'BREAKFAST', 280, 6.0, 52.0, 8.0, 250, 130.00, true, false, ARRAY['глютен', 'яйца', 'молоко'], 3, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Йогурт с гранолой', 'Натуральный йогурт с домашней гранолой и ягодами', 'BREAKFAST', 180, 8.0, 28.0, 4.5, 200, 140.00, true, false, ARRAY['молоко', 'орехи'], 4, CURRENT_TIMESTAMP);

-- Insert lunch menu
INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'LUNCH', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert lunch items
INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Борщ украинский', 'Традиционный борщ со сметаной', 'LUNCH', 180, 8.0, 18.0, 9.0, 350, 160.00, false, false, ARRAY['молоко'], 1, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Куриная грудка гриль', 'Сочная куриная грудка с овощами гриль', 'LUNCH', 320, 42.0, 8.0, 12.0, 300, 280.00, false, false, ARRAY[]::text[], 2, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Рис с овощами', 'Отварной рис с тушеными овощами', 'LUNCH', 220, 5.0, 45.0, 3.0, 250, 140.00, true, true, ARRAY[]::text[], 3, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Салат Цезарь', 'Классический салат Цезарь с курицей', 'LUNCH', 280, 22.0, 12.0, 18.0, 250, 220.00, false, false, ARRAY['глютен', 'яйца', 'молоко'], 4, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'Картофельное пюре', 'Нежное картофельное пюре с маслом', 'LUNCH', 180, 3.0, 32.0, 6.0, 200, 100.00, true, false, ARRAY['молоко'], 5, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Компот из сухофруктов', 'Домашний компот из сухофруктов', 'LUNCH', 80, 0.5, 20.0, 0.0, 250, 50.00, true, true, ARRAY[]::text[], 6, CURRENT_TIMESTAMP);

-- Insert dinner menu
INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 'DINNER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert dinner items
INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Рыба запеченная', 'Филе трески запеченное с лимоном', 'DINNER', 240, 28.0, 2.0, 12.0, 250, 260.00, false, false, ARRAY['рыба'], 1, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Овощное рагу', 'Тушеные овощи с зеленью', 'DINNER', 150, 4.0, 28.0, 4.0, 300, 140.00, true, true, ARRAY[]::text[], 2, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Гречка отварная', 'Рассыпчатая гречневая каша', 'DINNER', 160, 6.0, 30.0, 3.0, 200, 90.00, true, true, ARRAY[]::text[], 3, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'Салат из свежих овощей', 'Микс свежих овощей с оливковым маслом', 'DINNER', 80, 2.0, 12.0, 4.0, 150, 110.00, true, true, ARRAY[]::text[], 4, CURRENT_TIMESTAMP);

-- Insert snack menu
INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE, 'SNACK', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert snack items
INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'Фруктовый салат', 'Микс сезонных фруктов', 'SNACK', 120, 1.5, 28.0, 0.5, 200, 130.00, true, true, ARRAY[]::text[], 1, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'Сэндвич с индейкой', 'Цельнозерновой хлеб с индейкой и овощами', 'SNACK', 280, 18.0, 32.0, 8.0, 180, 170.00, false, false, ARRAY['глютен'], 2, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', 'Смузи ягодный', 'Смузи из свежих ягод и банана', 'SNACK', 150, 3.0, 32.0, 1.0, 300, 160.00, true, true, ARRAY[]::text[], 3, CURRENT_TIMESTAMP),
  ('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', 'Орехи микс', 'Смесь орехов и сухофруктов', 'SNACK', 220, 6.0, 18.0, 16.0, 80, 140.00, true, true, ARRAY['орехи'], 4, CURRENT_TIMESTAMP);
