-- Migration 014: Align announcements table schema with expected structure
-- Adds missing columns: description, image_url, date
-- Migrates data from published_at to date
-- Keeps published_at for backward compatibility

-- Add missing columns
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS date DATE;

-- Migrate data from published_at to date
UPDATE announcements SET date = published_at::DATE WHERE date IS NULL;

-- Set description from first 200 characters of content
UPDATE announcements
SET description = LEFT(content, 200)
WHERE description IS NULL OR description = '';

-- Make date NOT NULL after data migration
ALTER TABLE announcements ALTER COLUMN date SET NOT NULL;

-- Note: published_at is kept for backward compatibility
