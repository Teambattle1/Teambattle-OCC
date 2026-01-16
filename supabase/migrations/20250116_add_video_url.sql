-- =====================================================
-- ADD VIDEO_URL COLUMN TO GUIDE_SECTIONS
-- =====================================================

-- Add video_url column if it doesn't exist
ALTER TABLE guide_sections ADD COLUMN IF NOT EXISTS video_url TEXT;

-- =====================================================
-- Done! video_url column is ready for YouTube embeds.
-- =====================================================
