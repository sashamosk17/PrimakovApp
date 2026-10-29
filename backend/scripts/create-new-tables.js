const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakov'
});

async function createTables() {
  try {
    console.log('🔄 Creating new tables...\n');

    // Create enums
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE request_type AS ENUM ('IT', 'MAINTENANCE', 'CLEANING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE request_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE meal_type AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('✓ Enums created');

    // Create rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100),
        building VARCHAR(20) NOT NULL,
        floor INTEGER NOT NULL,
        capacity INTEGER,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ rooms table created');

    // Create requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type request_type NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status request_status DEFAULT 'PENDING',
        priority request_priority DEFAULT 'MEDIUM',
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        notes TEXT
      );
    `);
    console.log('✓ requests table created');

    // Create canteen_menu table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS canteen_menu (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        meal_type meal_type NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (date, meal_type)
      );
    `);
    console.log('✓ canteen_menu table created');

    // Create menu_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_id UUID NOT NULL REFERENCES canteen_menu(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        calories INTEGER,
        protein DECIMAL(5,2),
        carbs DECIMAL(5,2),
        fat DECIMAL(5,2),
        weight INTEGER,
        price DECIMAL(10,2),
        image_url TEXT,
        is_vegetarian BOOLEAN DEFAULT false,
        is_vegan BOOLEAN DEFAULT false,
        allergens TEXT[],
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ menu_items table created');

    // Insert sample rooms
    await pool.query(`
      INSERT INTO rooms (number, name, building, floor, capacity, latitude, longitude, description)
      VALUES
        ('301', 'Кабинет математики', 'A', 3, 30, 55.751244, 37.618423, 'Оборудован интерактивной доской'),
        ('302', 'Кабинет физики', 'A', 3, 28, 55.751250, 37.618430, 'Лаборатория с оборудованием'),
        ('303', 'Кабинет химии', 'A', 3, 25, 55.751256, 37.618437, 'Химическая лаборатория'),
        ('401', 'Актовый зал', 'B', 4, 200, 55.751300, 37.618500, 'Для мероприятий'),
        ('GYM', 'Спортивный зал', 'C', 1, 100, 55.751400, 37.618600, 'Спортивный комплекс')
      ON CONFLICT (number) DO NOTHING;
    `);
    console.log('✓ Sample rooms inserted');

    console.log('\n✅ All tables created successfully!\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTables();
