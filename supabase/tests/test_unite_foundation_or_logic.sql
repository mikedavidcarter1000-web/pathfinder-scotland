-- ============================================================================
-- Test: Unite Foundation Scholarship OR logic
-- ============================================================================
-- Run against a Supabase instance where the matching function and bursary
-- data have been deployed. Uses temporary test students (cleaned up at end).
--
-- Usage:  paste into Supabase SQL Editor, or run via psql
-- Expected: all 5 assertions PASS (NOTICE), zero FAILs (WARNING)
-- ============================================================================

DO $$
DECLARE
  v_bursary_id UUID;
  v_student_id UUID;
  v_match_count INT;
  v_confidence TEXT;
  v_pass INT := 0;
  v_fail INT := 0;
BEGIN
  -- Resolve Unite Foundation bursary ID
  SELECT id INTO v_bursary_id
  FROM bursaries WHERE slug = 'unite-foundation-scholarship';

  IF v_bursary_id IS NULL THEN
    RAISE EXCEPTION 'Unite Foundation Scholarship not found — run migrations first';
  END IF;

  -- ========================================================================
  -- Helper: create a minimal test student at undergraduate stage
  -- We insert directly and clean up at the end of the block.
  -- ========================================================================

  -- TEST 1: Care-experienced only → should match as 'definite'
  INSERT INTO students (id, care_experienced, is_estranged, school_stage, demographic_completed)
  VALUES (gen_random_uuid(), true, false, 'mature', true)
  RETURNING id INTO v_student_id;

  SELECT count(*), max(m.match_confidence)
  INTO v_match_count, v_confidence
  FROM match_bursaries_for_student(v_student_id) m
  WHERE m.bursary_id = v_bursary_id;

  IF v_match_count = 1 AND v_confidence = 'definite' THEN
    RAISE NOTICE 'PASS  Test 1: care-experienced only → definite';
    v_pass := v_pass + 1;
  ELSE
    RAISE WARNING 'FAIL  Test 1: care-experienced only — expected 1 match (definite), got % (%)', v_match_count, v_confidence;
    v_fail := v_fail + 1;
  END IF;

  DELETE FROM students WHERE id = v_student_id;

  -- TEST 2: Estranged only → should match as 'definite'
  INSERT INTO students (id, care_experienced, is_estranged, school_stage, demographic_completed)
  VALUES (gen_random_uuid(), false, true, 'mature', true)
  RETURNING id INTO v_student_id;

  SELECT count(*), max(m.match_confidence)
  INTO v_match_count, v_confidence
  FROM match_bursaries_for_student(v_student_id) m
  WHERE m.bursary_id = v_bursary_id;

  IF v_match_count = 1 AND v_confidence = 'definite' THEN
    RAISE NOTICE 'PASS  Test 2: estranged only → definite';
    v_pass := v_pass + 1;
  ELSE
    RAISE WARNING 'FAIL  Test 2: estranged only — expected 1 match (definite), got % (%)', v_match_count, v_confidence;
    v_fail := v_fail + 1;
  END IF;

  DELETE FROM students WHERE id = v_student_id;

  -- TEST 3: Both care-experienced AND estranged → should match as 'definite'
  INSERT INTO students (id, care_experienced, is_estranged, school_stage, demographic_completed)
  VALUES (gen_random_uuid(), true, true, 'mature', true)
  RETURNING id INTO v_student_id;

  SELECT count(*), max(m.match_confidence)
  INTO v_match_count, v_confidence
  FROM match_bursaries_for_student(v_student_id) m
  WHERE m.bursary_id = v_bursary_id;

  IF v_match_count = 1 AND v_confidence = 'definite' THEN
    RAISE NOTICE 'PASS  Test 3: both flags → definite';
    v_pass := v_pass + 1;
  ELSE
    RAISE WARNING 'FAIL  Test 3: both flags — expected 1 match (definite), got % (%)', v_match_count, v_confidence;
    v_fail := v_fail + 1;
  END IF;

  DELETE FROM students WHERE id = v_student_id;

  -- TEST 4: Neither flag (known false) → should NOT match
  INSERT INTO students (id, care_experienced, is_estranged, school_stage, demographic_completed)
  VALUES (gen_random_uuid(), false, false, 'mature', true)
  RETURNING id INTO v_student_id;

  SELECT count(*)
  INTO v_match_count
  FROM match_bursaries_for_student(v_student_id) m
  WHERE m.bursary_id = v_bursary_id;

  IF v_match_count = 0 THEN
    RAISE NOTICE 'PASS  Test 4: neither flag (known false) → excluded';
    v_pass := v_pass + 1;
  ELSE
    RAISE WARNING 'FAIL  Test 4: neither flag (known false) — expected 0 matches, got %', v_match_count;
    v_fail := v_fail + 1;
  END IF;

  DELETE FROM students WHERE id = v_student_id;

  -- TEST 5: Neither flag set (NULL/unknown) → should match as 'check_eligibility'
  INSERT INTO students (id, care_experienced, is_estranged, school_stage, demographic_completed)
  VALUES (gen_random_uuid(), NULL, NULL, 'mature', false)
  RETURNING id INTO v_student_id;

  SELECT count(*), max(m.match_confidence)
  INTO v_match_count, v_confidence
  FROM match_bursaries_for_student(v_student_id) m
  WHERE m.bursary_id = v_bursary_id;

  IF v_match_count = 1 AND v_confidence = 'check_eligibility' THEN
    RAISE NOTICE 'PASS  Test 5: flags unknown (NULL) → check_eligibility';
    v_pass := v_pass + 1;
  ELSE
    RAISE WARNING 'FAIL  Test 5: flags unknown (NULL) — expected 1 match (check_eligibility), got % (%)', v_match_count, v_confidence;
    v_fail := v_fail + 1;
  END IF;

  DELETE FROM students WHERE id = v_student_id;

  -- TEST 6: One flag false, other NULL → should match as 'check_eligibility'
  -- (student hasn't answered care-experienced yet; might still qualify)
  INSERT INTO students (id, care_experienced, is_estranged, school_stage, demographic_completed)
  VALUES (gen_random_uuid(), NULL, false, 'mature', false)
  RETURNING id INTO v_student_id;

  SELECT count(*), max(m.match_confidence)
  INTO v_match_count, v_confidence
  FROM match_bursaries_for_student(v_student_id) m
  WHERE m.bursary_id = v_bursary_id;

  IF v_match_count = 1 AND v_confidence = 'check_eligibility' THEN
    RAISE NOTICE 'PASS  Test 6: one NULL, one false → check_eligibility';
    v_pass := v_pass + 1;
  ELSE
    RAISE WARNING 'FAIL  Test 6: one NULL, one false — expected 1 match (check_eligibility), got % (%)', v_match_count, v_confidence;
    v_fail := v_fail + 1;
  END IF;

  DELETE FROM students WHERE id = v_student_id;

  -- ========================================================================
  -- Summary
  -- ========================================================================
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Unite Foundation OR-logic tests: % passed, % failed', v_pass, v_fail;
  RAISE NOTICE '========================================';

  IF v_fail > 0 THEN
    RAISE EXCEPTION '% test(s) failed — see warnings above', v_fail;
  END IF;
END $$;
