-- Migration 029: Comprehensive Synthetic Data Seeding for PrimakovApp
-- Enriches users, schedules, lessons, grades, house transactions, boarding, requests, ratings, canteen menus, announcements, and stories.

-- ============================================================================
-- 0. Defensive Schema Preparation (Self-healing idempotency)
-- ============================================================================
-- 1. Users schema
ALTER TABLE users ADD COLUMN IF NOT EXISTS house VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_boarding BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS room_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Stories schema
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS link_text TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Announcements category type alignment
DO $$
BEGIN
  ALTER TABLE announcements ALTER COLUMN category TYPE VARCHAR(100) USING category::text;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Requests schema
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sla_deadline_at TIMESTAMPTZ;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS notes TEXT;
DO $$
BEGIN
  ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_room_id_fkey;
  ALTER TABLE requests ALTER COLUMN room_id TYPE VARCHAR(100) USING room_id::text;
  ALTER TABLE requests ALTER COLUMN type TYPE VARCHAR(30) USING type::text;
  ALTER TABLE requests ALTER COLUMN status TYPE VARCHAR(30) USING status::text;
  ALTER TABLE requests ALTER COLUMN priority TYPE VARCHAR(20) USING priority::text;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 1. Enrich Users: Houses, Boarding Status, Rooms, Contacts
UPDATE users SET
  house = CASE
    WHEN group_name IN ('10-А', '8-А', '6-А', '1-А') THEN 'NORTH'
    WHEN group_name IN ('10-Б', '8-Б', '6-Б', '2-А') THEN 'SOUTH'
    WHEN group_name IN ('11-А', '9-А', '7-А', '3-А') THEN 'EAST'
    ELSE 'WEST'
  END
WHERE role = 'STUDENT' AND (house IS NULL OR house = '');

-- Boarding students cohort in 10-А and 11-А
WITH numbered_boarding AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM users
  WHERE group_name IN ('10-А', '11-А') AND role = 'STUDENT'
)
UPDATE users SET
  is_boarding = true,
  room_number = CASE numbered_boarding.rn % 6
    WHEN 0 THEN '201'
    WHEN 1 THEN '202'
    WHEN 2 THEN '203'
    WHEN 3 THEN '204'
    WHEN 4 THEN '205'
    ELSE '206'
  END
FROM numbered_boarding
WHERE users.id = numbered_boarding.id;

-- Contacts for users
WITH numbered_contacts AS (
  SELECT id, email, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM users
  WHERE phone IS NULL OR phone = ''
)
UPDATE users SET
  phone = '+7 (916) 789-' || LPAD((numbered_contacts.rn % 9000 + 1000)::text, 4, '0'),
  telegram = '@' || LOWER(SPLIT_PART(numbered_contacts.email, '@', 1))
FROM numbered_contacts
WHERE users.id = numbered_contacts.id;

UPDATE users SET
  birth_date = '2009-05-18'
WHERE role = 'STUDENT' AND birth_date IS NULL;

-- 2. Clear out any previous schedules/lessons for 10-А, 10-Б, 11-А, 11-Б so we insert clean cohesive data
DELETE FROM lessons WHERE schedule_id IN (
  SELECT id FROM schedules WHERE group_id IN ('10-А', '10-Б', '11-А', '11-Б')
);
DELETE FROM schedules WHERE group_id IN ('10-А', '10-Б', '11-А', '11-Б');

-- Generate Schedules for the 4 key classes for 14 days around CURRENT_DATE
DO $$
DECLARE
  v_group TEXT;
  v_date DATE;
  v_schedule_id UUID;
  v_day_offset INT;
  v_day_of_week INT;
  v_teacher_math UUID;
  v_teacher_rus UUID;
  v_teacher_phys UUID;
  v_teacher_eng UUID;
  v_teacher_cs UUID;
  v_teacher_lit UUID;
