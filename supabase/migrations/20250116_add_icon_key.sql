-- =====================================================
-- ADD ICON_KEY COLUMN TO GUIDE_SECTIONS
-- =====================================================

-- Add icon_key column if it doesn't exist
ALTER TABLE guide_sections ADD COLUMN IF NOT EXISTS icon_key TEXT;

-- =====================================================
-- Done! icon_key column is ready.
-- =====================================================
