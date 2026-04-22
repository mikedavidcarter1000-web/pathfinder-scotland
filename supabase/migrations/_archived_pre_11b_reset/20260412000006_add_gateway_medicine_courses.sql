-- ============================================
-- Gateway / Foundation Medicine courses (widening-access routes)
-- Migration: 20260412000006
-- ============================================
-- Inserts the 4 Scottish Gateway-to-Medicine foundation-year programmes
-- (Glasgow, Dundee, Aberdeen, St Andrews) and adds Biology + Chemistry subject
-- requirements to each via the course_subject_requirements junction table.
--
-- Notes:
--  * degree_type is set to NULL for all four rows: 'certhe' is not in the
--    degree_type enum and ALTER TYPE ... ADD VALUE cannot be used in the same
--    transaction as an INSERT that references the new value. The "CertHE"
--    label is preserved in the course name where relevant so the information
--    is still visible in the UI.
--  * duration_years = 1 (these are one-year foundation programmes feeding
--    into a subsequent full MBChB degree).
--  * widening_access_requirements JSONB mirrors the entry_requirements so the
--    same data structure is usable by the existing WA-matching logic.
-- ============================================

BEGIN;

DO $$
DECLARE
    glasgow_id    UUID;
    dundee_id     UUID;
    aberdeen_id   UUID;
    standrews_id  UUID;
    biology_id    UUID;
    chemistry_id  UUID;
    new_course_id UUID;