BEGIN
  -- Resolve real teachers from users
  SELECT id INTO v_teacher_math FROM users WHERE role = 'TEACHER' AND (last_name = 'Соколова' OR group_name LIKE '%математ%') LIMIT 1;
  IF v_teacher_math IS NULL THEN SELECT id INTO v_teacher_math FROM users WHERE role = 'TEACHER' LIMIT 1; END IF;

  SELECT id INTO v_teacher_rus FROM users WHERE role = 'TEACHER' AND (last_name = 'Ковалева' OR group_name LIKE '%словесн%') LIMIT 1;
  IF v_teacher_rus IS NULL THEN v_teacher_rus := v_teacher_math; END IF;

  SELECT id INTO v_teacher_phys FROM users WHERE role = 'TEACHER' AND (last_name = 'Смирнов' OR group_name LIKE '%естеств%') LIMIT 1;
  IF v_teacher_phys IS NULL THEN v_teacher_phys := v_teacher_math; END IF;

  SELECT id INTO v_teacher_eng FROM users WHERE role = 'TEACHER' AND (last_name = 'Морозова' OR group_name LIKE '%иностр%') LIMIT 1;
  IF v_teacher_eng IS NULL THEN v_teacher_eng := v_teacher_math; END IF;

  SELECT id INTO v_teacher_cs FROM users WHERE role = 'TEACHER' AND (last_name = 'Иванов' OR group_name LIKE '%IT%') LIMIT 1;
  IF v_teacher_cs IS NULL THEN v_teacher_cs := v_teacher_math; END IF;

  v_teacher_lit := v_teacher_rus;

  FOR v_group IN SELECT UNNEST(ARRAY['10-А', '10-Б', '11-А', '11-Б']) LOOP
    FOR v_day_offset IN -3..14 LOOP
      v_date := CURRENT_DATE + v_day_offset;
      v_day_of_week := EXTRACT(DOW FROM v_date);

      -- Skip Sundays (0)
      IF v_day_of_week <> 0 THEN
        v_schedule_id := gen_random_uuid();

        INSERT INTO schedules (id, group_id, date, created_at, updated_at)
        VALUES (v_schedule_id, v_group, v_date, NOW(), NOW());

        -- 5-6 Lessons per day
        INSERT INTO lessons (id, schedule_id, subject, teacher_id, start_time, end_time, room_number, room_building, floor, has_homework, homework_description, created_at, updated_at)
        VALUES
          (
            gen_random_uuid(), v_schedule_id, 'Алгебра и начала анализа',
            v_teacher_math, '08:30', '09:15', '305', 'A', 3, true,
            'Параграф 14, номера 14.1-14.8 в тетради', NOW(), NOW()
          ),
          (
            gen_random_uuid(), v_schedule_id, 'Русский язык',
            v_teacher_rus, '09:25', '10:10', '201', 'A', 2, false,
            NULL, NOW(), NOW()
          ),
          (
            gen_random_uuid(), v_schedule_id, 'Физика',
            v_teacher_phys, '10:20', '11:05', '404', 'A', 4, true,
            'Задачи 8.4-8.7 на закон сохранения импульса', NOW(), NOW()
          ),
          (
            gen_random_uuid(), v_schedule_id, 'Английский язык',
            v_teacher_eng, '11:25', '12:10', '303', 'A', 3, true,
            'Эссе: "The Role of AI in Modern Education" (250 слов)', NOW(), NOW()
          ),
          (
            gen_random_uuid(), v_schedule_id, 'Информатика и ИКТ',
            v_teacher_cs, '12:30', '13:15', '501', 'A', 5, false,
            NULL, NOW(), NOW()
          ),
          (
            gen_random_uuid(), v_schedule_id, 'Литература',
            v_teacher_lit, '13:25', '14:10', '202', 'A', 2, true,
            'Подготовить анализ поэмы "Двенадцать" А. Блока', NOW(), NOW()
          );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 3. Academic Grades for 10-А, 10-Б, 11-А
DO $$
DECLARE
  v_student RECORD;
