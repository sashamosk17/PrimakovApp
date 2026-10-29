-- ============================================================================
-- Migration 003: Vision Features
-- ============================================================================
-- Adds new tables for PROJECT_VISION.md features:
-- 1. Rooms reference table (for navigation and schedule)
-- 2. Requests/Tickets system (IT and maintenance)
-- 3. Canteen Menu system (meals and nutrition)
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Request types
CREATE TYPE request_type AS ENUM ('IT', 'MAINTENANCE', 'CLEANING');

-- Request status
CREATE TYPE request_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Request priority
CREATE TYPE request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Meal types
CREATE TYPE meal_type AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- ============================================================================
-- TABLE: rooms (Reference table for navigation and schedule)
-- ============================================================================

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
-- UPDATE: lessons table to use room_id FK
-- ============================================================================

-- Add room_id column
ALTER TABLE lessons ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

-- Create index for room lookup
CREATE INDEX idx_lessons_room ON lessons(room_id);

-- Note: Old room fields (room_number, room_building, room_floor) are kept for backward compatibility
-- They can be removed in a future migration after data migration

COMMENT ON COLUMN lessons.room_id IS 'Reference to rooms table - replaces embedded room fields';

-- ============================================================================
-- TABLE: requests (IT and maintenance tickets)
-- ============================================================================

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
-- TABLE: canteen_menu (Daily menu)
-- ============================================================================

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
-- TABLE: menu_items (Dishes in menu)
-- ============================================================================

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

-- Auto-update updated_at for rooms
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for requests
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for canteen_menu
CREATE TRIGGER update_canteen_menu_updated_at
    BEFORE UPDATE ON canteen_menu
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

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
-- SEED DATA (Sample rooms for testing)
-- ============================================================================

INSERT INTO rooms (id, number, name, building, floor, capacity, latitude, longitude, description) VALUES
    ('room-301', '301', 'Кабинет математики', 'A', 3, 30, 55.751244, 37.618423, 'Основной кабинет математики'),
    ('room-302', '302', 'Кабинет физики', 'A', 3, 25, 55.751244, 37.618423, 'Кабинет физики с лабораторией'),
    ('room-303', '303', 'Кабинет химии', 'A', 3, 25, 55.751244, 37.618423, 'Кабинет химии с лабораторией'),
    ('room-401', '401', 'Актовый зал', 'B', 4, 200, 55.751244, 37.618423, 'Большой актовый зал для мероприятий'),
    ('room-gym', 'GYM', 'Спортивный зал', 'C', 1, 100, 55.751244, 37.618423, 'Основной спортивный зал');

-- ============================================================================
-- SEED DATA (Sample canteen menu for testing)
-- ============================================================================

-- Today's lunch menu
INSERT INTO canteen_menu (id, date, meal_type) VALUES
    ('menu-lunch-today', CURRENT_DATE, 'LUNCH');

INSERT INTO menu_items (menu_id, name, description, category, calories, protein, carbs, fat, weight, price, display_order) VALUES
    ('menu-lunch-today', 'Борщ', 'Традиционный борщ со сметаной', 'Первое блюдо', 150, 8.5, 12.0, 6.0, 300, 120.00, 1),
    ('menu-lunch-today', 'Котлета куриная с гречкой', 'Котлета из куриного филе с гречневой кашей', 'Горячее', 450, 35.0, 45.0, 15.0, 350, 250.00, 2),
    ('menu-lunch-today', 'Салат Цезарь', 'Салат с курицей, сыром и соусом', 'Салаты', 280, 18.0, 12.0, 18.0, 200, 180.00, 3),
    ('menu-lunch-today', 'Компот из сухофруктов', 'Домашний компот', 'Напитки', 80, 0.5, 20.0, 0.0, 250, 50.00, 4);

-- ============================================================================
-- SEED DATA (Sample requests for testing)
-- ============================================================================

INSERT INTO requests (type, title, description, status, priority, creator_id, assignee_id, room_id) VALUES
    ('IT', 'Не работает проектор', 'В кабинете 301 не включается проектор, нужна помощь', 'PENDING', 'HIGH', 'user-1', 'teacher-1', 'room-301'),
    ('MAINTENANCE', 'Сломана парта', 'В кабинете 302 сломана парта, нужен ремонт', 'IN_PROGRESS', 'MEDIUM', 'user-2', 'teacher-2', 'room-302'),
    ('CLEANING', 'Требуется уборка', 'После мероприятия в актовом зале требуется уборка', 'PENDING', 'LOW', 'admin-1', NULL, 'room-401');

-- ============================================================================
-- UPDATE SCHEMA VERSION
-- ============================================================================

INSERT INTO schema_version (version, description)
VALUES (3, 'Added rooms, requests, and canteen menu tables for PROJECT_VISION features');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Migration 003 completed successfully!' as status;
SELECT 'New tables: rooms, requests, canteen_menu, menu_items' as info;
SELECT 'Rooms: ' || COUNT(*) as summary FROM rooms;
SELECT 'Requests: ' || COUNT(*) as summary FROM requests;
SELECT 'Menu items: ' || COUNT(*) as summary FROM menu_items;
