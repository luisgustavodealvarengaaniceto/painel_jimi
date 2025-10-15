-- Migration: Add fontSize to slides and fixedContent
-- Date: 2025-10-07

-- Add font_size column to slides table
ALTER TABLE slides 
ADD COLUMN IF NOT EXISTS font_size INTEGER NOT NULL DEFAULT 16;

-- Add font_size column to fixed_content table
ALTER TABLE fixed_content 
ADD COLUMN IF NOT EXISTS font_size INTEGER NOT NULL DEFAULT 14;

-- Comment on columns
COMMENT ON COLUMN slides.font_size IS 'Font size in pixels for slide content (default: 16px)';
COMMENT ON COLUMN fixed_content.font_size IS 'Font size in pixels for fixed content (default: 14px)';
