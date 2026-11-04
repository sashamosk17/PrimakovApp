-- Migration: 028_CreateServiceRequestsTable.sql
-- Create requests table for persistent Campus Helpdesk with SLA tracking

-- Ensure users columns for boarding and houses exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS house VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_boarding BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS room_number VARCHAR(50);

-- Drop any legacy views that depend on requests columns before modifying types
DROP VIEW IF EXISTS active_requests CASCADE;
DROP VIEW IF EXISTS service_requests CASCADE;

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  room_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  sla_deadline_at TIMESTAMPTZ,
  sla_breached BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

-- Upgrade existing requests table if created from legacy init.sql
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sla_deadline_at TIMESTAMPTZ;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop foreign key constraints on room_id referencing rooms(id)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'requests'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'room_id'
  ) LOOP
    EXECUTE 'ALTER TABLE requests DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;

ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_room_id_fkey;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS fk_requests_room;
DROP INDEX IF EXISTS idx_requests_room;

ALTER TABLE requests ALTER COLUMN room_id TYPE VARCHAR(100) USING room_id::text;
ALTER TABLE requests ALTER COLUMN type TYPE VARCHAR(30) USING type::text;
ALTER TABLE requests ALTER COLUMN status TYPE VARCHAR(30) USING status::text;
ALTER TABLE requests ALTER COLUMN priority TYPE VARCHAR(20) USING priority::text;

CREATE INDEX IF NOT EXISTS idx_requests_room ON requests(room_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_creator ON requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_requests_assignee ON requests(assignee_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- Recreate active_requests and service_requests views cleanly
CREATE OR REPLACE VIEW active_requests AS
SELECT id, type, title, description, status, priority, creator_id, assignee_id, room_id, created_at, updated_at
FROM requests
WHERE status NOT IN ('COMPLETED', 'CANCELLED')
ORDER BY priority DESC, created_at ASC;

DROP TABLE IF EXISTS service_requests CASCADE;
CREATE OR REPLACE VIEW service_requests AS SELECT * FROM requests;
