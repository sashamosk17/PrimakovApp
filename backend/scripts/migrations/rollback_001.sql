-- ============================================================================
-- Rollback Migration 001: Drop All Tables
-- ============================================================================
-- WARNING: This will delete ALL data in the database!
-- Use only for development/testing purposes
-- ============================================================================

-- Drop views first
DROP VIEW IF EXISTS active_announcements;
DROP VIEW IF EXISTS active_stories;
DROP VIEW IF EXISTS active_users;

-- Drop tables in reverse order (respecting foreign key dependencies)
DROP TABLE IF EXISTS schema_version;
DROP TABLE IF EXISTS story_views;
DROP TABLE IF EXISTS stories;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS deadlines;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS users;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS update_ratings_updated_at ON ratings;
DROP TRIGGER IF EXISTS update_deadlines_updated_at ON deadlines;
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop enums
DROP TYPE IF EXISTS announcement_category;
DROP TYPE IF EXISTS deadline_status;
DROP TYPE IF EXISTS user_role;

-- Drop extensions (optional - comment out if other databases use it)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

SELECT 'Database rolled back successfully. All tables dropped.' as status;
