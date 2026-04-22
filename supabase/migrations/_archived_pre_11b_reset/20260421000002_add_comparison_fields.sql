-- Stage 2.1: Career Comparison fields (Session 1 of 7)
--
-- Adds typical_entry_age and typical_hours_per_week to role_profiles.
-- Both columns populated for all 269 rows via CASE expressions derived
-- from typical_entry_qualification and hours_pattern, with name-based
-- overrides for specific roles. A follow-up migration sets NOT NULL.
--
-- Age mapping (from typical_entry_qualification):
--   national_4 -> 16; national_5 -> 17; highers -> 18;
--   hnc -> 19; hnd -> 20; degree -> 22; degree_plus_professional -> 23.
-- Name-based overrides within degree_plus_professional:
--   Optometrist -> 22; any Teacher -> 22; Solicitor -> 24; Advocate -> 25.
--   Medicine/Dentistry/Veterinary/Pharmacy explicitly confirmed at 23 (= default).
-- Spec also listed Clinical Psychologist -> 27, but no such role exists in the
-- current dataset (Educational Psychologist exists and defaults to 23).
-- Spec also listed apprenticeship (-> 20) and advanced_higher (-> 18); neither
-- value is present in the entry_qualification enum, so those branches never fire.
--
-- The following 38 degree_plus_professional roles have no name-based override
-- and default to 23. Logged here per session spec:
--   Accountant (Qualified), Actuary, Aerospace Engineer, Building Services Engineer,
--   Chemical Engineer, Chief Nursing Information Officer (CNIO),
--   Child Protection Social Worker, Civil Engineer, Clinical AI Safety Specialist,
--   Clinical Researcher, Criminal Justice Social Worker, Dietitian,
--   Digital Medicines Specialist, Educational Psychologist, Electrical Engineer,
--   Environmental Consultant, Financial Adviser, Forensic AI Auditor,
--   Marine / Naval Architecture Engineer, Materials Engineer / Metallurgist,
--   Mechanical Engineer, Mental Health Nurse, Midwife, Nuclear Engineer, Nurse,
--   Occupational Therapist, Paramedic, Petroleum / Energy Engineer,
--   Physiotherapist, Process Engineer, Procurator Fiscal Depute, Quantity Surveyor,
--   Radiographer, Renewable Energy Engineer, Social Worker,
--   Speech and Language Therapist, Structural Engineer, Tax Adviser.
--
-- Hours mapping (from hours_pattern):
--   Standard -> 37; Shifts -> 40; Irregular -> 40; Seasonal -> 40.
-- Name-based overrides (take precedence over hours_pattern defaults):
--   Doctor / GP -> 48; Solicitor / Advocate -> 45; Investment Banker -> 50;
--   Architect -> 42 (exact match; avoids Naval Architect); Veterinary Surgeon -> 45;
--   Chef (Professional Kitchen) -> 48; Shop Assistant / Sales Associate -> 30;
--   Waiter / Waitress / Bar Staff -> 25.
-- Spec overrides that find no matching role in the current dataset (and so
-- do not fire): Junior Doctor / medical Consultant / medical Surgeon,
-- Trainee Solicitor as separate role (covered by Solicitor (Junior/Trainee)),
-- Barrister (Scotland uses Advocate), Corporate Finance, Farmer / Farm Manager,
-- Retail Assistant / Shop Worker as separate roles, Bartender as separate role,
-- Home Care Worker / Domiciliary Care.

ALTER TABLE public.role_profiles
  ADD COLUMN typical_entry_age integer,
  ADD COLUMN typical_hours_per_week integer;

ALTER TABLE public.role_profiles
  ADD CONSTRAINT role_profiles_typical_entry_age_check
    CHECK (typical_entry_age IS NULL OR typical_entry_age BETWEEN 14 AND 40);

ALTER TABLE public.role_profiles
  ADD CONSTRAINT role_profiles_typical_hours_per_week_check
    CHECK (typical_hours_per_week IS NULL OR typical_hours_per_week BETWEEN 10 AND 80);

UPDATE public.role_profiles rp
SET typical_entry_age = sub.age
FROM (
  SELECT
    rp2.id,
    CASE
      WHEN rp2.typical_entry_qualification = 'degree_plus_professional' THEN
        CASE
          WHEN cr.title = 'Advocate' THEN 25
          WHEN cr.title ILIKE '%solicitor%' THEN 24
          WHEN cr.title = 'Optometrist' THEN 22
          WHEN cr.title ILIKE '%teacher%' THEN 22
          WHEN cr.title IN ('Doctor / GP','Dentist','Veterinary Surgeon','Pharmacist') THEN 23
          ELSE 23
        END
      WHEN rp2.typical_entry_qualification = 'degree' THEN 22
      WHEN rp2.typical_entry_qualification = 'hnd' THEN 20
      WHEN rp2.typical_entry_qualification = 'hnc' THEN 19
      WHEN rp2.typical_entry_qualification = 'highers' THEN 18
      WHEN rp2.typical_entry_qualification = 'national_5' THEN 17
      WHEN rp2.typical_entry_qualification = 'national_4' THEN 16
      WHEN rp2.typical_entry_qualification = 'none' THEN 16
      ELSE 18
    END AS age
  FROM public.role_profiles rp2
  JOIN public.career_roles cr ON cr.id = rp2.career_role_id
) sub
WHERE rp.id = sub.id;

UPDATE public.role_profiles rp
SET typical_hours_per_week = sub.hpw
FROM (
  SELECT
    rp2.id,
    CASE
      WHEN cr.title = 'Doctor / GP' THEN 48
      WHEN cr.title = 'Advocate' THEN 45
      WHEN cr.title ILIKE '%solicitor%' THEN 45
      WHEN cr.title = 'Investment Banker' THEN 50
      WHEN cr.title = 'Architect' THEN 42
      WHEN cr.title = 'Veterinary Surgeon' THEN 45
      WHEN cr.title ILIKE '%chef%' THEN 48
      WHEN cr.title = 'Shop Assistant / Sales Associate' THEN 30
      WHEN cr.title = 'Waiter / Waitress / Bar Staff' THEN 25
      WHEN rp2.hours_pattern = 'Standard' THEN 37
      WHEN rp2.hours_pattern = 'Shifts' THEN 40
      WHEN rp2.hours_pattern = 'Irregular' THEN 40
      WHEN rp2.hours_pattern = 'Seasonal' THEN 40
      ELSE 37
    END AS hpw
  FROM public.role_profiles rp2
  JOIN public.career_roles cr ON cr.id = rp2.career_role_id
) sub
WHERE rp.id = sub.id;

COMMENT ON COLUMN public.role_profiles.typical_entry_age IS
  'Typical age at which a person enters this role, derived from typical_entry_qualification with role-name overrides. Populated in migration 20260421000002.';
COMMENT ON COLUMN public.role_profiles.typical_hours_per_week IS
  'Typical contracted hours per week, derived from hours_pattern with role-name overrides. Populated in migration 20260421000002.';
