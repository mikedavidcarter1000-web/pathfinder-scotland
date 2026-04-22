-- ============================================================================
-- Add slug column to bursaries for detail page routing
-- ============================================================================

ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs from existing names:
-- lowercase, replace non-alphanumeric with hyphens, collapse multiples, trim
UPDATE bursaries
SET slug = TRIM(BOTH '-' FROM
  regexp_replace(
    regexp_replace(
      lower(name),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-{2,}', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE after populating
ALTER TABLE bursaries ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bursaries_slug ON bursaries (slug);