BEGIN
  FOR v_student IN (SELECT id FROM users WHERE group_name IN ('10-А', '10-Б', '11-А') AND role = 'STUDENT') LOOP
    -- Algebra
    INSERT INTO grades (student_id, subject_id, subject_name, value, weight, date, period, topic)
    VALUES
      (v_student.id, 'subj-math', 'Алгебра', 5.0, 1.0, CURRENT_DATE - INTERVAL '12 days', '1-й триместр 2026', 'Квадратные трехчлены'),
      (v_student.id, 'subj-math', 'Алгебра', 4.5, 1.5, CURRENT_DATE - INTERVAL '7 days', '1-й триместр 2026', 'Контрольная работа №2'),
      (v_student.id, 'subj-math', 'Алгебра', 5.0, 2.0, CURRENT_DATE - INTERVAL '2 days', '1-й триместр 2026', 'Триместровый срез знаний');

    -- Physics
    INSERT INTO grades (student_id, subject_id, subject_name, value, weight, date, period, topic)
    VALUES
      (v_student.id, 'subj-physics', 'Физика', 4.8, 1.0, CURRENT_DATE - INTERVAL '10 days', '1-й триместр 2026', 'Закон Кулона'),
      (v_student.id, 'subj-physics', 'Физика', 5.0, 1.5, CURRENT_DATE - INTERVAL '4 days', '1-й триместр 2026', 'Лабораторная работа');

    -- English
    INSERT INTO grades (student_id, subject_id, subject_name, value, weight, date, period, topic)
    VALUES
      (v_student.id, 'subj-english', 'Английский язык', 5.0, 1.0, CURRENT_DATE - INTERVAL '8 days', '1-й триместр 2026', 'Essay Writing'),
      (v_student.id, 'subj-english', 'Английский язык', 4.5, 1.5, CURRENT_DATE - INTERVAL '3 days', '1-й триместр 2026', 'Speaking Exam');

    -- Literature
    INSERT INTO grades (student_id, subject_id, subject_name, value, weight, date, period, topic)
    VALUES
      (v_student.id, 'subj-lit', 'Литература', 4.5, 1.0, CURRENT_DATE - INTERVAL '9 days', '1-й триместр 2026', 'Анализ поэзии Серебряного века'),
      (v_student.id, 'subj-lit', 'Литература', 5.0, 1.5, CURRENT_DATE - INTERVAL '5 days', '1-й триместр 2026', 'Сочинение по творчеству Бунина');
  END LOOP;
END $$;

-- 4. House Cup Point Transactions (Лига Домов)
DO $$
DECLARE
  v_awarded_by UUID;
  v_student_north UUID;
  v_student_south UUID;
  v_student_east UUID;
  v_student_west UUID;
BEGIN
  SELECT id INTO v_awarded_by FROM users WHERE role IN ('TEACHER', 'ADMIN') LIMIT 1;
  SELECT id INTO v_student_north FROM users WHERE role = 'STUDENT' AND house = 'NORTH' LIMIT 1;
  SELECT id INTO v_student_south FROM users WHERE role = 'STUDENT' AND house = 'SOUTH' LIMIT 1;
  SELECT id INTO v_student_east FROM users WHERE role = 'STUDENT' AND house = 'EAST' LIMIT 1;
  SELECT id INTO v_student_west FROM users WHERE role = 'STUDENT' AND house = 'WEST' LIMIT 1;

  -- Fallbacks if house not set
  IF v_student_north IS NULL THEN SELECT id INTO v_student_north FROM users WHERE role = 'STUDENT' LIMIT 1; END IF;
  IF v_student_south IS NULL THEN v_student_south := v_student_north; END IF;
  IF v_student_east IS NULL THEN v_student_east := v_student_north; END IF;
  IF v_student_west IS NULL THEN v_student_west := v_student_north; END IF;

  IF v_awarded_by IS NOT NULL AND v_student_north IS NOT NULL THEN
    INSERT INTO house_point_transactions (house, points, category, reason, awarded_by, student_id, created_at)
    VALUES
      ('NORTH', 50, 'ACADEMIC', '1-е место на Всероссийской олимпиаде по математике (региональный этап)', v_awarded_by, v_student_north, NOW() - INTERVAL '1 day'),
      ('NORTH', 35, 'OLYMPIAD', 'Призерство в олимпиаде по робототехнике и ИИ', v_awarded_by, v_student_north, NOW() - INTERVAL '2 days'),
      ('NORTH', 20, 'CHARITY', 'Активное участие в благотворительной ярмарке "Подари тепло"', v_awarded_by, v_student_north, NOW() - INTERVAL '3 days'),

      ('SOUTH', 45, 'SPORTS', 'Победа в первенстве гимназии по волейболу среди старших классов', v_awarded_by, v_student_south, NOW() - INTERVAL '1 day'),
      ('SOUTH', 30, 'CULTURE', 'Гран-при театрального фестиваля на английском языке', v_awarded_by, v_student_south, NOW() - INTERVAL '2 days'),
      ('SOUTH', 25, 'ACADEMIC', 'Публикация исследовательской статьи в сборнике Юных исследователей', v_awarded_by, v_student_south, NOW() - INTERVAL '4 days'),

      ('EAST', 60, 'OLYMPIAD', 'Победа в заключительном туре Московской олимпиады школьников по физике', v_awarded_by, v_student_east, NOW() - INTERVAL '1 day'),
      ('EAST', 40, 'ACADEMIC', 'Безупречный результат триместрового тестирования по естественным наукам', v_awarded_by, v_student_east, NOW() - INTERVAL '3 days'),
      ('EAST', 25, 'CHARITY', 'Организация шефской помощи младшим классам', v_awarded_by, v_student_east, NOW() - INTERVAL '5 days'),

      ('WEST', 50, 'SPORTS', 'Золотой кубок межшкольного легкоатлетического кросса', v_awarded_by, v_student_west, NOW() - INTERVAL '2 days'),
      ('WEST', 35, 'CULTURE', '1-е место в конкурсе ораторского искусства Primakov Talks', v_awarded_by, v_student_west, NOW() - INTERVAL '3 days'),
      ('WEST', 20, 'ACADEMIC', 'Победа в командном хакатоне Primakov Digital', v_awarded_by, v_student_west, NOW() - INTERVAL '4 days');
  END IF;
