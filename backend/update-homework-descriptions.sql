-- Update existing lessons with homework descriptions
-- Run this manually after migration 015

UPDATE lessons
SET homework_description = 'Решить задачи №15-20 из учебника, повторить формулы'
WHERE subject = 'Математика' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Прочитать главу 5, написать краткий конспект'
WHERE subject = 'Литература' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Выучить неправильные глаголы (стр. 45), упражнение 3'
WHERE subject = 'Английский язык' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Подготовить доклад о Великой Отечественной войне'
WHERE subject = 'История' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Решить задачи на законы Ньютона (№10-15)'
WHERE subject = 'Физика' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Написать уравнения реакций, выучить таблицу растворимости'
WHERE subject = 'Химия' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Подготовить презентацию о климате России'
WHERE subject = 'География' AND has_homework = true;

UPDATE lessons
SET homework_description = 'Написать программу для сортировки массива'
WHERE subject = 'Информатика' AND has_homework = true;
