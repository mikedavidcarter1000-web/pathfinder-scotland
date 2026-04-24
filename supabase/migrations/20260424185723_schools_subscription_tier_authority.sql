-- Schools billing: relax subscription_tier CHECK constraint to accept
-- 'authority'. Authority tier is a future enterprise / local-authority-wide
-- licence that we do not sell yet, but the feature-gating code in
-- lib/school/subscription.ts treats it as "all features, no expiry", so
-- the DB must allow the value to land.
--
-- The pre-existing CHECK allowed only ('trial','standard','premium') with
-- NULL. This migration replaces it with ('trial','standard','premium','authority').
--
-- Safe to re-run: DROP IF EXISTS + re-ADD.

ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_subscription_tier_check;
ALTER TABLE public.schools ADD CONSTRAINT schools_subscription_tier_check
  CHECK (subscription_tier IS NULL OR subscription_tier IN ('trial','standard','premium','authority'));
