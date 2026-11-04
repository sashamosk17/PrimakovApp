-- Migration: 028_CreateServiceRequestsTable.sql
-- Create requests table for persistent Campus Helpdesk with SLA tracking

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

DO $$
BEGIN
  ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_room_id_fkey;
  ALTER TABLE requests ALTER COLUMN room_id TYPE VARCHAR(100) USING room_id::text;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_creator ON requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_requests_assignee ON requests(assignee_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- View alias for service_requests
DROP VIEW IF EXISTS service_requests;
CREATE OR REPLACE VIEW service_requests AS SELECT * FROM requests;
