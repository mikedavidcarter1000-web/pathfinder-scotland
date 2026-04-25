-- Authority-14: distinguish schools that pay individually from schools
-- whose Standard tier is bundled in their Local Authority subscription.
--
-- This matters when an LA cancels: bundled schools revert to free, but
-- individually-subscribed schools keep their tier untouched. Without this
-- column we cannot tell the two apart in the webhook handler.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS subscription_source TEXT DEFAULT 'individual';

ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_subscription_source_check;
ALTER TABLE public.schools ADD CONSTRAINT schools_subscription_source_check
  CHECK (subscription_source IS NULL OR subscription_source IN ('individual','authority_bundle'));

CREATE INDEX IF NOT EXISTS idx_schools_subscription_source
  ON public.schools(subscription_source)
  WHERE subscription_source = 'authority_bundle';

COMMENT ON COLUMN public.schools.subscription_source IS
  'How this school''s subscription_tier was set. ''individual'' = the school purchased its own subscription via /school/subscribe. ''authority_bundle'' = the tier was granted automatically by their Local Authority''s active LA-portal subscription. On LA cancellation, only authority_bundle rows are reverted.';
