-- Schools-1: territory-aware configuration tables + Scotland seed data.
--
-- Pathfinder is Scotland-first today but the data model is designed to
-- extend to England / Wales / Northern Ireland / Republic of Ireland
-- without schema rewrites. Every school links to a `territories` row,
-- and every territory carries its own qualification framework,
-- inspection framework, wellbeing framework, career framework, and
-- funding body reference.
--
-- This migration is idempotent: every CREATE is IF NOT EXISTS, every
-- INSERT uses ON CONFLICT DO NOTHING against a deterministic UNIQUE key.

-- =====================================================================
-- 1. territories
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  qualification_framework TEXT NOT NULL,
  deprivation_index_name TEXT NOT NULL,
  inspection_framework TEXT NOT NULL,
  wellbeing_framework TEXT NOT NULL,
  career_framework TEXT NOT NULL,
  funding_body TEXT NOT NULL,
  year_labels JSONB NOT NULL,
  currency_symbol TEXT DEFAULT 'GBP',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 2. qualification_types
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.qualification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID NOT NULL REFERENCES public.territories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  scqf_level INTEGER,
  sort_order INTEGER NOT NULL,
  is_senior_phase BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (territory_id, short_name)
);
CREATE INDEX IF NOT EXISTS idx_qualification_types_territory
  ON public.qualification_types(territory_id);

-- =====================================================================
-- 3. grade_scales
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.grade_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_type_id UUID NOT NULL REFERENCES public.qualification_types(id) ON DELETE CASCADE,
  grade_label TEXT NOT NULL,
  ucas_points INTEGER DEFAULT 0,
  cao_points INTEGER,
  sort_order INTEGER NOT NULL,
  is_pass BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (qualification_type_id, grade_label)
);
CREATE INDEX IF NOT EXISTS idx_grade_scales_qual
  ON public.grade_scales(qualification_type_id);

-- =====================================================================
-- 4. inspection_indicators
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.inspection_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID NOT NULL REFERENCES public.territories(id) ON DELETE CASCADE,
  framework_name TEXT NOT NULL,
  indicator_code TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  UNIQUE (territory_id, framework_name, indicator_code)
);
CREATE INDEX IF NOT EXISTS idx_inspection_indicators_territory
  ON public.inspection_indicators(territory_id);

-- =====================================================================
-- 5. wellbeing_indicators
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.wellbeing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID NOT NULL REFERENCES public.territories(id) ON DELETE CASCADE,
  framework_name TEXT NOT NULL,
  indicator_code TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  UNIQUE (territory_id, framework_name, indicator_code)
);
CREATE INDEX IF NOT EXISTS idx_wellbeing_indicators_territory
  ON public.wellbeing_indicators(territory_id);

-- =====================================================================
-- 6. career_framework_capacities
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.career_framework_capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID NOT NULL REFERENCES public.territories(id) ON DELETE CASCADE,
  framework_name TEXT NOT NULL,
  capacity_code TEXT NOT NULL,
  capacity_name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  UNIQUE (territory_id, framework_name, capacity_code)
);
CREATE INDEX IF NOT EXISTS idx_career_capacities_territory
  ON public.career_framework_capacities(territory_id);

-- =====================================================================
-- RLS: all 6 tables are read-only reference data for authenticated users.
-- Writes go through the service role (migrations and admin tools only).
-- =====================================================================
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read territories" ON public.territories;
CREATE POLICY "Authenticated can read territories" ON public.territories
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.qualification_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read qualification_types" ON public.qualification_types;
CREATE POLICY "Authenticated can read qualification_types" ON public.qualification_types
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.grade_scales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read grade_scales" ON public.grade_scales;
CREATE POLICY "Authenticated can read grade_scales" ON public.grade_scales
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.inspection_indicators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read inspection_indicators" ON public.inspection_indicators;
CREATE POLICY "Authenticated can read inspection_indicators" ON public.inspection_indicators
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.wellbeing_indicators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read wellbeing_indicators" ON public.wellbeing_indicators;
CREATE POLICY "Authenticated can read wellbeing_indicators" ON public.wellbeing_indicators
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.career_framework_capacities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read career_framework_capacities" ON public.career_framework_capacities;
CREATE POLICY "Authenticated can read career_framework_capacities" ON public.career_framework_capacities
  FOR SELECT TO authenticated USING (true);

-- =====================================================================
-- Seed: Scotland (code = SCO)
-- =====================================================================
INSERT INTO public.territories (
  code, name, qualification_framework, deprivation_index_name,
  inspection_framework, wellbeing_framework, career_framework, funding_body,
  year_labels, currency_symbol
)
VALUES (
  'SCO', 'Scotland', 'Qualifications Scotland', 'SIMD',
  'HGIOS4', 'SHANARRI', 'CES', 'SAAS',
  '["S1","S2","S3","S4","S5","S6"]'::jsonb, 'GBP'
)
ON CONFLICT (code) DO NOTHING;

