-- ============================================================================
-- PrimakovApp Database Schema
-- PostgreSQL 14+
-- ============================================================================
-- This script creates the complete database schema for PrimakovApp
-- including all tables, enums, indexes, and constraints.
--
-- Usage:
--   psql -U postgres -d primakov_app -f init.sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'SUPERADMIN');

-- Deadline status
CREATE TYPE deadline_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- Announcement categories
CREATE TYPE announcement_category AS ENUM ('EVENT', 'NEWS', 'MAINTENANCE', 'IMPORTANT');

-- Request types
CREATE TYPE request_type AS ENUM ('IT', 'MAINTENANCE', 'CLEANING');

-- Request status
CREATE TYPE request_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Request priority
CREATE TYPE request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Meal types
CREATE TYPE meal_type AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table
-- Stores all user accounts (students, teachers, admins)
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

-- Index for email lookup (authentication)
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Index for active users filtering
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- Index for role-based queries
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

COMMENT ON TABLE users IS 'User accounts with authentication and role-based access';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hash of user password (10 rounds)';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp - NULL means active user';

-- ============================================================================

-- Rooms table
-- Reference table for all rooms/classrooms in campus
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100),
    building VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    capacity INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rooms
CREATE INDEX idx_rooms_building_floor ON rooms(building, floor);
CREATE INDEX idx_rooms_number ON rooms(number);
CREATE INDEX idx_rooms_active ON rooms(is_active) WHERE is_active = true;

COMMENT ON TABLE rooms IS 'Reference table for all rooms/classrooms in campus - used for navigation and schedule';
COMMENT ON COLUMN rooms.number IS 'Room number (e.g., "301", "A-205")';
COMMENT ON COLUMN rooms.name IS 'Optional room name (e.g., "Physics Lab", "Assembly Hall")';
COMMENT ON COLUMN rooms.capacity IS 'Maximum number of people';
COMMENT ON COLUMN rooms.latitude IS 'GPS latitude for navigation';
COMMENT ON COLUMN rooms.longitude IS 'GPS longitude for navigation';

-- ============================================================================

-- Schedules table
-- Individual schedules per user (each student has their own schedule)
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for user + date lookup (most common query)
CREATE INDEX idx_schedules_user_date ON schedules(user_id, date);

-- Index for date-based queries
CREATE INDEX idx_schedules_date ON schedules(date);

COMMENT ON TABLE schedules IS 'Individual daily schedules per user - students can have different subjects on same day';
COMMENT ON COLUMN schedules.user_id IS 'User (student) who owns this schedule';

-- ============================================================================

-- Lessons table
-- Individual lessons within schedules
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    room_number VARCHAR(20) NOT NULL,
    room_building VARCHAR(20) NOT NULL,
    room_floor INTEGER NOT NULL,
    has_homework BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for schedule lookup
CREATE INDEX idx_lessons_schedule ON lessons(schedule_id);

-- Index for teacher's lessons
CREATE INDEX idx_lessons_teacher ON lessons(teacher_id);

-- Index for time-based queries
CREATE INDEX idx_lessons_time ON lessons(start_time, end_time);

-- Index for room lookup
CREATE INDEX idx_lessons_room ON lessons(room_id);

COMMENT ON TABLE lessons IS 'Individual lessons within schedules - embeds TimeSlot and Room value objects';
COMMENT ON COLUMN lessons.start_time IS 'Lesson start time (TimeSlot value object)';
COMMENT ON COLUMN lessons.end_time IS 'Lesson end time (TimeSlot value object)';
COMMENT ON COLUMN lessons.room_id IS 'Reference to rooms table (preferred over embedded fields)';
COMMENT ON COLUMN lessons.room_number IS 'Room number (Room value object - kept for backward compatibility)';
COMMENT ON COLUMN lessons.room_building IS 'Building identifier (Room value object - kept for backward compatibility)';
COMMENT ON COLUMN lessons.room_floor IS 'Floor number (Room value object - kept for backward compatibility)';

-- ============================================================================

-- Deadlines table
-- Student deadlines and tasks
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

-- Index for user's deadlines (most common query)
CREATE INDEX idx_deadlines_user ON deadlines(user_id);

-- Index for status filtering
CREATE INDEX idx_deadlines_status ON deadlines(status);

-- Index for due date sorting
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);

-- Composite index for user + status queries
CREATE INDEX idx_deadlines_user_status ON deadlines(user_id, status);

