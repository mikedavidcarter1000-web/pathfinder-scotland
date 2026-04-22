-- Adds a maturity tier signal to career_roles. Used by the homepage teaser
-- to filter sectors shown to younger students (S2/S3) so the sample only
-- includes sectors with at least one foundational role.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_maturity_tier') THEN
    CREATE TYPE role_maturity_tier AS ENUM ('foundational', 'intermediate', 'specialised');
  END IF;
END$$;

ALTER TABLE career_roles
  ADD COLUMN IF NOT EXISTS maturity_tier role_maturity_tier;

CREATE INDEX IF NOT EXISTS career_roles_maturity_tier_idx
  ON career_roles(maturity_tier)
  WHERE maturity_tier IS NOT NULL;
