-- Migration: 026_CreateGradesTable.sql
-- Create grades table with UUID primary key, student reference, weights, and indexes.

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id VARCHAR(255) NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  value NUMERIC(3, 1) NOT NULL CHECK (value >= 2.0 AND value <= 5.0),
  weight NUMERIC(3, 1) NOT NULL DEFAULT 1.0 CHECK (weight > 0),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period VARCHAR(100) NOT NULL,
  topic VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_student_period ON grades(student_id, period);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);

