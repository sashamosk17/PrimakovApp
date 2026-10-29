-- Add homework_description column to lessons table
-- Migration: 015_AddHomeworkDescriptionToLessons.sql
-- Date: 2026-05-01

ALTER TABLE lessons
ADD COLUMN homework_description TEXT;

COMMENT ON COLUMN lessons.homework_description IS 'Description of homework assignment for this lesson';
