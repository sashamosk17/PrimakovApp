CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  teacher_id UUID NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_building VARCHAR(100) NOT NULL,
  floor INTEGER,
  has_homework BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_schedule_id ON lessons(schedule_id);
