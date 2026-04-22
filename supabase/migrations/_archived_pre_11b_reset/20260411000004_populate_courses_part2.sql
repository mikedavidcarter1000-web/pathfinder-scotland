-- Generated course migration
-- Source: scripts/generate_course_migration.js
-- Course count: 13

BEGIN;

-- ============================================================================
-- COURSE INSERTS
-- ============================================================================

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Geography and Sustainable Development',
  'geography-and-sustainable-development',
  'FL79',
  'ma'::degree_type,
  'Geography',
  'Four-year geography degree combined with sustainable development and environmental management.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Creative Writing',
  'creative-writing',
  'W800',
  'ma'::degree_type,
  'English',
  'Four-year creative writing degree with fiction, poetry and dramatic writing workshops.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["English"]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Philosophy and Theology',
  'philosophy-and-theology',
  'VV56',
  'ma'::degree_type,
  'Philosophy',
  'Four-year joint degree in philosophy and theology exploring ethics, metaphysics and religion.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Veterinary Biosciences',
  'veterinary-biosciences',
  'D310',
  'bsc'::degree_type,
  'Veterinary Medicine',
  'Four-year veterinary biosciences degree covering animal biology and clinical research.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Economic and Social History',
  'economic-and-social-history',
  'V140',
  'ma'::degree_type,
  'History',
  'Four-year degree combining economic and social history with theoretical and empirical approaches.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Politics and Social Policy',
  'politics-and-social-policy',
  'LL24',
  'ma'::degree_type,
  'Politics',
  'Four-year degree combining politics with social policy and public administration.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Computing',
  'computing',
  'G500',
  'bsc'::degree_type,
  'Computing Science',
  'Four-year computing degree covering software development and systems analysis.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Criminology',
  'criminology',
  'M900',
  'ba'::degree_type,
  'Sociology',
  'Four-year criminology degree covering criminal justice, policing and forensic psychology.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Criminology',
  'criminology',
  'M930',
  'ba'::degree_type,
  'Sociology',
  'Four-year criminology degree covering crime, justice and social policy.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Criminology',
  'criminology',
  'M930',
  'ba'::degree_type,
  'Sociology',
  'Four-year criminology degree examining criminal justice and social responses to crime.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'International Tourism Management',
  'international-tourism-management',
  'N830',
  'ba'::degree_type,
  'Travel and Tourism',
  'Four-year international tourism management degree with Highland and Island focus.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Applied Software Engineering',
  'applied-software-engineering',
  'G600',
  'bsc'::degree_type,
  'Computing Science',
  'Four-year software engineering degree with graduate apprenticeship options.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Sport Coaching',
  'sport-coaching',
  'C610',
  'bsc'::degree_type,
  'Sport and Fitness',
  'Four-year sport coaching degree with practical coaching experience and theory.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COURSE_SUBJECT_REQUIREMENTS INSERTS
-- ============================================================================
-- Matches required_subjects in entry_requirements to subjects table

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'creative writing'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'veterinary biosciences'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'veterinary biosciences'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

COMMIT;
