-- Add link fields to stories table
ALTER TABLE stories 
ADD COLUMN link_url TEXT,
ADD COLUMN link_text TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_link_url ON stories(link_url) WHERE link_url IS NOT NULL;