COMMENT ON TABLE deadlines IS 'Student deadlines and tasks with status tracking';
COMMENT ON COLUMN deadlines.status IS 'Current status: PENDING, COMPLETED, or OVERDUE';

-- ============================================================================

-- Ratings table
-- Teacher ratings by students
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

-- Index for teacher's ratings (aggregation queries)
CREATE INDEX idx_ratings_teacher ON ratings(teacher_id);

-- Index for user's ratings
CREATE INDEX idx_ratings_user ON ratings(user_id);

-- Index for recent ratings
CREATE INDEX idx_ratings_created ON ratings(created_at DESC);

COMMENT ON TABLE ratings IS 'Teacher ratings by students with optimistic locking';
COMMENT ON COLUMN ratings.value IS 'Rating value from 1 to 10';
COMMENT ON COLUMN ratings.version IS 'Optimistic locking version counter';
COMMENT ON COLUMN ratings.ip_hash IS 'Hashed IP address for abuse prevention';
COMMENT ON CONSTRAINT unique_user_teacher_rating ON ratings IS 'One rating per student-teacher pair';

-- ============================================================================

-- Stories table
-- Temporary stories with expiration (like Instagram stories)
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

-- Index for active stories (expires_at > NOW())
CREATE INDEX idx_stories_expires ON stories(expires_at) WHERE deleted_at IS NULL;

-- Index for author's stories
CREATE INDEX idx_stories_author ON stories(author_id) WHERE deleted_at IS NULL;

-- Index for recent stories
CREATE INDEX idx_stories_created ON stories(created_at DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE stories IS 'Temporary stories with expiration - soft delete enabled';
COMMENT ON COLUMN stories.expires_at IS 'Story expiration timestamp - stories auto-hide after this time';
COMMENT ON COLUMN stories.deleted_at IS 'Soft delete timestamp';

-- ============================================================================

-- Story views junction table
-- Tracks which users have viewed which stories (many-to-many)
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_story_user_view UNIQUE (story_id, user_id)
);

-- Index for story's viewers
CREATE INDEX idx_story_views_story ON story_views(story_id);

-- Index for user's viewed stories
CREATE INDEX idx_story_views_user ON story_views(user_id);

COMMENT ON TABLE story_views IS 'Junction table tracking story views - implements viewedBy array from domain model';
COMMENT ON CONSTRAINT unique_story_user_view ON story_views IS 'One view record per user-story pair';

-- ============================================================================

-- Announcements table
-- School announcements and news
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

-- Index for category filtering (common query)
CREATE INDEX idx_announcements_category ON announcements(category) WHERE deleted_at IS NULL;

-- Index for date sorting
CREATE INDEX idx_announcements_date ON announcements(date DESC) WHERE deleted_at IS NULL;

-- Index for author's announcements
CREATE INDEX idx_announcements_author ON announcements(author_id) WHERE deleted_at IS NULL;

