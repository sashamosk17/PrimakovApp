CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  version INTEGER NOT NULL DEFAULT 0,
  ip_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ratings_teacher_id ON ratings(teacher_id);
