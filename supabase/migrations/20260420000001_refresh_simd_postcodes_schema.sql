-- Refresh simd_postcodes schema in preparation for the 2026 live-postcode
-- reseed (NRS SPD 2026/1 joined with SIMD 2020v2 rankings).
--
-- Why: the original seed (Jan 2026) used the gov.scot SIMD 2020v2 postcode
-- lookup alone, which retained terminated postcodes (e.g. AB2 2AE recoded in
-- 1996) and lacked post-2020 live postcodes. The reseed drops ~65k dead rows
-- and keeps live Scottish postcodes only. This migration adds the columns
-- the app needs for the new data shape; data replacement happens in the
-- separate bulk-insert step (see scripts/apply-simd-refresh.mjs).
--
-- Columns added:
--   postcode_normalised  generated STORED, no-space uppercase; app queries
--                        key on this so callers can pass either "G34 9AJ"
--                        or "G349AJ" and resolve to the same row.
--   simd_rank            integer, SIMD 2020v2 overall rank (1 = most deprived)
--   simd_quintile        integer, 1-5 denormalised (avoids CEIL on read)
--   source               text, provenance tag (e.g. NRS_SPD_2026_1+SIMD_2020v2_2025update)
--   imported_at          timestamptz, when this row was inserted in the refresh

ALTER TABLE simd_postcodes
  ADD COLUMN IF NOT EXISTS postcode_normalised text
    GENERATED ALWAYS AS (UPPER(REPLACE(postcode, ' ', ''))) STORED;

ALTER TABLE simd_postcodes
  ADD COLUMN IF NOT EXISTS simd_rank integer;

ALTER TABLE simd_postcodes
  ADD COLUMN IF NOT EXISTS simd_quintile integer;

ALTER TABLE simd_postcodes
  ADD COLUMN IF NOT EXISTS source text;

ALTER TABLE simd_postcodes
  ADD COLUMN IF NOT EXISTS imported_at timestamptz;

CREATE INDEX IF NOT EXISTS simd_postcodes_postcode_normalised_idx
  ON simd_postcodes (postcode_normalised);