-- Index for recent announcements
CREATE INDEX idx_announcements_created ON announcements(created_at DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE announcements IS 'School announcements and news - soft delete enabled';
COMMENT ON COLUMN announcements.category IS 'Announcement type: EVENT, NEWS, MAINTENANCE, or IMPORTANT';
COMMENT ON COLUMN announcements.deleted_at IS 'Soft delete timestamp';

-- ============================================================================

-- Requests table
-- Tickets for IT support, maintenance, and cleaning
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type request_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'PENDING',
    priority request_priority NOT NULL DEFAULT 'MEDIUM',
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- Indexes for requests
CREATE INDEX idx_requests_creator ON requests(creator_id);
CREATE INDEX idx_requests_assignee ON requests(assignee_id);
CREATE INDEX idx_requests_room ON requests(room_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created ON requests(created_at DESC);
CREATE INDEX idx_requests_status_priority ON requests(status, priority);

COMMENT ON TABLE requests IS 'Tickets for IT support, maintenance, and cleaning requests';
COMMENT ON COLUMN requests.type IS 'Request type: IT (technical issues), MAINTENANCE (repairs), CLEANING (housekeeping)';
COMMENT ON COLUMN requests.status IS 'Current status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED';
COMMENT ON COLUMN requests.priority IS 'Priority level: LOW, MEDIUM, HIGH, URGENT';
COMMENT ON COLUMN requests.creator_id IS 'User who created the request';
COMMENT ON COLUMN requests.assignee_id IS 'Staff member assigned to handle the request';
COMMENT ON COLUMN requests.room_id IS 'Room/location where issue is located';

-- ============================================================================

-- Canteen Menu table
-- Daily menu organized by meal type
CREATE TABLE canteen_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    meal_type meal_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_date_meal_type UNIQUE (date, meal_type)
);

-- Indexes for canteen_menu
CREATE INDEX idx_canteen_menu_date ON canteen_menu(date DESC);
CREATE INDEX idx_canteen_menu_date_type ON canteen_menu(date, meal_type);
CREATE INDEX idx_canteen_menu_active ON canteen_menu(is_active) WHERE is_active = true;

COMMENT ON TABLE canteen_menu IS 'Daily canteen menu organized by meal type';
COMMENT ON COLUMN canteen_menu.meal_type IS 'Type of meal: BREAKFAST, LUNCH, DINNER, SNACK';
COMMENT ON CONSTRAINT unique_date_meal_type ON canteen_menu IS 'One menu per date and meal type';

-- ============================================================================

-- Menu Items table
-- Individual dishes in canteen menu
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES canteen_menu(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    calories INTEGER,
    protein DECIMAL(5, 2),
    carbs DECIMAL(5, 2),
    fat DECIMAL(5, 2),
    weight INTEGER,
    price DECIMAL(10, 2),
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    allergens TEXT[],
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for menu_items
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_order ON menu_items(menu_id, display_order);

COMMENT ON TABLE menu_items IS 'Individual dishes/items in canteen menu';
COMMENT ON COLUMN menu_items.category IS 'Dish category (e.g., "Салаты", "Горячее", "Десерты")';
COMMENT ON COLUMN menu_items.calories IS 'Calories per serving (kcal)';
COMMENT ON COLUMN menu_items.protein IS 'Protein content (grams)';
COMMENT ON COLUMN menu_items.carbs IS 'Carbohydrates content (grams)';
COMMENT ON COLUMN menu_items.fat IS 'Fat content (grams)';
COMMENT ON COLUMN menu_items.weight IS 'Serving weight (grams)';
COMMENT ON COLUMN menu_items.allergens IS 'Array of allergens (e.g., {"gluten", "dairy", "nuts"})';
COMMENT ON COLUMN menu_items.display_order IS 'Order for displaying items in menu';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
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

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canteen_menu_updated_at
    BEFORE UPDATE ON canteen_menu
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row modification';

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active users view (excludes soft-deleted users)
CREATE VIEW active_users AS
SELECT id, email, first_name, last_name, role, is_active, vk_id, created_at, updated_at
FROM users
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_users IS 'Active users only - excludes soft-deleted accounts';

-- Active stories view (not expired and not deleted)
CREATE VIEW active_stories AS
SELECT id, title, description, image_url, video_url, author_id, created_at, expires_at
FROM stories
WHERE deleted_at IS NULL AND expires_at > NOW();

COMMENT ON VIEW active_stories IS 'Active stories - not expired and not soft-deleted';

-- Active announcements view (excludes soft-deleted)
CREATE VIEW active_announcements AS
SELECT id, title, description, content, image_url, date, category, author_id, created_at
FROM announcements
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_announcements IS 'Active announcements - excludes soft-deleted';

-- Active requests view (excludes completed and cancelled)
CREATE VIEW active_requests AS
SELECT id, type, title, description, status, priority, creator_id, assignee_id, room_id, created_at, updated_at
FROM requests
WHERE status NOT IN ('COMPLETED', 'CANCELLED')
ORDER BY priority DESC, created_at ASC;

COMMENT ON VIEW active_requests IS 'Active requests only - excludes completed and cancelled';

-- Today's menu view
CREATE VIEW todays_menu AS
SELECT
    cm.id as menu_id,
    cm.date,
    cm.meal_type,
    mi.id as item_id,
    mi.name,
    mi.description,
    mi.category,
    mi.calories,
    mi.protein,
    mi.carbs,
    mi.fat,
    mi.weight,
    mi.price,
    mi.is_vegetarian,
    mi.is_vegan,
    mi.allergens,
    mi.display_order
FROM canteen_menu cm
LEFT JOIN menu_items mi ON cm.id = mi.menu_id
WHERE cm.date = CURRENT_DATE AND cm.is_active = true
ORDER BY cm.meal_type, mi.display_order;

COMMENT ON VIEW todays_menu IS 'Today''s complete menu with all items';

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL
);

INSERT INTO schema_version (version, description) VALUES (1, 'Initial schema with all tables, indexes, and constraints');
INSERT INTO schema_version (version, description) VALUES (3, 'Added rooms, requests, and canteen menu tables for PROJECT_VISION features');

COMMENT ON TABLE schema_version IS 'Tracks database schema version for migrations';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
