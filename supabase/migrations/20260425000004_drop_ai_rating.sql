DROP INDEX IF EXISTS idx_cr_rating;
ALTER TABLE public.career_roles DROP CONSTRAINT career_roles_ai_rating_check;
ALTER TABLE public.career_roles DROP COLUMN ai_rating;