END $$;

-- 5. Boarding Checkins & Weekend Leave Requests
DO $$
DECLARE
  v_student RECORD;
BEGIN
  FOR v_student IN (SELECT id FROM users WHERE is_boarding = true LIMIT 18) LOOP
    INSERT INTO boarding_checkins (student_id, check_in_time, status, notes)
    VALUES
      (v_student.id, NOW() - INTERVAL '1 day' + INTERVAL '21 hours', 'PRESENT', 'Вечерняя перекличка в корпусе'),
      (v_student.id, NOW() - INTERVAL '2 hours', 'PRESENT', 'В кампусе, комната осмотрена');
  END LOOP;
END $$;

INSERT INTO weekend_leave_requests (student_id, departure_date, return_date, transport_type, status, guardian_confirmed, created_at)
SELECT
  id,
  TO_CHAR(CURRENT_DATE + INTERVAL '2 days', 'YYYY-MM-DD') || ' 17:00',
  TO_CHAR(CURRENT_DATE + INTERVAL '4 days', 'YYYY-MM-DD') || ' 20:00',
  'PARENTS',
  'APPROVED',
  true,
  NOW() - INTERVAL '1 day'
FROM users
WHERE is_boarding = true
LIMIT 5;

INSERT INTO weekend_leave_requests (student_id, departure_date, return_date, transport_type, status, guardian_confirmed, created_at)
SELECT
  id,
  TO_CHAR(CURRENT_DATE + INTERVAL '3 days', 'YYYY-MM-DD') || ' 18:00',
  TO_CHAR(CURRENT_DATE + INTERVAL '5 days', 'YYYY-MM-DD') || ' 19:30',
  'SHUTTLE',
  'PENDING',
  true,
  NOW()
FROM users
WHERE is_boarding = true
OFFSET 5 LIMIT 3;

-- 6. Service Desk Requests
DO $$
DECLARE
  v_teacher_1 UUID;
  v_teacher_2 UUID;
  v_student_1 UUID;
  v_admin UUID;
