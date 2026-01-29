-- Additional Seed Data: More Courses and SIMD Postcodes
-- Run this after the initial schema migration

-- ============================================
-- ADDITIONAL COURSES
-- ============================================

DO $$
DECLARE
    edinburgh_id UUID;
    glasgow_id UUID;
    standrews_id UUID;
    strathclyde_id UUID;
    dundee_id UUID;
    aberdeen_id UUID;
    heriotwatt_id UUID;
    stirling_id UUID;
    gcu_id UUID;
    napier_id UUID;
    rgu_id UUID;
    uws_id UUID;
    qmu_id UUID;
    uhi_id UUID;
    rcs_id UUID;
BEGIN
    SELECT id INTO edinburgh_id FROM universities WHERE slug = 'edinburgh';
    SELECT id INTO glasgow_id FROM universities WHERE slug = 'glasgow';
    SELECT id INTO standrews_id FROM universities WHERE slug = 'st-andrews';
    SELECT id INTO strathclyde_id FROM universities WHERE slug = 'strathclyde';
    SELECT id INTO dundee_id FROM universities WHERE slug = 'dundee';
    SELECT id INTO aberdeen_id FROM universities WHERE slug = 'aberdeen';
    SELECT id INTO heriotwatt_id FROM universities WHERE slug = 'heriot-watt';
    SELECT id INTO stirling_id FROM universities WHERE slug = 'stirling';
    SELECT id INTO gcu_id FROM universities WHERE slug = 'gcu';
    SELECT id INTO napier_id FROM universities WHERE slug = 'napier';
    SELECT id INTO rgu_id FROM universities WHERE slug = 'rgu';
    SELECT id INTO uws_id FROM universities WHERE slug = 'uws';
    SELECT id INTO qmu_id FROM universities WHERE slug = 'qmu';
    SELECT id INTO uhi_id FROM universities WHERE slug = 'uhi';
    SELECT id INTO rcs_id FROM universities WHERE slug = 'rcs';

    -- ========================================
    -- University of Edinburgh - Additional
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (edinburgh_id, 'Mathematics', 'mathematics', 'G100', 'bsc', 'Mathematics', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study pure and applied mathematics with one of the UK''s leading mathematics departments.'),

    (edinburgh_id, 'Physics', 'physics', 'F300', 'bsc', 'Physics', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Explore the fundamental laws of the universe from quantum mechanics to cosmology.'),

    (edinburgh_id, 'Chemistry', 'chemistry', 'F100', 'bsc', 'Chemistry', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Chemistry", "Mathematics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study chemistry from molecular to materials science in world-class facilities.'),

    (edinburgh_id, 'Biological Sciences', 'biological-sciences', 'C100', 'bsc', 'Biological Sciences', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Biology"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Explore life at all levels from molecules to ecosystems.'),

    (edinburgh_id, 'English Literature', 'english-literature', 'Q300', 'ma', 'English', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["English"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study literature from medieval to contemporary with world-renowned scholars.'),

    (edinburgh_id, 'Economics', 'economics', 'L100', 'ma', 'Economics', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Analyse economic systems, policy, and theory with quantitative rigour.'),

    (edinburgh_id, 'Architecture', 'architecture', 'K100', 'ma', 'Architecture', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Learn to design buildings and spaces that shape how people live.'),

    (edinburgh_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBBB", "ucas_points": 120}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Train to become a registered nurse with clinical placements across NHS Scotland.'),

    (edinburgh_id, 'Artificial Intelligence', 'artificial-intelligence', 'G700', 'bsc', 'Computer Science', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study the theory and practice of artificial intelligence and machine learning.'),

    (edinburgh_id, 'Philosophy', 'philosophy', 'V500', 'ma', 'Philosophy', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Engage with fundamental questions about knowledge, reality, and ethics.');

    -- ========================================
    -- University of Glasgow - Additional
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (glasgow_id, 'Medicine', 'medicine', 'A100', 'mbchb', 'Medicine', 5,
     '{"highers": "AAAAA", "ucas_points": 176, "required_subjects": ["Chemistry", "Biology"]}'::jsonb,
     '{"simd20_offer": "AAAAB", "care_experienced_offer": "AAAAB"}'::jsonb,
     'Train to become a doctor with early clinical experience and problem-based learning.'),

    (glasgow_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study Scots and international law at one of the UK''s leading law schools.'),

    (glasgow_id, 'Dentistry', 'dentistry', 'A200', 'bds', 'Dentistry', 5,
     '{"highers": "AAAAB", "ucas_points": 160, "required_subjects": ["Chemistry", "Biology"]}'::jsonb,
     '{"simd20_offer": "AABBB", "care_experienced_offer": "AABBB"}'::jsonb,
     'Train to become a dentist with clinical experience from year one.'),

    (glasgow_id, 'Mathematics', 'mathematics', 'G100', 'bsc', 'Mathematics', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study pure and applied mathematics with research-active academics.'),

    (glasgow_id, 'Physics', 'physics', 'F300', 'bsc', 'Physics', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study physics from gravitational waves to quantum technology.'),

    (glasgow_id, 'History', 'history', 'V100', 'ma', 'History', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Explore Scottish, British, and world history with leading historians.'),

    (glasgow_id, 'Chemistry', 'chemistry', 'F100', 'bsc', 'Chemistry', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Chemistry", "Mathematics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study chemistry in world-class laboratories with Nobel Prize-winning heritage.'),

    (glasgow_id, 'English Literature', 'english-literature', 'Q300', 'ma', 'English', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["English"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study literature from Chaucer to contemporary Scottish writing.'),

    (glasgow_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Train as a registered nurse with placements across NHS Greater Glasgow.'),

    (glasgow_id, 'Accounting and Finance', 'accounting-finance', 'NN43', 'ba', 'Business & Management', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study accounting and finance at a top UK business school.');

    -- ========================================
    -- University of St Andrews - Additional
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (standrews_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "AAAA", "ucas_points": 152}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study psychology at one of the UK''s top-ranked psychology departments.'),

    (standrews_id, 'Mathematics', 'mathematics', 'G100', 'bsc', 'Mathematics', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study mathematics in a department with a 600-year heritage.'),

    (standrews_id, 'Physics', 'physics', 'F300', 'bsc', 'Physics', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study physics and astronomy with access to world-leading research facilities.'),

    (standrews_id, 'History', 'history', 'V100', 'ma', 'History', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Explore history from medieval Scotland to modern global politics.'),

    (standrews_id, 'English', 'english', 'Q300', 'ma', 'English', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["English"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study English literature and creative writing at a world-leading department.'),

    (standrews_id, 'Economics', 'economics', 'L100', 'ma', 'Economics', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study economics with a focus on both theory and real-world application.'),

    (standrews_id, 'Chemistry', 'chemistry', 'F100', 'bsc', 'Chemistry', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Chemistry", "Mathematics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study chemistry with opportunities for industrial placements and research.'),

    (standrews_id, 'Biology', 'biology', 'C100', 'bsc', 'Biological Sciences', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Biology"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study biology from molecular to ecosystem levels.');

    -- ========================================
    -- Heriot-Watt University
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (heriotwatt_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing with strong industry links and placement opportunities.'),

    (heriotwatt_id, 'Civil Engineering', 'civil-engineering', 'H200', 'beng', 'Engineering', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Design and build the infrastructure that society depends on.'),

    (heriotwatt_id, 'Mechanical Engineering', 'mechanical-engineering', 'H300', 'beng', 'Engineering', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study mechanical engineering with hands-on project work from year one.'),

    (heriotwatt_id, 'Actuarial Science', 'actuarial-science', 'N323', 'bsc', 'Mathematics', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study actuarial science with exemptions from professional exams.'),

    (heriotwatt_id, 'Chemistry', 'chemistry', 'F100', 'bsc', 'Chemistry', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Chemistry", "Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study chemistry with a focus on practical applications and industry.'),

    (heriotwatt_id, 'Business Management', 'business-management', 'N200', 'ba', 'Business & Management', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study business with opportunities for international exchange.'),

    (heriotwatt_id, 'Architecture', 'architecture', 'K100', 'bsc', 'Architecture', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study architecture with a focus on sustainable design.');

    -- ========================================
    -- University of Stirling
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (stirling_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study psychology on one of Scotland''s most beautiful campuses.'),

    (stirling_id, 'Sport and Exercise Science', 'sport-exercise-science', 'C600', 'bsc', 'Sport', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study sport science at Scotland''s University for Sporting Excellence.'),

    (stirling_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Train as a nurse with placements across NHS Forth Valley.'),

    (stirling_id, 'Business Studies', 'business-studies', 'N100', 'ba', 'Business & Management', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study business with options for international exchange and placements.'),

    (stirling_id, 'Environmental Science', 'environmental-science', 'F900', 'bsc', 'Environmental Science', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study environmental science in Scotland''s most sustainable university.'),

    (stirling_id, 'Film and Media', 'film-media', 'P300', 'ba', 'Media', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study film and media with access to professional production facilities.'),

    (stirling_id, 'Computing Science', 'computing-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing with a focus on software development and data science.');

    -- ========================================
    -- Glasgow Caledonian University
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (gcu_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Train as a nurse with extensive clinical placements across NHS Scotland.'),

    (gcu_id, 'Physiotherapy', 'physiotherapy', 'B160', 'bsc', 'Health Sciences', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Biology"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Train to become a physiotherapist with clinical placements from year one.'),

    (gcu_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing with strong industry links in Scotland''s tech hub.'),

    (gcu_id, 'Civil Engineering', 'civil-engineering', 'H200', 'beng', 'Engineering', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study civil engineering with a focus on sustainable construction.'),

    (gcu_id, 'Business Management', 'business-management', 'N200', 'ba', 'Business & Management', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study business in the heart of Glasgow''s commercial district.'),

    (gcu_id, 'Occupational Therapy', 'occupational-therapy', 'B930', 'bsc', 'Health Sciences', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Train to help people overcome barriers to daily living.'),

    (gcu_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study Scots law with a focus on social justice.');

    -- ========================================
    -- Edinburgh Napier University
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (napier_id, 'Computing', 'computing', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing with strong links to Edinburgh''s thriving tech industry.'),

    (napier_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Train as a nurse with placements across NHS Lothian.'),

    (napier_id, 'Business Management', 'business-management', 'N200', 'ba', 'Business & Management', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study business with opportunities for international exchange.'),

    (napier_id, 'Film', 'film', 'P303', 'ba', 'Media', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study film with access to professional production facilities.'),

    (napier_id, 'Civil Engineering', 'civil-engineering', 'H200', 'beng', 'Engineering', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study civil engineering with a focus on sustainable design.'),

    (napier_id, 'Journalism', 'journalism', 'P500', 'ba', 'Media', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Train as a journalist with practical newsroom experience.'),

    (napier_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study psychology with a focus on applied and clinical settings.');

    -- ========================================
    -- Robert Gordon University
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (rgu_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Train as a nurse with excellent graduate employment rates.'),

    (rgu_id, 'Pharmacy', 'pharmacy', 'B230', 'bsc', 'Pharmacy', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Chemistry"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Train to become a pharmacist with integrated clinical experience.'),

    (rgu_id, 'Architecture', 'architecture', 'K100', 'bsc', 'Architecture', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study architecture in the Granite City with studio-based learning.'),

    (rgu_id, 'Computing Science', 'computing-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing with strong links to the energy and tech sectors.'),

    (rgu_id, 'Mechanical Engineering', 'mechanical-engineering', 'H300', 'beng', 'Engineering', 4,
     '{"highers": "ABBB", "ucas_points": 128, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study mechanical engineering with excellent industry placements.'),

    (rgu_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Study Scots law with a focus on practical legal skills.'),

    (rgu_id, 'Physiotherapy', 'physiotherapy', 'B160', 'bsc', 'Health Sciences', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Biology"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Train as a physiotherapist with clinical placements from year one.');

    -- ========================================
    -- University of the West of Scotland
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (uws_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BCCC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Train as a nurse across multiple campuses in the West of Scotland.'),

    (uws_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "BBCC", "ucas_points": 104, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study computing with strong industry partnerships.'),

    (uws_id, 'Education', 'education', 'X100', 'bed', 'Education', 4,
     '{"highers": "BBBC", "ucas_points": 112}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Train to become a primary school teacher.'),

    (uws_id, 'Business', 'business', 'N100', 'ba', 'Business & Management', 4,
     '{"highers": "BCCC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Study business with a focus on enterprise and innovation.'),

    (uws_id, 'Civil Engineering', 'civil-engineering', 'H200', 'beng', 'Engineering', 4,
     '{"highers": "BBCC", "ucas_points": 104, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study civil engineering with a focus on sustainability.'),

    (uws_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study psychology with opportunities for research experience.');

    -- ========================================
    -- Queen Margaret University
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (qmu_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Train as a nurse at Scotland''s specialist health university.'),

    (qmu_id, 'Physiotherapy', 'physiotherapy', 'B160', 'bsc', 'Health Sciences', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Biology"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Train as a physiotherapist with clinical placements across Scotland.'),

    (qmu_id, 'Speech and Language Therapy', 'speech-language-therapy', 'B620', 'bsc', 'Health Sciences', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Train to help people with communication and swallowing difficulties.'),

    (qmu_id, 'Dietetics', 'dietetics', 'B400', 'bsc', 'Health Sciences', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Chemistry or Biology"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Train to become a registered dietitian.'),

    (qmu_id, 'Public Relations and Media', 'pr-media', 'P210', 'ba', 'Media', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study PR and media with strong industry connections.');

    -- ========================================
    -- University of the Highlands and Islands
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (uhi_id, 'Marine Science', 'marine-science', 'F710', 'bsc', 'Biological Sciences', 4,
     '{"highers": "BBCC", "ucas_points": 104, "required_subjects": ["Biology or Chemistry"]}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Study marine science with access to Scotland''s coastline and islands.'),

    (uhi_id, 'Archaeology', 'archaeology', 'V400', 'ba', 'History', 4,
     '{"highers": "BCCC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Study archaeology in one of the richest archaeological regions in Europe.'),

    (uhi_id, 'Adventure Tourism Management', 'adventure-tourism', 'N870', 'ba', 'Tourism', 4,
     '{"highers": "BCCC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Study tourism with Scotland''s natural landscapes as your classroom.'),

    (uhi_id, 'Computing', 'computing', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "BCCC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Study computing with flexible delivery across the Highlands and Islands.'),

    (uhi_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BCCC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCCC", "simd40_offer": "BCCC"}'::jsonb,
     'Train as a nurse to serve rural and island communities.');

    -- ========================================
    -- Royal Conservatoire of Scotland
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (rcs_id, 'Acting', 'acting', 'W410', 'ba', 'Performing Arts', 3,
     '{"highers": "CCC", "ucas_points": 80}'::jsonb,
     '{"simd20_offer": "DDD", "simd40_offer": "CDD"}'::jsonb,
     'Train as an actor in Scotland''s national conservatoire. Audition required.'),

    (rcs_id, 'Music', 'music', 'W300', 'bmus', 'Music', 4,
     '{"highers": "BBC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "BCC", "simd40_offer": "BBC"}'::jsonb,
     'Study music performance at the highest level. Audition required.'),

    (rcs_id, 'Musical Theatre', 'musical-theatre', 'W313', 'ba', 'Performing Arts', 3,
     '{"highers": "CCC", "ucas_points": 80}'::jsonb,
     '{"simd20_offer": "DDD", "simd40_offer": "CDD"}'::jsonb,
     'Train for a career in musical theatre. Audition required.'),

    (rcs_id, 'Contemporary Performance Practice', 'contemporary-performance', 'W490', 'ba', 'Performing Arts', 4,
     '{"highers": "CCC", "ucas_points": 80}'::jsonb,
     '{"simd20_offer": "DDD", "simd40_offer": "CDD"}'::jsonb,
     'Create innovative performance work across art forms.'),

    (rcs_id, 'Production Technology and Management', 'production-tech', 'W450', 'ba', 'Performing Arts', 4,
     '{"highers": "CCC", "ucas_points": 80}'::jsonb,
     '{"simd20_offer": "DDD", "simd40_offer": "CDD"}'::jsonb,
     'Learn technical and production skills for theatre and events.');

    -- ========================================
    -- University of Strathclyde - Additional
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (strathclyde_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study Scots law at Scotland''s Law School of the Year.'),

    (strathclyde_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing in Glasgow''s vibrant tech ecosystem.'),

    (strathclyde_id, 'Mechanical Engineering', 'mechanical-engineering', 'H300', 'meng', 'Engineering', 5,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study mechanical engineering with a focus on innovation.'),

    (strathclyde_id, 'Architecture', 'architecture', 'K100', 'bsc', 'Architecture', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study architecture at one of Scotland''s top architecture schools.'),

    (strathclyde_id, 'Mathematics', 'mathematics', 'G100', 'bsc', 'Mathematics', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study mathematics with a focus on applications and data science.'),

    (strathclyde_id, 'Education', 'education', 'X100', 'bed', 'Education', 4,
     '{"highers": "ABBB", "ucas_points": 128}'::jsonb,
     '{"simd20_offer": "BBBC", "simd40_offer": "ABBB"}'::jsonb,
     'Train to become a primary school teacher.');

    -- ========================================
    -- University of Dundee - Additional
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (dundee_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study Scots law with a focus on social justice.'),

    (dundee_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing in one of Scotland''s tech hubs.'),

    (dundee_id, 'Civil Engineering', 'civil-engineering', 'H200', 'beng', 'Engineering', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study civil engineering with a focus on sustainability.'),

    (dundee_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study psychology with opportunities for research experience.'),

    (dundee_id, 'Nursing', 'nursing', 'B700', 'bnurs', 'Nursing', 4,
     '{"highers": "BBCC", "ucas_points": 104}'::jsonb,
     '{"simd20_offer": "BCCC", "simd40_offer": "BBCC"}'::jsonb,
     'Train as a nurse with placements across NHS Tayside.');

    -- ========================================
    -- University of Aberdeen - Additional
    -- ========================================
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (aberdeen_id, 'Medicine', 'medicine', 'A100', 'mbchb', 'Medicine', 5,
     '{"highers": "AAAAB", "ucas_points": 160, "required_subjects": ["Chemistry", "Biology"]}'::jsonb,
     '{"simd20_offer": "AABBB", "care_experienced_offer": "AABBB"}'::jsonb,
     'Train to become a doctor serving Scotland and beyond.'),

    (aberdeen_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study computing with strong links to the energy sector.'),

    (aberdeen_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study psychology at one of Scotland''s leading research universities.'),

    (aberdeen_id, 'Chemistry', 'chemistry', 'F100', 'bsc', 'Chemistry', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Chemistry", "Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study chemistry with world-leading energy research opportunities.'),

    (aberdeen_id, 'Geology', 'geology', 'F600', 'bsc', 'Geology', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study geology with field trips across Scotland and beyond.');

END $$;

-- ============================================
-- ADDITIONAL SIMD POSTCODES
-- ============================================

-- More comprehensive postcode coverage across Scotland
INSERT INTO simd_postcodes (postcode, simd_decile, datazone, council_area) VALUES
-- Additional Glasgow postcodes
('G2 1AA', 3, 'S01003003', 'Glasgow City'),
('G3 6AA', 5, 'S01003015', 'Glasgow City'),
('G4 0AA', 2, 'S01003020', 'Glasgow City'),
('G5 0AA', 1, 'S01003025', 'Glasgow City'),
('G13 1AA', 4, 'S01003030', 'Glasgow City'),
('G14 0AA', 3, 'S01003035', 'Glasgow City'),
('G15 6AA', 2, 'S01003040', 'Glasgow City'),
('G20 7AA', 5, 'S01003045', 'Glasgow City'),
('G21 1AA', 1, 'S01003055', 'Glasgow City'),
('G22 5AA', 1, 'S01003060', 'Glasgow City'),
('G23 5AA', 3, 'S01003065', 'Glasgow City'),
('G31 1AA', 2, 'S01003070', 'Glasgow City'),
('G32 6AA', 1, 'S01003075', 'Glasgow City'),
('G33 1AA', 1, 'S01003080', 'Glasgow City'),
('G34 0AA', 1, 'S01003085', 'Glasgow City'),
('G40 1AA', 1, 'S01003090', 'Glasgow City'),
('G41 2AA', 6, 'S01003095', 'Glasgow City'),
('G42 7AA', 5, 'S01003100', 'Glasgow City'),
('G43 1AA', 8, 'S01003105', 'Glasgow City'),
('G44 3AA', 7, 'S01003110', 'Glasgow City'),
('G45 9AA', 2, 'S01003115', 'Glasgow City'),
('G46 6AA', 9, 'S01003120', 'Glasgow City'),
('G51 1AA', 2, 'S01003125', 'Glasgow City'),
('G52 2AA', 3, 'S01003130', 'Glasgow City'),
('G53 5AA', 2, 'S01003135', 'Glasgow City'),

-- Additional Edinburgh postcodes
('EH2 2AA', 6, 'S01002003', 'City of Edinburgh'),
('EH5 1AA', 3, 'S01002015', 'City of Edinburgh'),
('EH7 4AA', 4, 'S01002025', 'City of Edinburgh'),
('EH8 7AA', 5, 'S01002030', 'City of Edinburgh'),
('EH9 1AA', 8, 'S01002035', 'City of Edinburgh'),
('EH11 1AA', 4, 'S01002040', 'City of Edinburgh'),
('EH13 0AA', 7, 'S01002045', 'City of Edinburgh'),
('EH14 1AA', 5, 'S01002055', 'City of Edinburgh'),
('EH16 4AA', 5, 'S01002065', 'City of Edinburgh'),
('EH17 7AA', 3, 'S01002075', 'City of Edinburgh'),

-- Dundee
('DD5 1AA', 5, 'S01004035', 'Dundee City'),

-- Aberdeen
('AB12 3AA', 6, 'S01005025', 'Aberdeen City'),
('AB16 5AA', 4, 'S01005035', 'Aberdeen City'),
('AB21 9AA', 7, 'S01005040', 'Aberdeen City'),
('AB22 8AA', 5, 'S01005045', 'Aberdeen City'),
('AB23 8AA', 8, 'S01005050', 'Aberdeen City'),
('AB25 1AA', 4, 'S01005055', 'Aberdeen City'),

-- Fife
('KY1 1AA', 3, 'S01006010', 'Fife'),
('KY2 5AA', 4, 'S01006020', 'Fife'),
('KY3 9AA', 6, 'S01006030', 'Fife'),
('KY4 0AA', 2, 'S01006040', 'Fife'),
('KY5 8AA', 3, 'S01006050', 'Fife'),
('KY6 1AA', 4, 'S01006060', 'Fife'),
('KY7 4AA', 5, 'S01006070', 'Fife'),
('KY8 1AA', 5, 'S01006080', 'Fife'),
('KY10 2AA', 6, 'S01006090', 'Fife'),
('KY11 4AA', 7, 'S01006100', 'Fife'),
('KY12 7AA', 5, 'S01006110', 'Fife'),
('KY14 6AA', 6, 'S01006120', 'Fife'),
('KY15 4AA', 5, 'S01006130', 'Fife'),

-- Stirling
('FK7 7AA', 4, 'S01007020', 'Stirling'),
('FK10 1AA', 4, 'S01007030', 'Clackmannanshire'),
('FK11 7AA', 5, 'S01007040', 'Clackmannanshire'),
('FK12 5AA', 4, 'S01007050', 'Clackmannanshire'),
('FK13 6AA', 4, 'S01007060', 'Clackmannanshire'),
('FK14 7AA', 5, 'S01007070', 'Clackmannanshire'),
('FK15 0AA', 6, 'S01007080', 'Stirling'),

-- Highland
('IV3 5AA', 5, 'S01008020', 'Highland'),
('IV4 7AA', 6, 'S01008030', 'Highland'),
('IV5 7AA', 6, 'S01008040', 'Highland'),
('IV6 7AA', 5, 'S01008050', 'Highland'),
('IV7 8AA', 5, 'S01008060', 'Highland'),
('IV10 8AA', 5, 'S01008070', 'Highland'),
('IV12 4AA', 5, 'S01008080', 'Highland'),
('IV14 9AA', 4, 'S01008090', 'Highland'),
('IV15 9AA', 5, 'S01008100', 'Highland'),
('IV16 9AA', 5, 'S01008110', 'Highland'),
('IV17 0AA', 5, 'S01008120', 'Highland'),
('IV18 0AA', 5, 'S01008130', 'Highland'),
('IV19 1AA', 5, 'S01008140', 'Highland'),
('IV30 1AA', 4, 'S01008150', 'Moray'),
('IV31 6AA', 5, 'S01008160', 'Moray'),
('IV32 7AA', 6, 'S01008170', 'Moray'),
('IV36 1AA', 5, 'S01008180', 'Moray'),

-- Renfrewshire
('PA3 2AA', 3, 'S01009020', 'Renfrewshire'),
('PA4 8AA', 4, 'S01009030', 'Renfrewshire'),
('PA5 8AA', 5, 'S01009040', 'Renfrewshire'),
('PA6 7AA', 7, 'S01009050', 'Renfrewshire'),
('PA7 5AA', 8, 'S01009060', 'Renfrewshire'),
('PA8 6AA', 6, 'S01009070', 'West Dunbartonshire'),
('PA9 1AA', 9, 'S01009080', 'Renfrewshire'),
('PA10 2AA', 6, 'S01009090', 'Renfrewshire'),
('PA11 3AA', 6, 'S01009100', 'Renfrewshire'),
('PA12 4AA', 5, 'S01009110', 'Renfrewshire'),
('PA13 4AA', 7, 'S01009120', 'Inverclyde'),
('PA14 5AA', 6, 'S01009130', 'Inverclyde'),
('PA15 1AA', 2, 'S01009140', 'Inverclyde'),
('PA16 7AA', 4, 'S01009150', 'Inverclyde'),
('PA17 5AA', 6, 'S01009160', 'Argyll and Bute'),
('PA18 6AA', 5, 'S01009170', 'Inverclyde'),
('PA19 1AA', 3, 'S01009180', 'Inverclyde'),

-- Lanarkshire
('ML1 1AA', 2, 'S01010001', 'North Lanarkshire'),
('ML2 7AA', 3, 'S01010010', 'North Lanarkshire'),
('ML3 6AA', 4, 'S01010020', 'South Lanarkshire'),
('ML4 1AA', 2, 'S01010030', 'North Lanarkshire'),
('ML5 1AA', 1, 'S01010040', 'North Lanarkshire'),
('ML6 6AA', 3, 'S01010050', 'North Lanarkshire'),
('ML7 4AA', 4, 'S01010060', 'North Lanarkshire'),
('ML8 4AA', 5, 'S01010070', 'South Lanarkshire'),
('ML9 1AA', 4, 'S01010080', 'South Lanarkshire'),
('ML10 6AA', 5, 'S01010090', 'South Lanarkshire'),
('ML11 7AA', 5, 'S01010100', 'South Lanarkshire'),
('ML12 6AA', 6, 'S01010110', 'South Lanarkshire'),
('G66 1AA', 6, 'S01010120', 'East Dunbartonshire'),
('G67 1AA', 3, 'S01010130', 'North Lanarkshire'),
('G68 9AA', 5, 'S01010140', 'North Lanarkshire'),
('G69 6AA', 4, 'S01010150', 'North Lanarkshire'),
('G71 5AA', 6, 'S01010160', 'South Lanarkshire'),
('G72 7AA', 5, 'S01010170', 'South Lanarkshire'),
('G73 1AA', 4, 'S01010180', 'South Lanarkshire'),
('G74 1AA', 5, 'S01010190', 'South Lanarkshire'),
('G75 8AA', 6, 'S01010200', 'South Lanarkshire'),

-- Ayrshire
('KA1 1AA', 3, 'S01011001', 'East Ayrshire'),
('KA2 0AA', 4, 'S01011010', 'East Ayrshire'),
('KA3 1AA', 3, 'S01011020', 'East Ayrshire'),
('KA4 8AA', 5, 'S01011030', 'East Ayrshire'),
('KA5 5AA', 4, 'S01011040', 'East Ayrshire'),
('KA6 5AA', 4, 'S01011050', 'East Ayrshire'),
('KA7 1AA', 7, 'S01011060', 'South Ayrshire'),
('KA8 8AA', 5, 'S01011070', 'South Ayrshire'),
('KA9 1AA', 5, 'S01011080', 'South Ayrshire'),
('KA10 6AA', 6, 'S01011090', 'South Ayrshire'),
('KA11 1AA', 5, 'S01011100', 'North Ayrshire'),
('KA12 8AA', 4, 'S01011110', 'North Ayrshire'),
('KA13 6AA', 4, 'S01011120', 'North Ayrshire'),
('KA14 1AA', 5, 'S01011130', 'North Ayrshire'),
('KA15 1AA', 6, 'S01011140', 'North Ayrshire'),
('KA20 3AA', 3, 'S01011150', 'North Ayrshire'),
('KA21 5AA', 4, 'S01011160', 'North Ayrshire'),
('KA22 7AA', 4, 'S01011170', 'North Ayrshire'),
('KA23 8AA', 6, 'S01011180', 'North Ayrshire'),
('KA24 4AA', 3, 'S01011190', 'North Ayrshire'),
('KA25 6AA', 3, 'S01011200', 'North Ayrshire'),
('KA26 9AA', 5, 'S01011210', 'South Ayrshire'),
('KA27 8AA', 5, 'S01011220', 'North Ayrshire'),
('KA28 0AA', 5, 'S01011230', 'North Ayrshire'),
('KA29 0AA', 5, 'S01011240', 'North Ayrshire'),
('KA30 8AA', 6, 'S01011250', 'North Ayrshire'),

-- Borders
('TD1 1AA', 5, 'S01012001', 'Scottish Borders'),
('TD2 6AA', 6, 'S01012010', 'Scottish Borders'),
('TD3 6AA', 6, 'S01012020', 'Scottish Borders'),
('TD4 6AA', 7, 'S01012030', 'Scottish Borders'),
('TD5 7AA', 5, 'S01012040', 'Scottish Borders'),
('TD6 0AA', 5, 'S01012050', 'Scottish Borders'),
('TD7 4AA', 5, 'S01012060', 'Scottish Borders'),
('TD8 6AA', 5, 'S01012070', 'Scottish Borders'),
('TD9 7AA', 4, 'S01012080', 'Scottish Borders'),
('TD10 6AA', 5, 'S01012090', 'Scottish Borders'),
('TD11 3AA', 5, 'S01012100', 'Scottish Borders'),
('TD12 4AA', 6, 'S01012110', 'Scottish Borders'),
('TD13 5AA', 7, 'S01012120', 'Scottish Borders'),
('TD14 5AA', 5, 'S01012130', 'Scottish Borders'),
('TD15 1AA', 5, 'S01012140', 'Scottish Borders'),

-- Dumfries and Galloway
('DG1 1AA', 4, 'S01013001', 'Dumfries and Galloway'),
('DG2 7AA', 5, 'S01013010', 'Dumfries and Galloway'),
('DG3 4AA', 5, 'S01013020', 'Dumfries and Galloway'),
('DG4 6AA', 4, 'S01013030', 'Dumfries and Galloway'),
('DG5 4AA', 5, 'S01013040', 'Dumfries and Galloway'),
('DG6 4AA', 5, 'S01013050', 'Dumfries and Galloway'),
('DG7 1AA', 4, 'S01013060', 'Dumfries and Galloway'),
('DG8 6AA', 4, 'S01013070', 'Dumfries and Galloway'),
('DG9 7AA', 5, 'S01013080', 'Dumfries and Galloway'),
('DG10 9AA', 5, 'S01013090', 'Dumfries and Galloway'),
('DG11 1AA', 4, 'S01013100', 'Dumfries and Galloway'),
('DG12 5AA', 4, 'S01013110', 'Dumfries and Galloway'),
('DG13 0AA', 5, 'S01013120', 'Dumfries and Galloway'),
('DG14 0AA', 5, 'S01013130', 'Dumfries and Galloway'),
('DG16 5AA', 4, 'S01013140', 'Dumfries and Galloway'),

-- Perth and Kinross
('PH1 1AA', 5, 'S01014001', 'Perth and Kinross'),
('PH2 6AA', 7, 'S01014010', 'Perth and Kinross'),
('PH3 1AA', 6, 'S01014020', 'Perth and Kinross'),
('PH5 2AA', 6, 'S01014030', 'Perth and Kinross'),
('PH6 2AA', 6, 'S01014040', 'Perth and Kinross'),
('PH7 3AA', 6, 'S01014050', 'Perth and Kinross'),
('PH8 0AA', 6, 'S01014060', 'Perth and Kinross'),
('PH10 6AA', 5, 'S01014070', 'Perth and Kinross'),
('PH11 8AA', 5, 'S01014080', 'Angus'),
('PH12 8AA', 5, 'S01014090', 'Perth and Kinross'),
('PH13 9AA', 5, 'S01014100', 'Perth and Kinross'),
('PH14 9AA', 7, 'S01014110', 'Perth and Kinross'),
('PH15 2AA', 5, 'S01014120', 'Perth and Kinross'),
('PH16 5AA', 6, 'S01014130', 'Perth and Kinross'),

-- Angus
('DD7 6AA', 5, 'S01015001', 'Angus'),
('DD8 1AA', 5, 'S01015010', 'Angus'),
('DD9 6AA', 4, 'S01015020', 'Angus'),
('DD10 8AA', 5, 'S01015030', 'Angus'),
('DD11 1AA', 4, 'S01015040', 'Angus'),

-- Lothians
('EH18 1AA', 6, 'S01016001', 'Midlothian'),
('EH19 2AA', 4, 'S01016010', 'Midlothian'),
('EH20 9AA', 6, 'S01016020', 'Midlothian'),
('EH21 6AA', 5, 'S01016030', 'East Lothian'),
('EH22 1AA', 4, 'S01016040', 'Midlothian'),
('EH23 4AA', 5, 'S01016050', 'Midlothian'),
('EH24 9AA', 6, 'S01016060', 'Midlothian'),
('EH25 9AA', 5, 'S01016070', 'Midlothian'),
('EH26 0AA', 7, 'S01016080', 'Midlothian'),
('EH27 8AA', 6, 'S01016090', 'West Lothian'),
('EH28 8AA', 8, 'S01016100', 'City of Edinburgh'),
('EH29 9AA', 7, 'S01016110', 'City of Edinburgh'),
('EH30 9AA', 9, 'S01016120', 'City of Edinburgh'),
('EH31 2AA', 8, 'S01016130', 'East Lothian'),
('EH32 0AA', 6, 'S01016140', 'East Lothian'),
('EH33 1AA', 5, 'S01016150', 'East Lothian'),
('EH34 5AA', 7, 'S01016160', 'East Lothian'),
('EH35 5AA', 7, 'S01016170', 'East Lothian'),
('EH36 5AA', 6, 'S01016180', 'Midlothian'),
('EH37 5AA', 7, 'S01016190', 'Midlothian'),
('EH38 5AA', 7, 'S01016200', 'Midlothian'),
('EH39 4AA', 8, 'S01016210', 'East Lothian'),
('EH40 3AA', 7, 'S01016220', 'East Lothian'),
('EH41 3AA', 7, 'S01016230', 'East Lothian'),
('EH42 1AA', 6, 'S01016240', 'East Lothian'),

-- West Lothian
('EH47 7AA', 3, 'S01017001', 'West Lothian'),
('EH48 1AA', 4, 'S01017010', 'West Lothian'),
('EH49 6AA', 8, 'S01017020', 'West Lothian'),
('EH51 9AA', 5, 'S01017030', 'West Lothian'),
('EH52 5AA', 7, 'S01017040', 'West Lothian'),
('EH53 0AA', 6, 'S01017050', 'West Lothian'),
('EH54 5AA', 4, 'S01017060', 'West Lothian'),
('EH55 8AA', 6, 'S01017070', 'West Lothian'),

-- Falkirk
('FK1 1AA', 4, 'S01018001', 'Falkirk'),
('FK2 7AA', 5, 'S01018010', 'Falkirk'),
('FK3 8AA', 4, 'S01018020', 'Falkirk'),
('FK4 1AA', 5, 'S01018030', 'Falkirk'),
('FK5 3AA', 5, 'S01018040', 'Falkirk'),
('FK6 5AA', 7, 'S01018050', 'Falkirk'),

-- West Dunbartonshire
('G60 5AA', 6, 'S01019001', 'West Dunbartonshire'),
('G81 1AA', 3, 'S01019010', 'West Dunbartonshire'),
('G82 1AA', 3, 'S01019020', 'West Dunbartonshire'),
('G83 0AA', 6, 'S01019030', 'West Dunbartonshire'),
('G84 7AA', 7, 'S01019040', 'Argyll and Bute'),

-- East Dunbartonshire
('G62 6AA', 10, 'S01020001', 'East Dunbartonshire'),
('G63 0AA', 9, 'S01020010', 'Stirling'),
('G64 1AA', 8, 'S01020020', 'East Dunbartonshire'),
('G65 0AA', 6, 'S01020030', 'North Lanarkshire'),

-- East Renfrewshire
('G76 7AA', 9, 'S01021001', 'East Renfrewshire'),
('G77 5AA', 10, 'S01021010', 'East Renfrewshire'),
('G78 1AA', 7, 'S01021020', 'East Renfrewshire'),

-- Islands
('HS1 2AA', 4, 'S01022001', 'Na h-Eileanan Siar'),
('HS2 0AA', 5, 'S01022010', 'Na h-Eileanan Siar'),
('KW15 1AA', 4, 'S01023001', 'Orkney Islands'),
('KW16 3AA', 5, 'S01023010', 'Orkney Islands'),
('KW17 2AA', 5, 'S01023020', 'Orkney Islands'),
('ZE1 0AA', 5, 'S01024001', 'Shetland Islands'),
('ZE2 9AA', 5, 'S01024010', 'Shetland Islands')

ON CONFLICT (postcode) DO NOTHING;
