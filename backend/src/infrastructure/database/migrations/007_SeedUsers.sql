-- Seed test users with bcrypt hashed passwords (password123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, group_name, created_at, updated_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ivan.petrov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Иван', 'Петров', 'STUDENT', '10A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'maria.sokolova@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Мария', 'Соколова', 'STUDENT', '10B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'aleksei.smirnov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Алексей', 'Смирнов', 'STUDENT', '11A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'teacher.ivanov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Иван', 'Иванов', 'TEACHER', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'teacher.sidorov@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Виктор', 'Сидоров', 'TEACHER', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'admin@primakov.school', '$2b$10$mK8KNqzJVfCg9K.or.NXOuxFfn4eB5PRMjs.6pamXXYqbtJv4VMsa', 'Администратор', 'Примаков', 'ADMIN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