BEGIN
  SELECT id INTO v_teacher_1 FROM users WHERE role = 'TEACHER' LIMIT 1;
  SELECT id INTO v_teacher_2 FROM users WHERE role = 'TEACHER' OFFSET 1 LIMIT 1;
  IF v_teacher_2 IS NULL THEN v_teacher_2 := v_teacher_1; END IF;

  SELECT id INTO v_student_1 FROM users WHERE role = 'STUDENT' LIMIT 1;
  SELECT id INTO v_admin FROM users WHERE role = 'ADMIN' LIMIT 1;
  IF v_admin IS NULL THEN v_admin := v_teacher_1; END IF;

  IF v_teacher_1 IS NOT NULL THEN
    INSERT INTO requests (type, title, description, status, priority, creator_id, assignee_id, room_id, created_at, updated_at, sla_deadline_at, sla_breached, notes)
    VALUES
      (
        'IT', 'Не работает проектор в 305',
        'Проектор BenQ не реагирует на пульт управления, мигает красная лампа ошибки.',
        'PENDING', 'HIGH',
        v_teacher_1, v_admin, '305-A',
        NOW() - INTERVAL '1 hour', NOW(), NOW() + INTERVAL '3 hours', false, 'Направлен дежурный инженер IT'
      ),
      (
        'MAINTENANCE', 'Сломан доводчик двери в 201',
        'Дверь громко хлопает при сквозняке, требуется регулировка гидродоводчика.',
        'IN_PROGRESS', 'MEDIUM',
        v_teacher_2, v_admin, '201-A',
        NOW() - INTERVAL '3 hours', NOW(), NOW() + INTERVAL '21 hours', false, 'Запчасти получены со склада'
      ),
      (
        'CLEANING', 'Влажная уборка кабинета химии 404',
        'После проведения лабораторной работы требуется тщательная влажная уборка.',
        'COMPLETED', 'MEDIUM',
        v_teacher_1, v_admin, '404-A',
        NOW() - INTERVAL '6 hours', NOW(), NOW() + INTERVAL '18 hours', false, 'Уборка выполнена, кабинет проветрен'
      ),
      (
        'IT', 'Замена кабеля HDMI в Атриуме',
        'Мерцает изображение на главной панели во время репетиции.',
        'PENDING', 'URGENT',
        v_student_1, NULL, 'Атриум',
        NOW() - INTERVAL '30 minutes', NOW(), NOW() + INTERVAL '90 minutes', false, NULL
      ),
      (
        'MAINTENANCE', 'Не работает кондиционер в серверной 502',
        'Температура поднялась до 26C, требуется проверка внешнего блока.',
        'IN_PROGRESS', 'URGENT',
        v_teacher_2, v_admin, '502-A',
        NOW() - INTERVAL '40 minutes', NOW(), NOW() + INTERVAL '80 minutes', false, 'Техник на объекте'
      ),
      (
        'CLEANING', 'Пополнение антисептиков и мыла на 3 этаже',
        'В санузлах 3 этажа корпуса А закончилось жидкое мыло.',
        'COMPLETED', 'LOW',
        v_student_1, v_admin, '3-й этаж',
        NOW() - INTERVAL '12 hours', NOW(), NOW() + INTERVAL '36 hours', false, 'Диспенсеры заправлены'
      );
  END IF;
END $$;

-- 7. Teacher Ratings & Reviews
DO $$
DECLARE
  v_teacher_1 UUID;
  v_teacher_2 UUID;
  v_teacher_3 UUID;
  v_teacher_4 UUID;
  v_teacher_5 UUID;
  v_student_1 UUID;
  v_student_2 UUID;
  v_student_3 UUID;
  v_student_4 UUID;
  v_student_5 UUID;
  v_student_6 UUID;
