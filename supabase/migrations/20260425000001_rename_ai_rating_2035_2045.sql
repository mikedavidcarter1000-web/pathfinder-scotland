ALTER TABLE public.career_roles RENAME COLUMN ai_rating_2035_2045 TO ai_rating_2040_2045;

ALTER TABLE public.career_roles RENAME CONSTRAINT career_roles_ai_rating_2035_2045_check TO career_roles_ai_rating_2040_2045_check;

COMMENT ON COLUMN public.career_roles.ai_rating_2040_2045 IS 'AI impact rating 1-10 for the 2040-2045 mid-career window. See docs/ai-horizon-rubric.md.';
