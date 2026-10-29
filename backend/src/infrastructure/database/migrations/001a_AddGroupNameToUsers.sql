-- Add group_name column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS group_name VARCHAR(50);
