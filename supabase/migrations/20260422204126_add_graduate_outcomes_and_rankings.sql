-- Graduate Outcomes + University Rankings
--
-- Adds course-level outcome metrics (employment rate, highly skilled
-- employment share, median salary at 1/3/5 years, student satisfaction,
-- continuation rate) sourced from Discover Uni / HESA Graduate Outcomes,
-- plus subject-level CUG ranking. Adds institutional-level rankings
-- (Complete University Guide, Guardian, Times/Sunday Times) and
-- institutional graduate employment rate.
--
-- All columns are nullable. CHECK constraints bound percentages 0-100
-- and salary figures 0-200000 GBP. `*_needs_verification` defaults TRUE
-- until an admin has spot-checked the source.

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS employment_rate_15m INTEGER
    CHECK (employment_rate_15m IS NULL OR (employment_rate_15m >= 0 AND employment_rate_15m <= 100));
COMMENT ON COLUMN public.courses.employment_rate_15m IS 'Percentage of graduates in employment or further study 15 months after graduation. Source: Discover Uni / Graduate Outcomes survey.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS highly_skilled_employment_pct INTEGER
    CHECK (highly_skilled_employment_pct IS NULL OR (highly_skilled_employment_pct >= 0 AND highly_skilled_employment_pct <= 100));
COMMENT ON COLUMN public.courses.highly_skilled_employment_pct IS 'Percentage of employed graduates in highly skilled roles (SOC 1-3). Source: Discover Uni / Graduate Outcomes survey.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS salary_median_1yr INTEGER
    CHECK (salary_median_1yr IS NULL OR (salary_median_1yr >= 0 AND salary_median_1yr <= 200000));
COMMENT ON COLUMN public.courses.salary_median_1yr IS 'Median salary in GBP at 15 months post-graduation. Source: Discover Uni / Graduate Outcomes survey.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS salary_median_3yr INTEGER
    CHECK (salary_median_3yr IS NULL OR (salary_median_3yr >= 0 AND salary_median_3yr <= 200000));
COMMENT ON COLUMN public.courses.salary_median_3yr IS 'Median salary in GBP at 3 years post-graduation. Source: Discover Uni / LEO data.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS salary_median_5yr INTEGER
    CHECK (salary_median_5yr IS NULL OR (salary_median_5yr >= 0 AND salary_median_5yr <= 200000));
COMMENT ON COLUMN public.courses.salary_median_5yr IS 'Median salary in GBP at 5 years post-graduation. Source: Discover Uni / LEO data.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS student_satisfaction_pct INTEGER
    CHECK (student_satisfaction_pct IS NULL OR (student_satisfaction_pct >= 0 AND student_satisfaction_pct <= 100));
COMMENT ON COLUMN public.courses.student_satisfaction_pct IS 'Overall student satisfaction percentage from NSS. Source: Discover Uni.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS continuation_rate_pct INTEGER
    CHECK (continuation_rate_pct IS NULL OR (continuation_rate_pct >= 0 AND continuation_rate_pct <= 100));
COMMENT ON COLUMN public.courses.continuation_rate_pct IS 'Percentage of students who continue into year 2. Source: Discover Uni.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subject_ranking_cug INTEGER;
COMMENT ON COLUMN public.courses.subject_ranking_cug IS 'Subject-level ranking from Complete University Guide (rank among all UK providers for this subject area).';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS outcomes_data_year TEXT;
COMMENT ON COLUMN public.courses.outcomes_data_year IS 'Academic year the outcomes data relates to, e.g. 2022-23.';

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS outcomes_needs_verification BOOLEAN DEFAULT true;
COMMENT ON COLUMN public.courses.outcomes_needs_verification IS 'Flag set by import script; cleared when admin spot-checks against Discover Uni.';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS ranking_cug INTEGER;
COMMENT ON COLUMN public.universities.ranking_cug IS 'Overall UK ranking from Complete University Guide.';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS ranking_cug_scotland INTEGER;
COMMENT ON COLUMN public.universities.ranking_cug_scotland IS 'Ranking among Scottish universities from Complete University Guide (1-18).';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS ranking_guardian INTEGER;
COMMENT ON COLUMN public.universities.ranking_guardian IS 'Overall UK ranking from Guardian University Guide.';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS ranking_times INTEGER;
COMMENT ON COLUMN public.universities.ranking_times IS 'Overall UK ranking from Times/Sunday Times Good University Guide.';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS graduate_employment_rate INTEGER
    CHECK (graduate_employment_rate IS NULL OR (graduate_employment_rate >= 0 AND graduate_employment_rate <= 100));
COMMENT ON COLUMN public.universities.graduate_employment_rate IS 'Institutional-level graduate employment rate. Source: HESA Graduate Outcomes.';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS rankings_year TEXT DEFAULT '2026';
COMMENT ON COLUMN public.universities.rankings_year IS 'Year the rankings data relates to.';

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS rankings_needs_verification BOOLEAN DEFAULT true;
COMMENT ON COLUMN public.universities.rankings_needs_verification IS 'Flag set by import script; cleared when admin spot-checks against each guide.';
