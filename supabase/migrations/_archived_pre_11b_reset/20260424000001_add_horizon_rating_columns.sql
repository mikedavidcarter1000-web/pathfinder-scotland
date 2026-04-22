ALTER TABLE public.career_roles
  ADD COLUMN ai_rating_2035_2045        integer NULL,
  ADD COLUMN robotics_rating_2030_2035  integer NULL,
  ADD COLUMN robotics_rating_2040_2045  integer NULL,
  ADD COLUMN robotics_description        text    NULL;

ALTER TABLE public.career_roles
  ADD CONSTRAINT career_roles_ai_rating_2035_2045_check
    CHECK (ai_rating_2035_2045 IS NULL OR (ai_rating_2035_2045 >= 1 AND ai_rating_2035_2045 <= 10));

ALTER TABLE public.career_roles
  ADD CONSTRAINT career_roles_robotics_rating_2030_2035_check
    CHECK (robotics_rating_2030_2035 IS NULL OR (robotics_rating_2030_2035 >= 1 AND robotics_rating_2030_2035 <= 10));

ALTER TABLE public.career_roles
  ADD CONSTRAINT career_roles_robotics_rating_2040_2045_check
    CHECK (robotics_rating_2040_2045 IS NULL OR (robotics_rating_2040_2045 >= 1 AND robotics_rating_2040_2045 <= 10));

COMMENT ON COLUMN public.career_roles.ai_rating_2035_2045 IS
  'AI impact rating 1-10 for the 2035-2045 mid-career window. See docs/ai-horizon-rubric.md.';

COMMENT ON COLUMN public.career_roles.robotics_rating_2030_2035 IS
  'Robotics and physical automation impact rating 1-10 for the 2030-2035 early-career window. See docs/robotics-rating-rubric.md.';

COMMENT ON COLUMN public.career_roles.robotics_rating_2040_2045 IS
  'Robotics and physical automation impact rating 1-10 for the 2040-2045 mid-career window. See docs/robotics-rating-rubric.md.';

COMMENT ON COLUMN public.career_roles.robotics_description IS
  'Free-text description of how robotics and physical automation affects the role, parallel to ai_description.';
