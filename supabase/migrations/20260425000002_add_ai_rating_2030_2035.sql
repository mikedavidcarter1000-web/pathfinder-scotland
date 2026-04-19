ALTER TABLE public.career_roles
  ADD COLUMN ai_rating_2030_2035 integer NULL;

ALTER TABLE public.career_roles
  ADD CONSTRAINT career_roles_ai_rating_2030_2035_check
  CHECK (ai_rating_2030_2035 IS NULL OR (ai_rating_2030_2035 >= 1 AND ai_rating_2030_2035 <= 10));

COMMENT ON COLUMN public.career_roles.ai_rating_2030_2035 IS 'AI impact rating 1-10 for the 2030-2035 early-career window. See docs/ai-horizon-rubric.md.';