-- Qualification types (7 Scottish senior-phase routes)
INSERT INTO public.qualification_types
  (territory_id, name, short_name, scqf_level, sort_order, is_senior_phase)
SELECT t.id, q.name, q.short_name, q.scqf_level, q.sort_order, q.is_senior_phase
FROM public.territories t
CROSS JOIN (VALUES
  ('National 4',                 'N4',  4,                1, false),
  ('National 5',                 'N5',  5,                2, true),
  ('Higher',                     'H',   6,                3, true),
  ('Advanced Higher',            'AH',  7,                4, true),
  ('NPA',                        'NPA', NULL::INTEGER,    5, true),
  ('Foundation Apprenticeship',  'FA',  6,                6, true),
  ('Skills for Work',            'SfW', 5,                7, false)
) AS q(name, short_name, scqf_level, sort_order, is_senior_phase)
WHERE t.code = 'SCO'
ON CONFLICT (territory_id, short_name) DO NOTHING;

-- Grade scales per qualification type.
-- UCAS tariff values are from the verified 2025 UCAS tariff (2025 entry)
-- for Scottish Highers and Advanced Highers. N5 and N4 carry no UCAS
-- tariff; the N5 values below (8/6/4/0) are an internal rank used for
-- our own UCAS-equivalent display and must NOT be treated as official
-- UCAS points. If we ever expose these in a UCAS-aligned UI they should
-- be flagged clearly or moved to a separate column.
--
-- Advanced Higher: A=56, B=48, C=40, D=32 (UCAS 2025).
-- Higher:          A=33, B=27, C=21, D=15 (UCAS 2025).
-- Foundation Apprenticeship: 32 tariff points for a Pass (UCAS 2025, SCQF 6).
-- National 5 / NPA / SfW / National 4: no UCAS tariff (0).

-- National 5
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, g.grade_label, g.ucas_points, g.sort_order, g.is_pass
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
CROSS JOIN (VALUES
  ('A',        8, 1, true),
  ('B',        6, 2, true),
  ('C',        4, 3, true),
  ('D',        0, 4, true),
  ('No Award', 0, 5, false)
) AS g(grade_label, ucas_points, sort_order, is_pass)
WHERE t.code = 'SCO' AND q.short_name = 'N5'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- Higher
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, g.grade_label, g.ucas_points, g.sort_order, g.is_pass
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
CROSS JOIN (VALUES
  ('A',        33, 1, true),
  ('B',        27, 2, true),
  ('C',        21, 3, true),
  ('D',        15, 4, true),
  ('No Award', 0,  5, false)
) AS g(grade_label, ucas_points, sort_order, is_pass)
WHERE t.code = 'SCO' AND q.short_name = 'H'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- Advanced Higher
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, g.grade_label, g.ucas_points, g.sort_order, g.is_pass
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
CROSS JOIN (VALUES
  ('A',        56, 1, true),
  ('B',        48, 2, true),
  ('C',        40, 3, true),
  ('D',        32, 4, true),
  ('No Award', 0,  5, false)
) AS g(grade_label, ucas_points, sort_order, is_pass)
WHERE t.code = 'SCO' AND q.short_name = 'AH'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- National 4 (Pass only)
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, 'Pass', 0, 1, true
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
WHERE t.code = 'SCO' AND q.short_name = 'N4'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- Foundation Apprenticeship (Pass = 32 UCAS points at SCQF 6)
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, 'Pass', 32, 1, true
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
WHERE t.code = 'SCO' AND q.short_name = 'FA'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- NPA (Pass / Fail, no tariff)
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, g.grade_label, 0, g.sort_order, g.is_pass
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
CROSS JOIN (VALUES
  ('Pass', 1, true),
  ('Fail', 2, false)
) AS g(grade_label, sort_order, is_pass)
WHERE t.code = 'SCO' AND q.short_name = 'NPA'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- Skills for Work (Pass only, no tariff)
INSERT INTO public.grade_scales (qualification_type_id, grade_label, ucas_points, sort_order, is_pass)
SELECT q.id, 'Pass', 0, 1, true
FROM public.qualification_types q
JOIN public.territories t ON t.id = q.territory_id
WHERE t.code = 'SCO' AND q.short_name = 'SfW'
ON CONFLICT (qualification_type_id, grade_label) DO NOTHING;

-- HGIOS4 inspection indicators (15 QIs across 3 categories)
INSERT INTO public.inspection_indicators
  (territory_id, framework_name, indicator_code, indicator_name, category, sort_order)
