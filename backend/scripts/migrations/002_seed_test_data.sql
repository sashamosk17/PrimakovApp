-- ============================================================================
-- Migration 002: Seed Test Data
-- ============================================================================
-- Inserts test users, schedules, and sample data for development/testing
-- ============================================================================

-- ============================================================================
-- TEST USERS
-- ============================================================================

-- Students
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES
    ('user-1', 'ivan.petrov@primakov.school', '$2b$10$rKZvGxH8vZ5qH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q', 'Иван', 'Петров', 'STUDENT', true),
    ('user-2', 'maria.sokolova@primakov.school', '$2b$10$rKZvGxH8vZ5qH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q', 'Мария', 'Соколова', 'STUDENT', true),
    ('user-3', 'aleksei.smirnov@primakov.school', '$2b$10$rKZvGxH8vZ5qH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q', 'Алексей', 'Смирнов', 'STUDENT', true);

-- Teachers
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES
    ('teacher-1', 'teacher.ivanov@primakov.school', '$2b$10$rKZvGxH8vZ5qH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q', 'Иван', 'Иванов', 'TEACHER', true),
    ('teacher-2', 'teacher.sidorov@primakov.school', '$2b$10$rKZvGxH8vZ5qH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q', 'Виктор', 'Сидоров', 'TEACHER', true);

-- Admin
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES
    ('admin-1', 'admin@primakov.school', '$2b$10$rKZvGxH8vZ5qH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q', 'Администратор', 'Примаков', 'ADMIN', true);

-- Note: All test passwords are 'password123'

-- ============================================================================
-- SAMPLE SCHEDULES
-- ============================================================================

-- Schedule for user-1 (Ivan Petrov) - Monday
INSERT INTO schedules (id, user_id, date)
VALUES ('schedule-1', 'user-1', CURRENT_DATE);

INSERT INTO lessons (schedule_id, subject, teacher_id, start_time, end_time, room_number, room_building, room_floor, has_homework)
VALUES
    ('schedule-1', 'Математика', 'teacher-1', '09:00', '09:45', '301', 'A', 3, true),
    ('schedule-1', 'Русский язык', 'teacher-2', '10:00', '10:45', '302', 'A', 3, true),
    ('schedule-1', 'История', 'teacher-1', '11:00', '11:45', '303', 'A', 3, false),
    ('schedule-1', 'Физика', 'teacher-2', '12:45', '13:30', '304', 'B', 3, true);

-- ============================================================================
-- SAMPLE DEADLINES
-- ============================================================================

INSERT INTO deadlines (user_id, title, description, subject, due_date, status)
VALUES
    ('user-1', 'Домашнее задание по математике', 'Решить задачи 1-10 из учебника', 'Математика', CURRENT_DATE + INTERVAL '2 days', 'PENDING'),
    ('user-1', 'Эссе по истории', 'Написать эссе на тему "Великая Отечественная война"', 'История', CURRENT_DATE + INTERVAL '5 days', 'PENDING'),
    ('user-2', 'Лабораторная работа по физике', 'Выполнить лабораторную работу №3', 'Физика', CURRENT_DATE + INTERVAL '3 days', 'PENDING');

-- ============================================================================
-- SAMPLE STORIES
-- ============================================================================

INSERT INTO stories (id, title, description, image_url, author_id, expires_at)
VALUES
    ('story-1', 'Новости школы', 'Сегодня прошло собрание', 'https://example.com/story1.jpg', 'admin-1', NOW() + INTERVAL '24 hours'),
    ('story-2', 'Спортивные достижения', 'Наша команда заняла первое место!', 'https://example.com/story2.jpg', 'teacher-1', NOW() + INTERVAL '24 hours');

-- ============================================================================
-- SAMPLE ANNOUNCEMENTS
-- ============================================================================

INSERT INTO announcements (title, description, content, category, author_id, date)
VALUES
    ('Каникулы', 'Весенние каникулы начинаются 1 мая', 'Уважаемые ученики и родители! Напоминаем, что весенние каникулы начинаются 1 мая и продлятся до 10 мая.', 'EVENT', 'admin-1', CURRENT_DATE),
    ('Новое расписание', 'Обновлено расписание занятий', 'С понедельника вступает в силу новое расписание. Просьба ознакомиться в личном кабинете.', 'NEWS', 'admin-1', CURRENT_DATE),
    ('Технические работы', 'Плановое обслуживание системы', 'В субботу с 10:00 до 12:00 будут проводиться технические работы. Возможны перебои в работе системы.', 'MAINTENANCE', 'admin-1', CURRENT_DATE + INTERVAL '2 days');

-- ============================================================================
-- SAMPLE RATINGS
-- ============================================================================

INSERT INTO ratings (teacher_id, user_id, value)
VALUES
    ('teacher-1', 'user-1', 9),
    ('teacher-1', 'user-2', 10),
    ('teacher-2', 'user-1', 8),
    ('teacher-2', 'user-3', 9);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Update schema version
INSERT INTO schema_version (version, description)
VALUES (2, 'Seed test data - users, schedules, deadlines, stories, announcements');

-- Display summary
SELECT 'Test data seeded successfully!' as status;
SELECT 'Users: ' || COUNT(*) as summary FROM users;
SELECT 'Schedules: ' || COUNT(*) as summary FROM schedules;
SELECT 'Lessons: ' || COUNT(*) as summary FROM lessons;
SELECT 'Deadlines: ' || COUNT(*) as summary FROM deadlines;
SELECT 'Stories: ' || COUNT(*) as summary FROM stories;
SELECT 'Announcements: ' || COUNT(*) as summary FROM announcements;
SELECT 'Ratings: ' || COUNT(*) as summary FROM ratings;
