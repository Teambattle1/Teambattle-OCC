-- =====================================================
-- ADD LINKED_PACKING_LIST COLUMN TO GUIDE_SECTIONS
-- =====================================================

-- Add linked_packing_list column if it doesn't exist
ALTER TABLE guide_sections ADD COLUMN IF NOT EXISTS linked_packing_list TEXT;

-- =====================================================
-- Done! linked_packing_list column is ready.
-- Format: "activity:list_type" e.g. "teamconstruct:afgang"
-- =====================================================