SELECT t.id, 'HGIOS4', i.code, i.name, i.category, i.sort_order
FROM public.territories t
CROSS JOIN (VALUES
  ('1.1', 'Self-evaluation for self-improvement',          'Leadership and Management',   1),
  ('1.2', 'Leadership of learning',                        'Leadership and Management',   2),
  ('1.3', 'Leadership of change',                          'Leadership and Management',   3),
  ('1.4', 'Leadership and management of staff',            'Leadership and Management',   4),
  ('1.5', 'Management of resources to promote equity',     'Leadership and Management',   5),
  ('2.1', 'Safeguarding and child protection',             'Learning Provision',          6),
  ('2.2', 'Curriculum',                                    'Learning Provision',          7),
  ('2.3', 'Learning, teaching and assessment',             'Learning Provision',          8),
  ('2.4', 'Personalised support',                          'Learning Provision',          9),
  ('2.5', 'Family learning',                               'Learning Provision',         10),
  ('2.6', 'Transitions',                                   'Learning Provision',         11),
  ('2.7', 'Partnerships',                                  'Learning Provision',         12),
  ('3.1', 'Ensuring wellbeing, equality and inclusion',    'Successes and Achievements', 13),
  ('3.2', 'Raising attainment and achievement',            'Successes and Achievements', 14),
  ('3.3', 'Increasing creativity and employability',       'Successes and Achievements', 15)
) AS i(code, name, category, sort_order)
WHERE t.code = 'SCO'
ON CONFLICT (territory_id, framework_name, indicator_code) DO NOTHING;

-- SHANARRI wellbeing indicators (8)
INSERT INTO public.wellbeing_indicators
  (territory_id, framework_name, indicator_code, indicator_name, description, sort_order)
SELECT t.id, 'SHANARRI', i.code, i.name, i.description, i.sort_order
FROM public.territories t
CROSS JOIN (VALUES
  ('safe',        'Safe',        'Growing up in an environment where a child feels secure, nurtured, listened to and enabled to develop',                 1),
  ('healthy',     'Healthy',     'Having the highest attainable standards of physical and mental health, access to suitable healthcare',                   2),
  ('achieving',   'Achieving',   'Being supported and guided in learning and development of skills, confidence and self-esteem',                           3),
  ('nurtured',    'Nurtured',    'Growing, developing and being cared for in an environment providing physical and emotional security',                    4),
  ('active',      'Active',      'Having opportunities to take part in a wide range of activities, promoting healthy growth and development',              5),
  ('respected',   'Respected',   'Being involved in decisions that affect them, having their voices heard and being treated fairly',                       6),
  ('responsible', 'Responsible', 'Having opportunities to take on responsibility and contribute to their communities',                                     7),
  ('included',    'Included',    'Being a full member of communities, receiving help and guidance to overcome inequalities',                               8)
) AS i(code, name, description, sort_order)
WHERE t.code = 'SCO'
ON CONFLICT (territory_id, framework_name, indicator_code) DO NOTHING;

-- CES career framework capacities (4)
INSERT INTO public.career_framework_capacities
  (territory_id, framework_name, capacity_code, capacity_name, description, sort_order)
SELECT t.id, 'CES', c.code, c.name, c.description, c.sort_order
FROM public.territories t
CROSS JOIN (VALUES
  ('self',       'Self',       'Self-awareness, confidence, resilience -- understanding who I am and what I can offer',                             1),
  ('strengths',  'Strengths',  'Skills, qualifications, achievements -- knowing what I am good at and building on it',                              2),
  ('horizons',   'Horizons',   'Knowledge of opportunities, career paths explored -- understanding what options exist',                             3),
  ('networks',   'Networks',   'Connections to employers, mentors, role models -- building relationships that support my future',                   4)
) AS c(code, name, description, sort_order)
WHERE t.code = 'SCO'
ON CONFLICT (territory_id, framework_name, capacity_code) DO NOTHING;

COMMENT ON TABLE public.territories IS
  'Top-level regional container. Every school belongs to one territory which drives the qualification framework, inspection framework, wellbeing framework, career framework, and funding body used across the school dashboard.';
COMMENT ON TABLE public.qualification_types IS
  'Per-territory qualification routes (e.g. Scotland: National 4, N5, Higher, Advanced Higher, NPA, FA, SfW).';
COMMENT ON TABLE public.grade_scales IS
  'Per-qualification grade labels and UCAS tariff points. Verify UCAS values against the current UCAS tariff once per year.';
COMMENT ON TABLE public.inspection_indicators IS
  'Inspection framework indicators (Scotland: HGIOS4 15 QIs). Used for HMIE-style evidence mapping.';
COMMENT ON TABLE public.wellbeing_indicators IS
  'Wellbeing framework indicators (Scotland: 8 SHANARRI wellbeing indicators). Used for GIRFEC evidence.';
COMMENT ON TABLE public.career_framework_capacities IS
  'Career education framework capacities (Scotland: CES 4 capacities -- Self, Strengths, Horizons, Networks).';
