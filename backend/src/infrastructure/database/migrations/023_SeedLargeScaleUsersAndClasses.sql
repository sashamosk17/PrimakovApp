-- Migration 023: Large-scale Seed of 110+ Students (13 Classes) and 27 Teachers (6 Departments)
-- Password for all seeded users: password123 (bcrypt 10 rounds hash)
-- Hash: $2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa

-- 1. Insert 27 Teachers across Departments
INSERT INTO users (id, email, password_hash, first_name, last_name, role, group_name, is_active, created_at, updated_at)
VALUES
  -- Кафедра математики
  ('a1111111-0001-4000-8000-000000000001', 'elena.sokolova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Елена', 'Соколова', 'TEACHER', 'Кафедра математики', true, NOW(), NOW()),
  ('a1111111-0001-4000-8000-000000000002', 'mikhail.vinogradov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Михаил', 'Виноградов', 'TEACHER', 'Кафедра математики', true, NOW(), NOW()),
  ('a1111111-0001-4000-8000-000000000003', 'olga.kuznetsova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ольга', 'Кузнецова', 'TEACHER', 'Кафедра математики', true, NOW(), NOW()),
  ('a1111111-0001-4000-8000-000000000004', 'sergey.polyakov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Сергей', 'Поляков', 'TEACHER', 'Кафедра математики', true, NOW(), NOW()),
  ('a1111111-0001-4000-8000-000000000005', 'tatiana.voronina@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Татьяна', 'Воронина', 'TEACHER', 'Кафедра математики', true, NOW(), NOW()),

  -- Кафедра словесности (Русский язык и Литература)
  ('a1111111-0002-4000-8000-000000000001', 'anna.kovaleva@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Анна', 'Ковалева', 'TEACHER', 'Кафедра словесности', true, NOW(), NOW()),
  ('a1111111-0002-4000-8000-000000000002', 'victor.sidorov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Виктор', 'Сидоров', 'TEACHER', 'Кафедра словесности', true, NOW(), NOW()),
  ('a1111111-0002-4000-8000-000000000003', 'natalia.belova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Наталья', 'Белова', 'TEACHER', 'Кафедра словесности', true, NOW(), NOW()),
  ('a1111111-0002-4000-8000-000000000004', 'evgeniy.orlov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Евгений', 'Орлов', 'TEACHER', 'Кафедра словесности', true, NOW(), NOW()),
  ('a1111111-0002-4000-8000-000000000005', 'marina.cher nova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Марина', 'Чернова', 'TEACHER', 'Кафедра словесности', true, NOW(), NOW()),

  -- Кафедра естественных наук (Физика, Химия, Биология)
  ('a1111111-0003-4000-8000-000000000001', 'dmitriy.smirnov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Дмитрий', 'Смирнов', 'TEACHER', 'Кафедра естественных наук', true, NOW(), NOW()),
  ('a1111111-0003-4000-8000-000000000002', 'irina.vasilieva@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ирина', 'Васильева', 'TEACHER', 'Кафедра естественных наук', true, NOW(), NOW()),
  ('a1111111-0003-4000-8000-000000000003', 'konstantin.lebedev@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Константин', 'Лебедев', 'TEACHER', 'Кафедра естественных наук', true, NOW(), NOW()),
  ('a1111111-0003-4000-8000-000000000004', 'svetlana.zhukova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Светлана', 'Жукова', 'TEACHER', 'Кафедра естественных наук', true, NOW(), NOW()),
  ('a1111111-0003-4000-8000-000000000005', 'artyom.kozlov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Артем', 'Козлов', 'TEACHER', 'Кафедра естественных наук', true, NOW(), NOW()),

  -- Кафедра иностранных языков
  ('a1111111-0004-4000-8000-000000000001', 'yulia.morozova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Юлия', 'Морозова', 'TEACHER', 'Кафедра иностранных языков', true, NOW(), NOW()),
  ('a1111111-0004-4000-8000-000000000002', 'alexander.davydov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Александр', 'Давыдов', 'TEACHER', 'Кафедра иностранных языков', true, NOW(), NOW()),
  ('a1111111-0004-4000-8000-000000000003', 'elizabeth.clark@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Элизабет', 'Кларк', 'TEACHER', 'Кафедра иностранных языков', true, NOW(), NOW()),
  ('a1111111-0004-4000-8000-000000000004', 'olga.novikova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ольга', 'Новикова', 'TEACHER', 'Кафедра иностранных языков', true, NOW(), NOW()),
  ('a1111111-0004-4000-8000-000000000005', 'denis.tarasov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Денис', 'Тарасов', 'TEACHER', 'Кафедра иностранных языков', true, NOW(), NOW()),

  -- Кафедра IT и робототехники
  ('a1111111-0005-4000-8000-000000000001', 'ivan.ivanov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Иван', 'Иванов', 'TEACHER', 'Кафедра IT и робототехники', true, NOW(), NOW()),
  ('a1111111-0005-4000-8000-000000000002', 'gleb.nikolaev@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Глеб', 'Николаев', 'TEACHER', 'Кафедра IT и робототехники', true, NOW(), NOW()),
  ('a1111111-0005-4000-8000-000000000003', 'polina.zaytseva@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Полина', 'Зайцева', 'TEACHER', 'Кафедра IT и робототехники', true, NOW(), NOW()),
  ('a1111111-0005-4000-8000-000000000004', 'roman.fedorov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Роман', 'Федоров', 'TEACHER', 'Кафедра IT и робототехники', true, NOW(), NOW()),

  -- Кафедра физкультуры и спорта
  ('a1111111-0006-4000-8000-000000000001', 'vadim.stepanov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Вадим', 'Степанов', 'TEACHER', 'Кафедра физкультуры', true, NOW(), NOW()),
  ('a1111111-0006-4000-8000-000000000002', 'marina.karpova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Марина', 'Карпова', 'TEACHER', 'Кафедра физкультуры', true, NOW(), NOW()),
  ('a1111111-0006-4000-8000-000000000003', 'igor.matveev@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Игорь', 'Матвеев', 'TEACHER', 'Кафедра физкультуры', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_active = true;

-- 2. Insert 110+ Students across 13 Classes
INSERT INTO users (id, email, password_hash, first_name, last_name, role, group_name, is_active, created_at, updated_at)
VALUES
  -- 1-А (Начальная школа)
  ('b1000001-0001-4000-8000-000000000001', 'timur.aliev.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Тимур', 'Алиев', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000002', 'varvara.borisova.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Варвара', 'Борисова', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000003', 'lev.volkov.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Лев', 'Волков', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000004', 'alisa.guseva.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Алиса', 'Гусева', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000005', 'mark.danilov.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Марк', 'Данилов', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000006', 'eva.efimova.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ева', 'Ефимова', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000007', 'matvey.zhukov.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Матвей', 'Жуков', 'STUDENT', '1-А', true, NOW(), NOW()),
  ('b1000001-0001-4000-8000-000000000008', 'miroslava.ilina.1a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Мирослава', 'Ильина', 'STUDENT', '1-А', true, NOW(), NOW()),

  -- 2-Б (Начальная школа)
  ('b1000002-0002-4000-8000-000000000001', 'danil.kuzmin.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Данил', 'Кузьмин', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000002', 'polina.larina.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Полина', 'Ларина', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000003', 'stepan.makarov.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Степан', 'Макаров', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000004', 'yana.nosova.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Яна', 'Носова', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000005', 'fyodor.osipov.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Федор', 'Осипов', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000006', 'kira.panova.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Кира', 'Панова', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000007', 'roman.rybakov.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Роман', 'Рыбаков', 'STUDENT', '2-Б', true, NOW(), NOW()),
  ('b1000002-0002-4000-8000-000000000008', 'taisya.savina.2b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Таисия', 'Савина', 'STUDENT', '2-Б', true, NOW(), NOW()),

  -- 4-А (Начальная школа)
  ('b1000004-0001-4000-8000-000000000001', 'artemiy.titov.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Артемий', 'Титов', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000002', 'veronika.ustimova.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Вероника', 'Устимова', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000003', 'yaroslav.frolov.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ярослав', 'Фролов', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000004', 'daria.haritonova.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Дарья', 'Харитонова', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000005', 'platon.tsarev.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Платон', 'Царев', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000006', 'zoya.chistyakova.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Зоя', 'Чистякова', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000007', 'egor.shvedov.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Егор', 'Шведов', 'STUDENT', '4-А', true, NOW(), NOW()),
  ('b1000004-0001-4000-8000-000000000008', 'milana.schukina.4a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Милана', 'Щукина', 'STUDENT', '4-А', true, NOW(), NOW()),

  -- 5-А (Средняя школа)
  ('b1000005-0001-4000-8000-000000000001', 'arseniy.yudin.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Арсений', 'Юдин', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000002', 'kristina.yakovleva.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Кристина', 'Яковлева', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000003', 'bogdan.anisimov.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Богдан', 'Анисимов', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000004', 'vladislava.bykova.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Владислава', 'Быкова', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000005', 'gleb.veselov.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Глеб', 'Веселов', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000006', 'diana.gavrilova.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Диана', 'Гаврилова', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000007', 'denis.doronin.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Денис', 'Доронин', 'STUDENT', '5-А', true, NOW(), NOW()),
  ('b1000005-0001-4000-8000-000000000008', 'elizaveta.eliseeva.5a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Елизавета', 'Елисеева', 'STUDENT', '5-А', true, NOW(), NOW()),

  -- 6-Б (Средняя школа)
  ('b1000006-0002-4000-8000-000000000001', 'zakhar.zhilin.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Захар', 'Жилин', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000002', 'inna.zueva.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Инна', 'Зуева', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000003', 'ilya.isaev.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Илья', 'Исаев', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000004', 'kamilla.kazakova.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Камилла', 'Казакова', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000005', 'leonid.lapin.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Леонид', 'Лапин', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000006', 'maya.mironova.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Майя', 'Миронова', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000007', 'nikita.nikitin.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Никита', 'Никитин', 'STUDENT', '6-Б', true, NOW(), NOW()),
  ('b1000006-0002-4000-8000-000000000008', 'olesya.ovsyannikova.6b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Олеся', 'Овсянникова', 'STUDENT', '6-Б', true, NOW(), NOW()),

  -- 7-А (Средняя школа)
  ('b1000007-0001-4000-8000-000000000001', 'pavel.peshkov.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Павел', 'Пешков', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000002', 'rada.radosteva.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Рада', 'Радостева', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000003', 'semen.salnikov.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Семен', 'Сальников', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000004', 'taisiya.tarasova.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Таисия', 'Тарасова', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000005', 'filipp.fomichev.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Филипп', 'Фомичев', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000006', 'khristina.khokhlova.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Кристина', 'Хохлова', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000007', 'eduard.tsvetkov.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Эдуард', 'Цветков', 'STUDENT', '7-А', true, NOW(), NOW()),
  ('b1000007-0001-4000-8000-000000000008', 'yuliana.shumova.7a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Юлиана', 'Шумова', 'STUDENT', '7-А', true, NOW(), NOW()),

  -- 8-В (Средняя школа)
  ('b1000008-0003-4000-8000-000000000001', 'artur.abramov.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Артур', 'Абрамов', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000002', 'bella.belyaeva.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Бэлла', 'Беляева', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000003', 'valeriy.vorobyov.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Валерий', 'Воробьев', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000004', 'galina.golubeva.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Галина', 'Голубева', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000005', 'dmitriy.demyanov.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Дмитрий', 'Демьянов', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000006', 'evgenia.ermakova.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Евгения', 'Ермакова', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000007', 'zhanna.zharova.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Жанна', 'Жарова', 'STUDENT', '8-В', true, NOW(), NOW()),
  ('b1000008-0003-4000-8000-000000000008', 'ivan.ignatiev.8v@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Иван', 'Игнатьев', 'STUDENT', '8-В', true, NOW(), NOW()),

  -- 9-А (Средняя школа)
  ('b1000009-0001-4000-8000-000000000001', 'kirill.kalinin.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Кирилл', 'Калинин', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000002', 'larisa.leonova.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Лариса', 'Леонова', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000003', 'maksim.malyshev.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Максим', 'Малышев', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000004', 'nina.nekrasova.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Нина', 'Некрасова', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000005', 'oleg.ovchinnikov.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Олег', 'Овчинников', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000006', 'polina.pechurina.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Полина', 'Печурина', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000007', 'rodion.rudnev.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Родион', 'Руднев', 'STUDENT', '9-А', true, NOW(), NOW()),
  ('b1000009-0001-4000-8000-000000000008', 'snezhana.sukhanova.9a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Снежана', 'Суханова', 'STUDENT', '9-А', true, NOW(), NOW()),

  -- 9-Б (Средняя школа)
  ('b1000009-0002-4000-8000-000000000001', 'timofey.terekhov.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Тимофей', 'Терехов', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000002', 'ulyana.usoltseva.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ульяна', 'Усольцева', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000003', 'fedor.filimonov.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Федор', 'Филимонов', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000004', 'khelena.khromova.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Елена', 'Хромова', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000005', 'elena.tseytlina.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Елена', 'Цейтлина', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000006', 'cheremis.shirokov.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Черемис', 'Широков', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000007', 'ella.shcherbakova.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Элла', 'Щербакова', 'STUDENT', '9-Б', true, NOW(), NOW()),
  ('b1000009-0002-4000-8000-000000000008', 'yuriy.yuriev.9b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Юрий', 'Юрьев', 'STUDENT', '9-Б', true, NOW(), NOW()),

  -- 10-А (Старшая школа - Соц-эк)
  ('b1000010-0001-4000-8000-000000000001', 'ivan.petrov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Иван', 'Петров', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000002', 'maria.sokolova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Мария', 'Соколова', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000003', 'artem.volkov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Артем', 'Волков', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000004', 'sofia.morozova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'София', 'Морозова', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000005', 'maksim.orlov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Максим', 'Орлов', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000006', 'polina.vasilieva@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Полина', 'Васильева', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000007', 'kirill.lebedev@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Кирилл', 'Лебедев', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000008', 'anna.semenova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Анна', 'Семенова', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000009', 'egor.popov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Егор', 'Попов', 'STUDENT', '10-А', true, NOW(), NOW()),
  ('b1000010-0001-4000-8000-000000000010', 'daria.kuznetsova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Дарья', 'Кузнецова', 'STUDENT', '10-А', true, NOW(), NOW()),

  -- 10-Б (Старшая школа - Физ-мат)
  ('b1000010-0002-4000-8000-000000000001', 'mikhail.alekseev.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Михаил', 'Алексеев', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000002', 'alisa.bogdanova.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Алиса', 'Богданова', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000003', 'gleb.vinokurov.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Глеб', 'Винокуров', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000004', 'daria.grigorieva.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Дарья', 'Григорьева', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000005', 'egor.drozdov.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Егор', 'Дроздов', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000006', 'elizaveta.zhdanova.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Елизавета', 'Жданова', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000007', 'ivan.zaytsev.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Иван', 'Зайцев', 'STUDENT', '10-Б', true, NOW(), NOW()),
  ('b1000010-0002-4000-8000-000000000008', 'irina.kazantseva.10b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ирина', 'Казанцева', 'STUDENT', '10-Б', true, NOW(), NOW()),

  -- 11-А (Старшая школа - Гуманитарный)
  ('b1000011-0001-4000-8000-000000000001', 'aleksei.smirnov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Алексей', 'Смирнов', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000002', 'anastasia.komarova.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Анастасия', 'Комарова', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000003', 'boris.litvinov.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Борис', 'Литвинов', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000004', 'valentina.medvedeva.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Валентина', 'Медведева', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000005', 'vitaliy.naumov.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Виталий', 'Наумов', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000006', 'galina.ovsyannikova.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Галина', 'Овсянникова', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000007', 'georgiy.pashkov.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Георгий', 'Пашков', 'STUDENT', '11-А', true, NOW(), NOW()),
  ('b1000011-0001-4000-8000-000000000008', 'diana.romanova.11a@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Диана', 'Романова', 'STUDENT', '11-А', true, NOW(), NOW()),

  -- 11-Б (Старшая школа - IT / IB)
  ('b1000011-0002-4000-8000-000000000001', 'dmitriy.sobolev.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Дмитрий', 'Соболев', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000002', 'elena.timofeeva.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Елена', 'Тимофеева', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000003', 'ilya.ugryumov.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Илья', 'Угрюмов', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000004', 'ksenia.filatova.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Ксения', 'Филатова', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000005', 'lev.khabarov.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Лев', 'Хабаров', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000006', 'lyudmila.tsaryova.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Людмила', 'Царева', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000007', 'maksim.chernov.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Максим', 'Чернов', 'STUDENT', '11-Б', true, NOW(), NOW()),
  ('b1000011-0002-4000-8000-000000000008', 'yulia.shatova.11b@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Юлия', 'Шатова', 'STUDENT', '11-Б', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_active = true;

-- 3. Human-readable class names update in existing schedules & users if any were '10A' -> '10-А'
UPDATE users SET group_name = '10-А' WHERE group_name = '10A';
UPDATE users SET group_name = '10-Б' WHERE group_name = '10B';
UPDATE users SET group_name = '11-А' WHERE group_name = '11A';
UPDATE users SET group_name = '11-Б' WHERE group_name = '11B';