BEGIN
  SELECT id INTO v_teacher_1 FROM users WHERE role = 'TEACHER' LIMIT 1;
  SELECT id INTO v_teacher_2 FROM users WHERE role = 'TEACHER' OFFSET 1 LIMIT 1;
  IF v_teacher_2 IS NULL THEN v_teacher_2 := v_teacher_1; END IF;
  SELECT id INTO v_teacher_3 FROM users WHERE role = 'TEACHER' OFFSET 2 LIMIT 1;
  IF v_teacher_3 IS NULL THEN v_teacher_3 := v_teacher_1; END IF;
  SELECT id INTO v_teacher_4 FROM users WHERE role = 'TEACHER' OFFSET 3 LIMIT 1;
  IF v_teacher_4 IS NULL THEN v_teacher_4 := v_teacher_1; END IF;
  SELECT id INTO v_teacher_5 FROM users WHERE role = 'TEACHER' OFFSET 4 LIMIT 1;
  IF v_teacher_5 IS NULL THEN v_teacher_5 := v_teacher_1; END IF;

  SELECT id INTO v_student_1 FROM users WHERE role = 'STUDENT' LIMIT 1;
  SELECT id INTO v_student_2 FROM users WHERE role = 'STUDENT' OFFSET 1 LIMIT 1;
  IF v_student_2 IS NULL THEN v_student_2 := v_student_1; END IF;
  SELECT id INTO v_student_3 FROM users WHERE role = 'STUDENT' OFFSET 2 LIMIT 1;
  IF v_student_3 IS NULL THEN v_student_3 := v_student_1; END IF;
  SELECT id INTO v_student_4 FROM users WHERE role = 'STUDENT' OFFSET 3 LIMIT 1;
  IF v_student_4 IS NULL THEN v_student_4 := v_student_1; END IF;
  SELECT id INTO v_student_5 FROM users WHERE role = 'STUDENT' OFFSET 4 LIMIT 1;
  IF v_student_5 IS NULL THEN v_student_5 := v_student_1; END IF;
  SELECT id INTO v_student_6 FROM users WHERE role = 'STUDENT' OFFSET 5 LIMIT 1;
  IF v_student_6 IS NULL THEN v_student_6 := v_student_1; END IF;

  IF v_teacher_1 IS NOT NULL AND v_student_1 IS NOT NULL THEN
    INSERT INTO ratings (id, teacher_id, user_id, value, comment, version, ip_hash, created_at, updated_at)
    VALUES
      (
        gen_random_uuid(), v_teacher_1, v_student_1,
        5, 'Прекрасный преподаватель! Объясняет самые трудные темы математического анализа на понятных жизненных примерах.',
        1, 'ip-hash-1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
      ),
      (
        gen_random_uuid(), v_teacher_1, v_student_2,
        5, 'Благодаря педагогу перестала бояться сложных задач и смогла выиграть региональный этап.',
        1, 'ip-hash-2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
      ),
      (
        gen_random_uuid(), v_teacher_2, v_student_3,
        5, 'Уроки литературы проходят на одном дыхании. Всегда живые дискуссии и разборы произведений.',
        1, 'ip-hash-3', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
      ),
      (
        gen_random_uuid(), v_teacher_3, v_student_4,
        5, 'Физика — мой любимый предмет. Лабораторные эксперименты потрясающие!',
        1, 'ip-hash-4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
      ),
      (
        gen_random_uuid(), v_teacher_4, v_student_5,
        4, 'Очень требовательный, но справедливый педагог. Уровень языка заметно вырос.',
        1, 'ip-hash-5', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
      ),
      (
        gen_random_uuid(), v_teacher_5, v_student_6,
        5, 'Иван Сергеевич учит реальной разработке на Python и алгоритмам, а не просто теории из учебников.',
        1, 'ip-hash-6', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
      )
    ON CONFLICT (teacher_id, user_id) DO NOTHING;
  END IF;
END $$;

-- 8. Canteen Menus & Items for Current & Next Week
DELETE FROM menu_items WHERE menu_id IN (
  SELECT id FROM canteen_menu WHERE date BETWEEN CURRENT_DATE - INTERVAL '3 days' AND CURRENT_DATE + INTERVAL '12 days'
);
DELETE FROM canteen_menu WHERE date BETWEEN CURRENT_DATE - INTERVAL '3 days' AND CURRENT_DATE + INTERVAL '12 days';

DO $$
DECLARE
  v_offset INT;
  v_date DATE;
  v_b_menu_id UUID;
  v_l_menu_id UUID;
BEGIN
  FOR v_offset IN -2..10 LOOP
    v_date := CURRENT_DATE + v_offset;

    -- Breakfast menu
    v_b_menu_id := gen_random_uuid();
    INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
    VALUES (v_b_menu_id, v_date, 'BREAKFAST', true, NOW(), NOW());

    INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
    VALUES
      (
        gen_random_uuid(), v_b_menu_id, 'Овсяная каша с лесными ягодами',
        'Томленая овсянка на фермерском молоке со свежими ягодами черники и клубники',
        'Каши и завтраки', 260, 8.5, 44.0, 5.2, 250, 130, true, false, ARRAY['молоко', 'глютен'], 1
      ),
      (
        gen_random_uuid(), v_b_menu_id, 'Сырники из рикотты со сметаной',
        'Пышные запеченные сырники из фермерского творога с ягодным соусом',
        'Горячие блюда', 320, 18.0, 28.0, 14.0, 180, 190, true, false, ARRAY['молоко', 'яйца', 'глютен'], 2
      ),
      (
        gen_random_uuid(), v_b_menu_id, 'Омлет с сыром моцарелла и шпинатом',
        'Паровой белковый омлет со свежей зеленью',
        'Горячие блюда', 290, 19.0, 4.0, 21.0, 180, 160, true, false, ARRAY['молоко', 'яйца'], 3
      );

    -- Lunch menu
    v_l_menu_id := gen_random_uuid();
    INSERT INTO canteen_menu (id, date, meal_type, is_active, created_at, updated_at)
    VALUES (v_l_menu_id, v_date, 'LUNCH', true, NOW(), NOW());

    INSERT INTO menu_items (id, menu_id, name, description, category, calories, protein, carbs, fat, weight, price, is_vegetarian, is_vegan, allergens, display_order)
    VALUES
      (
        gen_random_uuid(), v_l_menu_id, 'Борщ сибирский с фермерской говядиной',
        'Традиционный насыщенный борщ со сметаной и пампушками',
        'Супы', 240, 14.0, 22.0, 10.0, 300, 190, false, false, ARRAY['молоко', 'глютен'], 1
      ),
      (
        gen_random_uuid(), v_l_menu_id, 'Суп-пюре из печеной тыквы с семечками',
        'Нежный бархатистый крем-суп с кокосовыми сливками',
        'Супы', 180, 4.5, 22.0, 8.0, 250, 160, true, true, ARRAY[]::TEXT[], 2
      ),
      (
        gen_random_uuid(), v_l_menu_id, 'Куриное филе су-вид с диким рисом',
        'Сочное диетическое филе цыпленка с миксом дикого и бурого риса',
        'Горячие блюда', 380, 36.0, 38.0, 8.0, 280, 290, false, false, ARRAY[]::TEXT[], 3
      ),
      (
        gen_random_uuid(), v_l_menu_id, 'Филе лосося на пару с брокколи',
        'Атлантический лосось с легким лимонно-голландским соусом',
        'Горячие блюда', 410, 32.0, 8.0, 24.0, 260, 390, false, false, ARRAY['рыба', 'молоко'], 4
      ),
      (
        gen_random_uuid(), v_l_menu_id, 'Смузи манго-маракуйя',
        'Освежающий витаминный смузи из спелых тропических фруктов',
        'Напитки', 130, 1.5, 29.0, 0.5, 300, 150, true, true, ARRAY[]::TEXT[], 5
      );
  END LOOP;
