-- Specialist-provider courses seed
-- Providers: Glasgow School of Art (GSA), Royal Conservatoire of Scotland (RCS),
--            Scotland's Rural College (SRUC), University of the Highlands and Islands (UHI)
-- Date: 2026-04-25
-- Idempotent: uses ON CONFLICT (slug) DO NOTHING so re-running is safe.

-- University IDs (captured 2026-04-25):
--   GSA  = 68a776ca-c13d-4fe8-a391-5b7b90aa3353
--   RCS  = 200a3874-68ad-44df-9924-513041fee634
--   SRUC = 0ed68062-4ef6-419a-827d-cfdbc09b2c9d
--   UHI  = 939894a6-f553-4250-b1d1-4f9cae1cfa21

-- ============================================================================
-- Glasgow School of Art (13 courses)
-- All require portfolio submission (except Product Design Engineering which
-- runs jointly with University of Glasgow and is not listed here). GSA does
-- not set a UCAS tariff; offer is based primarily on portfolio with Higher
-- English used as the language-proficiency check.
-- ============================================================================

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, outcomes_needs_verification)
VALUES
  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Fine Art - Painting and Printmaking', 'fine-art-painting-and-printmaking-gsa', NULL, 'ba', 'Art and Design',
   'The largest specialist programme within GSA''s School of Fine Art. Studio-based practice in painting and printmaking with access to Glasgow''s cultural venues as a live testing ground. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "GSA applies minimum entry requirements to SIMD20/40, care-experienced, estranged, caring, refugee and free-school-meal applicants. WP applicants also receive portfolio and interview support."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Fine Art - Photography', 'fine-art-photography-gsa', NULL, 'ba', 'Art and Design',
   'Practice-led BA (Hons) exploring photography as contemporary fine-art medium. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "GSA applies minimum entry requirements to SIMD20/40 and other WP categories; Digital Portfolio support available."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Fine Art - Sculpture and Environmental Art', 'fine-art-sculpture-and-environmental-art-gsa', NULL, 'ba', 'Art and Design',
   'BA (Hons) in sculpture, installation and site-specific practice. Programme emphasises material experimentation and public-context work. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories with portfolio support."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Communication Design', 'communication-design-gsa', NULL, 'ba', 'Art and Design',
   'BA (Hons) in graphic design, illustration and photography-as-communication. Studio-based with industry-facing projects. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Fashion Design', 'fashion-design-gsa', NULL, 'ba', 'Fashion and Textile Technology',
   'BA (Hons) covering concept, pattern, construction and contextual research. Portfolio required; applicants typically include constructed garments as part of the submission.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Interior Design', 'interior-design-gsa', NULL, 'ba', 'Art and Design',
   'BA (Hons) in spatial, exhibition and interior design with cross-disciplinary projects. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Silversmithing and Jewellery Design', 'silversmithing-and-jewellery-design-gsa', NULL, 'ba', 'Art and Design',
   'Award-winning BA (Hons) covering body adornment and fine metalworking from concept through to finished piece. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Textile Design', 'textile-design-gsa', NULL, 'ba', 'Fashion and Textile Technology',
   'BA (Hons) in printed, woven, embroidered and knitted textiles. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Product Design', 'product-design-gsa', NULL, 'ba', 'Art and Design',
   'BDes (Hons) in user-centred product and service design. Shares a common core with the joint MEDes (Master of European Design) pathway. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Architecture', 'architecture-gsa', 'K100', 'ba', 'Built Environment',
   'BArch (Hons) - three-year RIBA Part 1 accredited degree delivered from the Mackintosh School of Architecture. Portfolio required; Higher Maths strongly recommended.',
   3,
   '{"highers": "BBBB", "portfolio_required": true, "minimum_higher_english": "C", "recommended_subjects": ["Mathematics"]}'::jsonb,
   '{"simd20_offer": "BBCC", "simd40_offer": "BBBC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories. WP applicants receive portfolio and interview support."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Environmental Architecture', 'environmental-architecture-gsa', NULL, 'bsc', 'Built Environment',
   'BSc (Hons) in climate-responsive architecture and sustainable design practice. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C", "recommended_subjects": ["Mathematics", "Geography"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', 'Sound for the Moving Image', 'sound-for-the-moving-image-gsa', NULL, 'ba', 'Music Technology',
   'BDes (Hons) in sound design for film, animation and games delivered through GSA''s School of Innovation. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true),

  ('68a776ca-c13d-4fe8-a391-5b7b90aa3353', '3D Modelling', '3d-modelling-gsa', NULL, 'bsc', 'Digital Media',
   'BSc (Hons) in 3D modelling and visualisation for games, animation, VFX and immersive media. Portfolio required.',
   4,
   '{"highers": "BBB", "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Minimum entry offer applies for SIMD20/40 and other WP categories."}'::jsonb,
   true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Royal Conservatoire of Scotland (6 additional courses; 5 already exist)
-- All RCS programmes require audition. Applications go via UCAS Conservatoires
-- (not standard UCAS). Academic requirements are lower than other universities
-- (typically Higher English at C for language) with entry primarily on audition.
-- ============================================================================

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, outcomes_needs_verification)
VALUES
  ('200a3874-68ad-44df-9924-513041fee634', 'Filmmaking', 'filmmaking-rcs', NULL, 'ba', 'Film and Media',
   'Practical BA Filmmaking programme covering writing, directing, cinematography and editing. Applicants pick a specialism and work collaboratively with peers across acting, production and music. Audition/interview and showreel required.',
   3,
   '{"highers": "CCC", "ucas_points": 80, "audition_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Entry primarily on audition and portfolio; academic grades are a secondary consideration."}'::jsonb,
   true),

  ('200a3874-68ad-44df-9924-513041fee634', 'Digital Film and Television', 'digital-film-and-television-rcs', NULL, 'ba', 'Film and Media',
   'Three-year BA DFTV programme focused on the art and craft of film-making. Students move from micro-shorts through to fully-realised short films during the degree. Audition/interview and showreel required.',
   3,
   '{"highers": "CCC", "ucas_points": 80, "audition_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Entry primarily on audition and portfolio; academic grades are a secondary consideration."}'::jsonb,
   true),

  ('200a3874-68ad-44df-9924-513041fee634', 'Performance (BA)', 'performance-ba-rcs', NULL, 'ba', 'Performing Arts',
   'Three-year BA Performance designed for deaf and hard-of-hearing performers. Develops skills in acting, movement, devising, signing on stage, improvisation, puppetry and short-film-making. Audition required.',
   3,
   '{"highers": "CCC", "ucas_points": 80, "audition_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Entry primarily on audition; access to the audition process is provided with BSL/English interpretation."}'::jsonb,
   true),

  ('200a3874-68ad-44df-9924-513041fee634', 'Composition', 'composition-rcs', NULL, 'bmus', 'Music',
   'Four-year BMus (Hons) Composition programme with options to include a second study in performance or cross-disciplinary projects with dance, theatre, film and musical theatre. Portfolio of compositions required.',
   4,
   '{"highers": "BBC", "ucas_points": 96, "audition_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "BCC", "simd40_offer": "BBC", "notes": "Entry primarily on composition portfolio and interview."}'::jsonb,
   true),

  ('200a3874-68ad-44df-9924-513041fee634', 'Modern Ballet', 'modern-ballet-rcs', NULL, 'ba', 'Dance',
   'Three-year BA Modern Ballet delivered in partnership with Scottish Ballet. Intensive classical and contemporary training preparing graduates for professional company work. Audition required.',
   3,
   '{"highers": "CCC", "ucas_points": 80, "audition_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Entry primarily on audition; academic grades are a secondary consideration."}'::jsonb,
   true),

  ('200a3874-68ad-44df-9924-513041fee634', 'Production Arts and Design', 'production-arts-and-design-rcs', NULL, 'ba', 'Performing Arts',
   'Four-year BA in set, costume, lighting and projection design for theatre, opera, dance and live events. Portfolio and interview required.',
   4,
   '{"highers": "CCC", "ucas_points": 80, "portfolio_required": true, "minimum_higher_english": "C"}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Entry primarily on portfolio and interview."}'::jsonb,
   true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Scotland's Rural College (8 courses)
-- Degrees delivered primarily from SRUC Edinburgh (King''s Buildings) with
-- awarding bodies University of Edinburgh or University of Glasgow depending
-- on programme. Entry requirements reflect a vocational focus: BBC-CCC at
-- Higher is typical, with sciences preferred for animal/agriculture courses.
-- ============================================================================

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, outcomes_needs_verification)
VALUES
  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Agriculture', 'agriculture-sruc', 'D400', 'bsc', 'Agriculture',
   'BSc (Hons) Agriculture delivered at SRUC Edinburgh with farm-based teaching across Scottish rural estates. Awarded by the University of Edinburgh. Covers livestock systems, arable production, farm business and sustainable land management.',
   4,
   '{"highers": "BBC", "ucas_points": 96, "recommended_subjects": ["Biology", "Chemistry", "Mathematics"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants; contact admissions for individualised offer."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Applied Animal Science', 'applied-animal-science-sruc', NULL, 'bsc', 'Biology',
   'BSc (Hons) Applied Animal Science focuses on companion, production and wildlife animal management. Delivered at SRUC Edinburgh with practical placements.',
   4,
   '{"highers": "BBC", "ucas_points": 114, "recommended_subjects": ["Biology", "Chemistry"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Animal Welfare Science', 'animal-welfare-science-sruc', NULL, 'bsc', 'Biology',
   'BSc (Hons) Animal Welfare Science examines animal behaviour, cognition and ethics across production, companion and wildlife contexts. Delivered at SRUC Edinburgh.',
   4,
   '{"highers": "BBC", "ucas_points": 114, "recommended_subjects": ["Biology", "Chemistry"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Veterinary Nursing', 'veterinary-nursing-sruc', NULL, 'bsc', 'Biology',
   'BSc (Hons) Veterinary Nursing combines academic study with RCVS-accredited clinical placement. Delivered at SRUC Edinburgh with the Royal (Dick) School of Veterinary Studies. Covers anatomy, physiology, pharmacology, anaesthesia, diagnostic imaging and theatre practice.',
   4,
   '{"highers": "BBB", "ucas_points": 120, "required_subjects": ["Biology"], "recommended_subjects": ["Chemistry", "Mathematics"]}'::jsonb,
   '{"simd20_offer": "BCC", "simd40_offer": "BBC", "notes": "RCVS registration routes apply on graduation. SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Veterinary Biosciences', 'veterinary-biosciences-sruc', NULL, 'bsc', 'Biology',
   'BSc (Hons) Veterinary Biosciences provides a science-focused route for students interested in veterinary research, one-health and laboratory careers. Delivered at SRUC Edinburgh.',
   4,
   '{"highers": "BBB", "ucas_points": 120, "required_subjects": ["Biology"], "recommended_subjects": ["Chemistry"]}'::jsonb,
   '{"simd20_offer": "BCC", "simd40_offer": "BBC", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Environmental Management', 'environmental-management-sruc', NULL, 'bsc', 'Environmental Science',
   'BSc (Hons) Environmental Management covers climate change, land use, conservation and environmental policy. Delivered at SRUC Edinburgh with field modules across Scottish landscapes.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "recommended_subjects": ["Biology", "Geography", "Chemistry"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Rural Business Management', 'rural-business-management-sruc', NULL, 'ba', 'Business Management',
   'BA (Hons) Rural Business Management prepares graduates for leadership in farming, estates, agri-food and rural enterprise. Delivered at SRUC Edinburgh.',
   4,
   '{"highers": "BBC", "ucas_points": 96, "recommended_subjects": ["English", "Mathematics", "Business Management"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants."}'::jsonb,
   true),

  ('0ed68062-4ef6-419a-827d-cfdbc09b2c9d', 'Horticulture', 'horticulture-sruc', NULL, 'bsc', 'Biology',
   'BSc (Hons) Horticulture covering production horticulture, amenity landscapes and plant science. Delivered from SRUC Edinburgh, Elmwood and Oatridge campuses.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "recommended_subjects": ["Biology", "Chemistry"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "SRUC offers adjusted offers for SIMD20/40 and care-experienced applicants. Multiple-campus delivery."}'::jsonb,
   true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- University of the Highlands and Islands (9 additional courses; 16 exist)
-- UHI delivers through 10 partner colleges and research institutions across
-- the Highlands, Islands, Moray and Perthshire. Many programmes are available
-- at specific campuses only; delivery notes captured in widening-access notes.
-- UHI entry requirements are typically CC-BBB at Higher with a strong
-- widening-access mission.
-- ============================================================================

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, outcomes_needs_verification)
VALUES
  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Applied Music', 'applied-music-uhi', 'W310', 'ba', 'Music',
   'BA (Hons) Applied Music delivered at UHI Perth covering performance, composition, music technology and the traditional music of Scotland. Audition required.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "audition_required": true, "recommended_subjects": ["Music"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Delivered at UHI Perth. Entry on audition plus academic evidence; adjusted offers for SIMD20/40, care-experienced and rural-access applicants."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Oral Health Science', 'oral-health-science-uhi', 'B750', 'bsc', 'Biology',
   'BSc Oral Health Science trains dental hygienists and dental therapists. Delivered from UHI''s purpose-built dental facilities at Inverness, Stornoway and Dumfries. GDC registration on graduation.',
   3,
   '{"highers": "BBB", "ucas_points": 120, "required_subjects": ["Human Biology"], "recommended_subjects": ["Chemistry", "Biology"]}'::jsonb,
   '{"simd20_offer": "BCC", "simd40_offer": "BBC", "notes": "Delivered across Inverness, Stornoway and Dumfries campuses. Adjusted offers for SIMD20/40, care-experienced and rural-access applicants."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Social Sciences', 'social-sciences-uhi', 'L300', 'ba', 'People and Society',
   'BA (Hons) Social Sciences covering sociology, politics, anthropology and community development. Available at multiple partner colleges and online.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "recommended_subjects": ["English", "Modern Studies", "History"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Flexible delivery across UHI partner colleges and online. Adjusted offers for SIMD20/40 and rural-access applicants."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Psychology', 'psychology-uhi', 'C800', 'bsc', 'Psychology',
   'BSc (Hons) Psychology accredited by the British Psychological Society for Graduate Basis for Chartered Membership. Available across UHI partner colleges and online.',
   4,
   '{"highers": "BBB", "ucas_points": 104, "recommended_subjects": ["Psychology", "Biology", "Mathematics"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Flexible delivery across UHI partner colleges. Adjusted offers for SIMD20/40 and rural-access applicants."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Sport and Fitness', 'sport-and-fitness-uhi', 'C600', 'bsc', 'Sport and Fitness',
   'BSc (Hons) Sport and Fitness covering exercise physiology, coaching, nutrition and the business of sport. Delivered primarily from UHI Inverness with placement opportunities.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "recommended_subjects": ["Physical Education", "Biology", "Human Biology"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Delivered from UHI Inverness. Adjusted offers for SIMD20/40, care-experienced and rural-access applicants."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Visual Communication', 'visual-communication-uhi', 'W210', 'ba', 'Art and Design',
   'BA (Hons) Visual Communication covering graphic design, illustration and digital media. Delivered from UHI partner colleges with portfolio required.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "portfolio_required": true, "recommended_subjects": ["Art and Design", "Graphic Communication"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Delivered from UHI partner colleges. Adjusted offers for SIMD20/40 and rural-access applicants; portfolio support available."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Child and Youth Studies', 'child-and-youth-studies-uhi', 'X350', 'ba', 'Early Learning and Childcare',
   'BA (Hons) Child and Youth Studies prepares graduates for careers in early years, youth work, community development and children''s services.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "recommended_subjects": ["English", "Psychology", "Modern Studies"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Flexible delivery across UHI partner colleges. Adjusted offers for SIMD20/40 and rural-access applicants. PVG membership required on placement."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Forestry Management', 'forestry-management-uhi', 'D512', 'bsc', 'Environmental Science',
   'BSc (Hons) Forestry Management delivered through the Scottish School of Forestry at UHI Inverness. Covers silviculture, forest ecology, timber production and woodland policy.',
   4,
   '{"highers": "BBC", "ucas_points": 96, "recommended_subjects": ["Biology", "Geography", "Environmental Science"]}'::jsonb,
   '{"simd20_offer": "CCC", "simd40_offer": "BCC", "notes": "Delivered through the Scottish School of Forestry at UHI Inverness. Adjusted offers for SIMD20/40, care-experienced and rural-access applicants."}'::jsonb,
   true),

  ('939894a6-f553-4250-b1d1-4f9cae1cfa21', 'Theology', 'theology-uhi', 'V600', 'ba', 'Religious, Moral and Philosophical Studies (RMPS)',
   'BA (Hons) Theology delivered through Highland Theological College at UHI. Covers biblical studies, systematic theology, church history and applied theology.',
   4,
   '{"highers": "CCC", "ucas_points": 96, "recommended_subjects": ["English", "Religious, Moral and Philosophical Studies"]}'::jsonb,
   '{"simd20_offer": "DDD", "simd40_offer": "CDD", "notes": "Delivered from Highland Theological College (Dingwall). Adjusted offers for SIMD20/40 and rural-access applicants."}'::jsonb,
   true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Course subject requirements
-- Pattern mirrors existing data (qualification_level in ('higher','n5'), grades
-- A/B/C, N5 @ C added as prerequisite where Higher is mandatory). RCS is
-- audition-based so no new subject requirements are written for RCS courses.
-- ============================================================================

-- GSA subject requirements (38 rows)
WITH course_ids AS (SELECT slug, id FROM courses WHERE slug LIKE '%-gsa'),
     subject_ids AS (SELECT name, id FROM subjects)
INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory, notes)
SELECT * FROM (VALUES
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-painting-and-printmaking-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended; portfolio is the substantive entry requirement.'),
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-painting-and-printmaking-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-photography-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended; portfolio is the substantive entry requirement.'),
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-photography-gsa'), (SELECT id FROM subject_ids WHERE name = 'Photography'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-photography-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-sculpture-and-environmental-art-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended; portfolio is the substantive entry requirement.'),
  ((SELECT id FROM course_ids WHERE slug = 'fine-art-sculpture-and-environmental-art-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'communication-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'communication-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Graphic Communication'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'communication-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'fashion-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'fashion-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Fashion and Textile Technology'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'fashion-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'interior-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'interior-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Graphic Communication'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'interior-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'silversmithing-and-jewellery-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'silversmithing-and-jewellery-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'textile-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'textile-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Fashion and Textile Technology'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'textile-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'product-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'product-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'Design and Manufacture'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'product-design-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'Mathematics'), 'higher', 'C', true, 'Required for structural and quantitative work.'),
  ((SELECT id FROM course_ids WHERE slug = 'architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'Mathematics'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'Mathematics'), 'higher', 'C', false, 'Strongly recommended.'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'Geography'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-architecture-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'sound-for-the-moving-image-gsa'), (SELECT id FROM subject_ids WHERE name = 'Music'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'sound-for-the-moving-image-gsa'), (SELECT id FROM subject_ids WHERE name = 'Music Technology'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'sound-for-the-moving-image-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = '3d-modelling-gsa'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio submission.'),
  ((SELECT id FROM course_ids WHERE slug = '3d-modelling-gsa'), (SELECT id FROM subject_ids WHERE name = 'Computing Science'), 'higher', 'C', false, 'Useful preparation for 3D software work.'),
  ((SELECT id FROM course_ids WHERE slug = '3d-modelling-gsa'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.')
) AS v(course_id, subject_id, qualification_level, min_grade, is_mandatory, notes);

-- SRUC subject requirements (25 rows)
WITH course_ids AS (SELECT slug, id FROM courses WHERE slug LIKE '%-sruc'),
     subject_ids AS (SELECT name, id FROM subjects)
INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory, notes)
SELECT * FROM (VALUES
  ((SELECT id FROM course_ids WHERE slug = 'agriculture-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', true, 'Required science subject.'),
  ((SELECT id FROM course_ids WHERE slug = 'agriculture-sruc'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.'),
  ((SELECT id FROM course_ids WHERE slug = 'agriculture-sruc'), (SELECT id FROM subject_ids WHERE name = 'Mathematics'), 'higher', 'C', false, 'Recommended for farm business and quantitative work.'),
  ((SELECT id FROM course_ids WHERE slug = 'agriculture-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'applied-animal-science-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', true, 'Required science subject.'),
  ((SELECT id FROM course_ids WHERE slug = 'applied-animal-science-sruc'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.'),
  ((SELECT id FROM course_ids WHERE slug = 'applied-animal-science-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'animal-welfare-science-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', true, 'Required science subject.'),
  ((SELECT id FROM course_ids WHERE slug = 'animal-welfare-science-sruc'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.'),
  ((SELECT id FROM course_ids WHERE slug = 'animal-welfare-science-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-nursing-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'B', true, 'Required science at Higher B or above for RCVS-accredited route.'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-nursing-sruc'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-nursing-sruc'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-nursing-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-biosciences-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'B', true, 'Required science at Higher B or above.'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-biosciences-sruc'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.'),
  ((SELECT id FROM course_ids WHERE slug = 'veterinary-biosciences-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-management-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', false, 'Recommended science.'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-management-sruc'), (SELECT id FROM subject_ids WHERE name = 'Geography'), 'higher', 'C', false, 'Recommended.'),
  ((SELECT id FROM course_ids WHERE slug = 'environmental-management-sruc'), (SELECT id FROM subject_ids WHERE name = 'Environmental Science'), 'higher', 'C', false, 'Recommended.'),
  ((SELECT id FROM course_ids WHERE slug = 'rural-business-management-sruc'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'rural-business-management-sruc'), (SELECT id FROM subject_ids WHERE name = 'Mathematics'), 'higher', 'C', false, 'Recommended for finance and business analysis modules.'),
  ((SELECT id FROM course_ids WHERE slug = 'rural-business-management-sruc'), (SELECT id FROM subject_ids WHERE name = 'Business Management'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'horticulture-sruc'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', false, 'Recommended science.'),
  ((SELECT id FROM course_ids WHERE slug = 'horticulture-sruc'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.')
) AS v(course_id, subject_id, qualification_level, min_grade, is_mandatory, notes);

-- UHI subject requirements (30 rows for the 9 newly added UHI courses)
WITH course_ids AS (
  SELECT slug, id FROM courses WHERE slug IN (
    'applied-music-uhi','oral-health-science-uhi','social-sciences-uhi','psychology-uhi',
    'sport-and-fitness-uhi','visual-communication-uhi','child-and-youth-studies-uhi',
    'forestry-management-uhi','theology-uhi'
  )
),
subject_ids AS (SELECT name, id FROM subjects)
INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory, notes)
SELECT * FROM (VALUES
  ((SELECT id FROM course_ids WHERE slug = 'applied-music-uhi'), (SELECT id FROM subject_ids WHERE name = 'Music'), 'higher', 'C', false, 'Recommended; audition is the primary entry route.'),
  ((SELECT id FROM course_ids WHERE slug = 'applied-music-uhi'), (SELECT id FROM subject_ids WHERE name = 'Music Technology'), 'higher', 'C', false, 'Useful for the technology pathway.'),
  ((SELECT id FROM course_ids WHERE slug = 'applied-music-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'oral-health-science-uhi'), (SELECT id FROM subject_ids WHERE name = 'Human Biology'), 'higher', 'B', true, 'Required; Biology also accepted.'),
  ((SELECT id FROM course_ids WHERE slug = 'oral-health-science-uhi'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'B', false, 'Alternative to Human Biology.'),
  ((SELECT id FROM course_ids WHERE slug = 'oral-health-science-uhi'), (SELECT id FROM subject_ids WHERE name = 'Chemistry'), 'higher', 'C', false, 'Recommended second science.'),
  ((SELECT id FROM course_ids WHERE slug = 'oral-health-science-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for GDC registration route.'),
  ((SELECT id FROM course_ids WHERE slug = 'oral-health-science-uhi'), (SELECT id FROM subject_ids WHERE name = 'Human Biology'), 'n5', 'C', true, 'Standard N5 prerequisite for progression to Higher'),
  ((SELECT id FROM course_ids WHERE slug = 'social-sciences-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'social-sciences-uhi'), (SELECT id FROM subject_ids WHERE name = 'Modern Studies'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'social-sciences-uhi'), (SELECT id FROM subject_ids WHERE name = 'History'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'psychology-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'psychology-uhi'), (SELECT id FROM subject_ids WHERE name = 'Psychology'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'psychology-uhi'), (SELECT id FROM subject_ids WHERE name = 'Mathematics'), 'higher', 'C', false, 'Recommended for statistical modules.'),
  ((SELECT id FROM course_ids WHERE slug = 'psychology-uhi'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', false, 'Recommended for biological psychology modules.'),
  ((SELECT id FROM course_ids WHERE slug = 'sport-and-fitness-uhi'), (SELECT id FROM subject_ids WHERE name = 'Physical Education'), 'higher', 'C', false, 'Recommended.'),
  ((SELECT id FROM course_ids WHERE slug = 'sport-and-fitness-uhi'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', false, 'Recommended science.'),
  ((SELECT id FROM course_ids WHERE slug = 'sport-and-fitness-uhi'), (SELECT id FROM subject_ids WHERE name = 'Human Biology'), 'higher', 'C', false, 'Alternative to Biology.'),
  ((SELECT id FROM course_ids WHERE slug = 'sport-and-fitness-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'visual-communication-uhi'), (SELECT id FROM subject_ids WHERE name = 'Art and Design'), 'higher', 'C', false, 'Strongly recommended alongside portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'visual-communication-uhi'), (SELECT id FROM subject_ids WHERE name = 'Graphic Communication'), 'higher', 'C', false, 'Useful preparation for the portfolio.'),
  ((SELECT id FROM course_ids WHERE slug = 'visual-communication-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'child-and-youth-studies-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'child-and-youth-studies-uhi'), (SELECT id FROM subject_ids WHERE name = 'Psychology'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'child-and-youth-studies-uhi'), (SELECT id FROM subject_ids WHERE name = 'Early Learning and Childcare'), 'higher', 'C', false, 'Directly relevant to placement modules.'),
  ((SELECT id FROM course_ids WHERE slug = 'forestry-management-uhi'), (SELECT id FROM subject_ids WHERE name = 'Biology'), 'higher', 'C', false, 'Recommended science.'),
  ((SELECT id FROM course_ids WHERE slug = 'forestry-management-uhi'), (SELECT id FROM subject_ids WHERE name = 'Geography'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'forestry-management-uhi'), (SELECT id FROM subject_ids WHERE name = 'Environmental Science'), 'higher', 'C', false, 'Useful preparation.'),
  ((SELECT id FROM course_ids WHERE slug = 'theology-uhi'), (SELECT id FROM subject_ids WHERE name = 'English'), 'higher', 'C', true, 'Required for language proficiency.'),
  ((SELECT id FROM course_ids WHERE slug = 'theology-uhi'), (SELECT id FROM subject_ids WHERE name = 'Religious, Moral and Philosophical Studies (RMPS)'), 'higher', 'C', false, 'Useful preparation.')
) AS v(course_id, subject_id, qualification_level, min_grade, is_mandatory, notes);
