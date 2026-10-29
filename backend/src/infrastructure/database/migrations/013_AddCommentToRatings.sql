-- Add comment field to ratings table
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS comment TEXT DEFAULT '';