BEGIN
    SELECT id INTO glasgow_id    FROM universities WHERE slug = 'glasgow';
    SELECT id INTO dundee_id     FROM universities WHERE slug = 'dundee';
    SELECT id INTO aberdeen_id   FROM universities WHERE slug = 'aberdeen';
    SELECT id INTO standrews_id  FROM universities WHERE slug = 'st-andrews';

    SELECT id INTO biology_id    FROM subjects WHERE name = 'Biology'   LIMIT 1;
    SELECT id INTO chemistry_id  FROM subjects WHERE name = 'Chemistry' LIMIT 1;

    IF glasgow_id IS NULL OR dundee_id IS NULL OR aberdeen_id IS NULL OR standrews_id IS NULL THEN
        RAISE EXCEPTION 'Missing university id (glasgow=%, dundee=%, aberdeen=%, standrews=%)',
            glasgow_id, dundee_id, aberdeen_id, standrews_id;
    END IF;

    IF biology_id IS NULL OR chemistry_id IS NULL THEN
        RAISE EXCEPTION 'Missing subject id (biology=%, chemistry=%)', biology_id, chemistry_id;
    END IF;

    -- ============================================
    -- 1. Glasgow: Gateway to Medical Studies (CertHE)
    -- ============================================
    INSERT INTO courses (
        university_id, name, slug, degree_type, subject_area, duration_years,
        entry_requirements, widening_access_requirements, description
    ) VALUES (
        glasgow_id,
        'Gateway to Medical Studies (CertHE)',
        'gateway-to-medical-studies',
        NULL,
        'Medicine',
        1,
        '{"highers": "AABB", "required_subjects": ["Biology", "Chemistry"], "notes": "SIMD20 or care-experienced only. MD40 NOT eligible. Reach or SWAP required."}'::jsonb,
        '{"simd20": {"highers": "AABB"}, "care_experienced": {"highers": "AABB"}}'::jsonb,
        'WA-only foundation year with automatic progression to MBChB Year 1. SIMD20 and care-experienced applicants only; MD40 not eligible. Reach or SWAP pre-entry programme required.'
    )
    ON CONFLICT (university_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        degree_type = EXCLUDED.degree_type,
        subject_area = EXCLUDED.subject_area,
        duration_years = EXCLUDED.duration_years,
        entry_requirements = EXCLUDED.entry_requirements,
        widening_access_requirements = EXCLUDED.widening_access_requirements,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO new_course_id;

    INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
    VALUES
        (new_course_id, biology_id,   'higher', 'B', true),
        (new_course_id, chemistry_id, 'higher', 'B', true)
    ON CONFLICT (course_id, subject_id, qualification_level) DO UPDATE SET
        min_grade = EXCLUDED.min_grade,
        is_mandatory = EXCLUDED.is_mandatory;

    -- ============================================
    -- 2. Dundee: Gateway to Medicine (1-year)
    -- ============================================
    INSERT INTO courses (
        university_id, name, slug, degree_type, subject_area, duration_years,
        entry_requirements, widening_access_requirements, description
    ) VALUES (
        dundee_id,
        'Gateway to Medicine (1-year)',
        'gateway-to-medicine',
        NULL,
        'Medicine',
        1,
        '{"highers": "AABB", "required_subjects": ["Chemistry", "Biology"], "notes": "SIMD Q1, FSM, care-experienced, carer, refugee, estranged only. No UCAT required."}'::jsonb,
        '{"simd20": {"highers": "AABB"}, "care_experienced": {"highers": "AABB"}, "fsm": {"highers": "AABB"}}'::jsonb,
        'One-year Gateway programme feeding into MBChB Year 1. Open to SIMD Q1, free school meals, care-experienced, carers, refugees, and estranged applicants. No UCAT required.'
    )
    ON CONFLICT (university_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        degree_type = EXCLUDED.degree_type,
        subject_area = EXCLUDED.subject_area,
        duration_years = EXCLUDED.duration_years,
        entry_requirements = EXCLUDED.entry_requirements,
        widening_access_requirements = EXCLUDED.widening_access_requirements,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO new_course_id;

    INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
    VALUES
        (new_course_id, chemistry_id, 'higher', 'B', true),
        (new_course_id, biology_id,   'higher', 'B', true)
    ON CONFLICT (course_id, subject_id, qualification_level) DO UPDATE SET
        min_grade = EXCLUDED.min_grade,
        is_mandatory = EXCLUDED.is_mandatory;

    -- ============================================
    -- 3. Aberdeen: Gateway2Medicine (G2M, 1-year)
    -- ============================================
    INSERT INTO courses (
        university_id, name, slug, degree_type, subject_area, duration_years,
        entry_requirements, widening_access_requirements, description
    ) VALUES (
        aberdeen_id,
        'Gateway2Medicine (G2M, 1-year)',
        'gateway2medicine',
        NULL,
        'Medicine',
        1,
        '{"highers": "AABB", "required_subjects": ["Biology", "Chemistry"], "notes": "SIMD20 or care-experienced auto-eligible. Delivered with NESCol."}'::jsonb,
        '{"simd20": {"highers": "AABB"}, "care_experienced": {"highers": "AABB"}}'::jsonb,
        'Gateway year delivered with North East Scotland College (NESCol). Auto-eligible for SIMD20 and care-experienced applicants. Progresses to University of Aberdeen MBChB.'
    )
    ON CONFLICT (university_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        degree_type = EXCLUDED.degree_type,
        subject_area = EXCLUDED.subject_area,
        duration_years = EXCLUDED.duration_years,
        entry_requirements = EXCLUDED.entry_requirements,
        widening_access_requirements = EXCLUDED.widening_access_requirements,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO new_course_id;

    INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
    VALUES
        (new_course_id, biology_id,   'higher', 'B', true),
        (new_course_id, chemistry_id, 'higher', 'B', true)
    ON CONFLICT (course_id, subject_id, qualification_level) DO UPDATE SET
        min_grade = EXCLUDED.min_grade,
        is_mandatory = EXCLUDED.is_mandatory;

    -- ============================================
    -- 4. St Andrews: Gateway to Medicine (1-year)
    -- ============================================
    INSERT INTO courses (
        university_id, name, slug, degree_type, subject_area, duration_years,
        entry_requirements, widening_access_requirements, description
    ) VALUES (
        standrews_id,
        'Gateway to Medicine (1-year)',
        'gateway-to-medicine',
        NULL,
        'Medicine',
        1,
        '{"highers": "BBBB", "notes": "Gateway programme with separate 1-year foundation. UCAT required."}'::jsonb,
        '{"wa_minimum": {"highers": "BBBB"}}'::jsonb,
        'One-year Gateway foundation programme for widening-access applicants, progressing to MBChB. UCAT required.'
    )
    ON CONFLICT (university_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        degree_type = EXCLUDED.degree_type,
        subject_area = EXCLUDED.subject_area,
        duration_years = EXCLUDED.duration_years,
        entry_requirements = EXCLUDED.entry_requirements,
        widening_access_requirements = EXCLUDED.widening_access_requirements,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- St Andrews Gateway does not specify required Highers subjects in the task
    -- spec (BBBB overall, UCAT required), so no course_subject_requirements rows
    -- are inserted for this course.

END $$;

COMMIT;
