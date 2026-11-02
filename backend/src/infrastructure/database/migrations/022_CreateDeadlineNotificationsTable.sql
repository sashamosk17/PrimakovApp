-- Migration 022: Create Deadline Notifications Table for Tracking Push Alerts
CREATE TABLE IF NOT EXISTS deadline_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_id UUID NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- '24h', '2h'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_deadline_notification_type UNIQUE (deadline_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_deadline_notifications_lookup
  ON deadline_notifications(deadline_id, notification_type);

