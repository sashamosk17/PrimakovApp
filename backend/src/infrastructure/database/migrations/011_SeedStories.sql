-- Seed Stories with UUID
-- Adds sample stories for testing

INSERT INTO stories (id, title, description, content, image_url, author_id, expires_at, created_at, updated_at)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Новости школы',
    'Сегодня прошло общешкольное собрание. Обсудили планы на следующий месяц.',
    'Сегодня прошло общешкольное собрание. Обсудили планы на следующий месяц.',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    (SELECT id FROM users WHERE email = 'admin@primakov.school' LIMIT 1),
    NOW() + INTERVAL '48 hours',
    NOW(),
    NOW()
  ),
  (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'Спортивные достижения',
    'Наша команда заняла первое место в городских соревнованиях по баскетболу!',
    'Наша команда заняла первое место в городских соревнованиях по баскетболу!',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    (SELECT id FROM users WHERE email = 'teacher.ivanov@primakov.school' LIMIT 1),
    NOW() + INTERVAL '48 hours',
    NOW(),
    NOW()
  ),
  (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'Научная конференция',
    'Приглашаем всех на школьную научную конференцию 15 мая.',
    'Приглашаем всех на школьную научную конференцию 15 мая.',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    (SELECT id FROM users WHERE email = 'admin@primakov.school' LIMIT 1),
    NOW() + INTERVAL '72 hours',
    NOW(),
    NOW()
  ),
  (
    'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    'Экскурсия в музей',
    'В субботу состоится экскурсия в Третьяковскую галерею. Запись у классного руководителя.',
    'В субботу состоится экскурсия в Третьяковскую галерею. Запись у классного руководителя.',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800',
    (SELECT id FROM users WHERE email = 'teacher.ivanov@primakov.school' LIMIT 1),
    NOW() + INTERVAL '72 hours',
    NOW(),
    NOW()
  ),
  (
    'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
    'День открытых дверей',
    'Приглашаем будущих учеников и их родителей на день открытых дверей 20 мая.',
    'Приглашаем будущих учеников и их родителей на день открытых дверей 20 мая.',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    (SELECT id FROM users WHERE email = 'admin@primakov.school' LIMIT 1),
    NOW() + INTERVAL '96 hours',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
