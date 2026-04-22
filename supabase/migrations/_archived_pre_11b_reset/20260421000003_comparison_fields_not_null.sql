-- Stage 2.1 (part 2): enforce NOT NULL on the newly populated comparison columns.
-- All 269 role_profiles rows were populated in migration 20260421000002; NULL
-- count verified 0 post-apply before this constraint is added.

ALTER TABLE public.role_profiles
  ALTER COLUMN typical_entry_age SET NOT NULL;

ALTER TABLE public.role_profiles
  ALTER COLUMN typical_hours_per_week SET NOT NULL;
