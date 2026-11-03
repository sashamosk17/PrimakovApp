-- Migration: 027_CreateHouseAndBoardingTables.sql
-- Add house and is_boarding columns to users table, create house_point_transactions, boarding_checkins, and weekend_leave_requests tables.

ALTER TABLE users ADD COLUMN IF NOT EXISTS house VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_boarding BOOLEAN DEFAULT false;

-- House system point transactions
CREATE TABLE IF NOT EXISTS house_point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house VARCHAR(20) NOT NULL CHECK (house IN ('NORTH', 'SOUTH', 'EAST', 'WEST')),
  points INTEGER NOT NULL CHECK (points > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('ACADEMIC', 'OLYMPIAD', 'SPORTS', 'CHARITY', 'CULTURE')),
  reason TEXT NOT NULL,
  awarded_by UUID NOT NULL REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_house_transactions_house ON house_point_transactions(house);
CREATE INDEX IF NOT EXISTS idx_house_transactions_created ON house_point_transactions(created_at DESC);

-- Boarding check-ins
CREATE TABLE IF NOT EXISTS boarding_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boarding_checkins_student ON boarding_checkins(student_id);
CREATE INDEX IF NOT EXISTS idx_boarding_checkins_time ON boarding_checkins(check_in_time DESC);

-- Weekend leave requests
CREATE TABLE IF NOT EXISTS weekend_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  departure_date VARCHAR(50) NOT NULL,
  return_date VARCHAR(50) NOT NULL,
  transport_type VARCHAR(20) NOT NULL CHECK (transport_type IN ('SHUTTLE', 'PARENTS', 'INDEPENDENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  guardian_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekend_leave_student ON weekend_leave_requests(student_id);