END $$;

-- 9. Announcements & Stories
INSERT INTO announcements (id, title, description, content, date, category, author_id, created_at, updated_at)
VALUES
  (
    gen_random_uuid(), 'День открытых дверей и олимпиада Primakov Digital',
    'Приглашаем родителей и гимназистов на презентацию инновационных IT-направлений.',
    'В программе мероприятия: мастер-классы по искусственному интеллекту, презентация лаборатории беспилотных систем, открытый диалог с ведущими экспертами отрасли и подведение итогов хакатона.',
    NOW(), 'Кампус', (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), NOW(), NOW()
  ),
  (
    gen_random_uuid(), 'Открытый лекторий: Встреча с летчиком-космонавтом в Атриуме',
    'В пятницу в 15:30 состоится вдохновляющая встреча с Героем России.',
    'Гимназисты смогут задать вопросы об исследовании дальнего космоса, подготовке к длительным полетам и научных экспериментах на борту орбитальной станции.',
    NOW() + INTERVAL '2 days', 'События', (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), NOW(), NOW()
  ),
  (
    gen_random_uuid(), 'Финал Междомовского турнира по шахматам и дебатам',
    'Борьба за Кубок Лиги Домов выходит на финишную прямую!',
    'Решающие поединки между сборными командами Домов Север, Юг, Восток и Запад пройдут в зеркальном зале гимназии. Приглашаем болельщиков поддержать свои Дома.',
    NOW() + INTERVAL '4 days', 'Лига Домов', (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), NOW(), NOW()
  );

INSERT INTO stories (id, title, description, image_url, link_url, link_text, author, author_id, expires_at, created_at, updated_at)
VALUES
  (
    gen_random_uuid(), 'Лаборатория робототехники 2.0',
    'Новые наборы манипуляторов и датчиков машинного зрения поступили в кампус!',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800',
    'https://primakov.school/robotics', 'Записаться в группу', 'Кафедра IT',
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
    NOW() + INTERVAL '30 days', NOW(), NOW()
  ),
  (
    gen_random_uuid(), 'Победа Дома Север в волейболе',
    'Яркие моменты финального матча и награждение победителей',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800',
    'https://primakov.school/house-cup', 'Турнирная таблица', 'Спортклуб',
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
    NOW() + INTERVAL '30 days', NOW(), NOW()
  ),
  (
    gen_random_uuid(), 'Зимнее меню в ресторане гимназии',
    'Шеф-повар подготовил согревающие тыквенные супы и десерты из рикотты',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800',
    'https://primakov.school/canteen', 'Посмотреть меню', 'Служба питания',
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
    NOW() + INTERVAL '30 days', NOW(), NOW()
  );

