-- ============================================================================
-- Migration 001: Initial Schema
-- ============================================================================
-- Creates all tables, enums, indexes, constraints, triggers, and views
-- for PrimakovApp database
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'SUPERADMIN');
CREATE TYPE deadline_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');
CREATE TYPE announcement_category AS ENUM ('EVENT', 'NEWS', 'MAINTENANCE', 'IMPORTANT');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    vk_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- Schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX idx_schedules_date ON schedules(date);

-- Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_building VARCHAR(20) NOT NULL,
    room_floor INTEGER NOT NULL,
    has_homework BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_schedule ON lessons(schedule_id);
CREATE INDEX idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX idx_lessons_time ON lessons(start_time, end_time);

-- Deadlines
CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100),
    due_date TIMESTAMPTZ NOT NULL,
    status deadline_status NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deadlines_user ON deadlines(user_id);
CREATE INDEX idx_deadlines_status ON deadlines(status);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_user_status ON deadlines(user_id, status);

-- Ratings
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 10),
    version INTEGER NOT NULL DEFAULT 0,
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_teacher_rating UNIQUE (user_id, teacher_id)
);

CREATE INDEX idx_ratings_teacher ON ratings(teacher_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_created ON ratings(created_at DESC);

-- Stories
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_stories_expires ON stories(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_stories_author ON stories(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stories_created ON stories(created_at DESC) WHERE deleted_at IS NULL;

-- Story Views
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_story_user_view UNIQUE (story_id, user_id)
);

CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_story_views_user ON story_views(user_id);

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    date DATE NOT NULL,
    category announcement_category NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_announcements_category ON announcements(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_date ON announcements(date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_author ON announcements(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_created ON announcements(created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW active_users AS
SELECT id, email, first_name, last_name, role, is_active, vk_id, created_at, updated_at
FROM users
WHERE deleted_at IS NULL;

CREATE VIEW active_stories AS
SELECT id, title, description, image_url, video_url, author_id, created_at, expires_at
FROM stories
WHERE deleted_at IS NULL AND expires_at > NOW();

CREATE VIEW active_announcements AS
SELECT id, title, description, content, image_url, date, category, author_id, created_at
FROM announcements
WHERE deleted_at IS NULL;

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL
);

INSERT INTO schema_version (version, description)
VALUES (1, 'Initial schema with all tables, indexes, and constraints');
