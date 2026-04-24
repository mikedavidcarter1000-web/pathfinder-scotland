-- Add human-readable slug columns to subjects, career_sectors, career_roles.
-- Regenerate courses.slug to be globally unique (previously per-university).
-- universities.slug already exists and is globally unique; no change.

-- Slug helper: lowercase, ASCII-fold common accents, collapse to [a-z0-9-].
CREATE OR REPLACE FUNCTION public.pf_slugify(input TEXT) RETURNS TEXT AS $$
DECLARE
  s TEXT;
BEGIN
  s := LOWER(COALESCE(input, ''));
  s := TRANSLATE(
    s,
    'áàäâãåāăąćčĉçďđéèëêēĕėęěĝğģĥíìïîĩīĭįĵķĺľłńňñóòöôõøōŏőŕřśšşťţúùüûũūŭůűųŵýÿŷźžż',
    'aaaaaaaaacccccddeeeeeeeeegggghiiiiiiiijklllnnnoooooooooorrsssttuuuuuuuuuuwyyyzzz'
  );
  s := REGEXP_REPLACE(s, '[^a-z0-9]+', '-', 'g');
  s := REGEXP_REPLACE(s, '^-+|-+$', '', 'g');
  RETURN s;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE subjects SET slug = public.pf_slugify(name) WHERE slug IS NULL OR slug = '';
ALTER TABLE subjects ADD CONSTRAINT subjects_slug_key UNIQUE (slug);
ALTER TABLE subjects ALTER COLUMN slug SET NOT NULL;

-- career_sectors
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE career_sectors SET slug = public.pf_slugify(name) WHERE slug IS NULL OR slug = '';
ALTER TABLE career_sectors ADD CONSTRAINT career_sectors_slug_key UNIQUE (slug);
ALTER TABLE career_sectors ALTER COLUMN slug SET NOT NULL;

-- career_roles: base slug from title, append sector slug on collision
ALTER TABLE career_roles ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE career_roles SET slug = public.pf_slugify(title) WHERE slug IS NULL OR slug = '';
WITH dups AS (
  SELECT r.id,
         r.slug AS base_slug,
         cs.slug AS sector_slug,
         ROW_NUMBER() OVER (PARTITION BY r.slug ORDER BY r.id) AS rn
  FROM career_roles r
  JOIN career_sectors cs ON cs.id = r.career_sector_id
)
UPDATE career_roles r
SET slug = dups.base_slug || '-' || dups.sector_slug
FROM dups
WHERE dups.id = r.id AND dups.rn > 1;
-- any remaining collisions get a numeric suffix
WITH dups2 AS (
  SELECT id, slug,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) AS rn
  FROM career_roles
)
UPDATE career_roles r
SET slug = dups2.slug || '-' || (dups2.rn - 1)
FROM dups2
WHERE dups2.id = r.id AND dups2.rn > 1;
ALTER TABLE career_roles ADD CONSTRAINT career_roles_slug_key UNIQUE (slug);
ALTER TABLE career_roles ALTER COLUMN slug SET NOT NULL;

-- courses: regenerate to be globally unique (name + university slug)
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_university_id_slug_key;
UPDATE courses c
SET slug = public.pf_slugify(c.name) || '-' || u.slug
FROM universities u
WHERE u.id = c.university_id;
-- handle any remaining duplicates with numeric suffix
WITH dups AS (
  SELECT id, slug,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) AS rn
  FROM courses
)
UPDATE courses c
SET slug = dups.slug || '-' || (dups.rn - 1)
FROM dups
WHERE dups.id = c.id AND dups.rn > 1;
ALTER TABLE courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);
ALTER TABLE courses ALTER COLUMN slug SET NOT NULL;

-- indexes for slug-based lookups
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);
CREATE INDEX IF NOT EXISTS idx_career_sectors_slug ON career_sectors(slug);
CREATE INDEX IF NOT EXISTS idx_career_roles_slug ON career_roles(slug);
-- universities.slug and courses.slug already have unique-constraint backing indexes
