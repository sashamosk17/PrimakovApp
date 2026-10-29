CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY,
  group_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_group_date ON schedules(group_id, date);
