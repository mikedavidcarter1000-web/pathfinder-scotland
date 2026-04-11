-- Generated course migration
-- Source: scripts/generate_course_migration.js
-- Course count: 276

BEGIN;

-- ============================================================================
-- COURSE INSERTS
-- ============================================================================

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Veterinary Medicine',
  'veterinary-medicine',
  NULL,
  'bvm'::degree_type,
  'Veterinary Medicine',
  'Five-year veterinary degree with clinical placements and practical experience.',
  5,
  '{"highers":"AAAAB","ucas_points":160,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://study.ed.ac.uk/programmes/undergraduate/356-veterinary-medicine-5-year-programme'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Engineering',
  'engineering',
  'H100',
  'beng'::degree_type,
  'Engineering',
  'Four-year engineering degree with specialism choice in final years.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://study.ed.ac.uk/programmes/undergraduate/75-engineering'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Psychology',
  'psychology',
  'C802',
  'bsc'::degree_type,
  'Psychology',
  'Four-year psychology degree covering cognitive, social and developmental psychology.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://study.ed.ac.uk/programmes/undergraduate/370-psychology'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Environmental Science',
  'environmental-science',
  'F900',
  'bsc'::degree_type,
  'Environmental Science',
  'Four-year environmental science degree with ecology and sustainability focus.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://study.ed.ac.uk/programmes/undergraduate/16-ecological-and-environmental-sciences'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Informatics MInf',
  'informatics-minf',
  'G500',
  'meng'::degree_type,
  'Computing Science',
  'Five-year integrated masters in informatics combining computing and software engineering.',
  5,
  '{"highers":"AAAAA","ucas_points":176,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://study.ed.ac.uk/programmes/undergraduate/430-informatics-5-year-undergraduate-masters-programme'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Acoustics and Music Technology',
  'acoustics-and-music-technology',
  'W380',
  'bsc'::degree_type,
  'Music',
  'Four-year degree combining music technology with acoustics and signal processing.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://study.ed.ac.uk/programmes/undergraduate/208-acoustics-and-music-technology'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Business Management',
  'business-management',
  'N100',
  'ma'::degree_type,
  'Business Management',
  'Four-year business management degree with strategy and operations.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/businessmanagement/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Economics',
  'economics',
  'L100',
  'ma'::degree_type,
  'Economics',
  'Four-year economics degree with microeconomics and econometrics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/economics/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Accountancy and Finance',
  'accountancy-and-finance',
  'NN43',
  'ma'::degree_type,
  'Business Management',
  'Four-year accountancy degree leading to professional qualifications.',
  4,
  '{"highers":"AAAAA","ucas_points":176,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/accountancy/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Civil Engineering',
  'civil-engineering',
  'H200',
  'beng'::degree_type,
  'Engineering',
  'Four-year civil engineering degree with structural and construction focus.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/civilengineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Mechanical Engineering',
  'mechanical-engineering',
  'H300',
  'beng'::degree_type,
  'Engineering',
  'Four-year mechanical engineering degree with thermodynamics and design.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/mechanicalengineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Biological Sciences',
  'biological-sciences',
  'C700',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year biological sciences degree with cell and molecular biology.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/biology/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Geology',
  'geology',
  'F400',
  'bsc'::degree_type,
  'Geology',
  'Four-year geology degree with mineralogy and plate tectonics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/geology/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Philosophy',
  'philosophy',
  'V500',
  'ma'::degree_type,
  'Philosophy',
  'Four-year philosophy degree with logic, metaphysics and ethics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/philosophy/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Music',
  'music',
  'W300',
  'bmus'::degree_type,
  'Music',
  'Four-year music degree with composition, performance and analysis.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/music/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Aerospace Engineering',
  'aerospace-engineering',
  'H400',
  'beng'::degree_type,
  'Engineering',
  'Four-year aerospace engineering degree with aerodynamics and propulsion.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/aeronauticalengineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'French',
  'french',
  'R120',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year French language degree with literature and culture.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/french/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'German',
  'german',
  'R230',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year German language degree with literature and culture.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/german/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Medicine',
  'medicine',
  'A100',
  'mbchb'::degree_type,
  'Medicine',
  'Six-year medical degree with community-based and hospital placements at partner medical schools.',
  6,
  '{"highers":"AAAAB","ucas_points":160,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"AAABB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/medicine/medicine-mbchb-scotcom/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Management',
  'management',
  'N100',
  'ma'::degree_type,
  'Business Management',
  'Four-year management degree with strategy and organizational behaviour.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/management/management-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Divinity',
  'divinity',
  'V610',
  'ma'::degree_type,
  'Theology and Divinity',
  'Four-year divinity degree with theology, biblical studies and church history.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/divinity/divinity/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Modern Languages',
  'modern-languages',
  'R100',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year modern languages degree with two European languages.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/modern-languages/modern-languages-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Philosophy',
  'philosophy',
  'V500',
  'ma'::degree_type,
  'Philosophy',
  'Four-year philosophy degree with logic, metaphysics and epistemology.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/philosophy/philosophy-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Classical Studies',
  'classical-studies',
  'Q800',
  'ma'::degree_type,
  'Classics',
  'Four-year classics degree with ancient Greek, Latin and history.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/classical-studies/classical-studies-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Geography',
  'geography',
  'L700',
  'bsc'::degree_type,
  'Geography',
  'Four-year geography degree with human and physical geography.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/geography/geography-bsc/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Sustainable Development',
  'sustainable-development',
  'L910',
  'ma'::degree_type,
  'Environmental Science',
  'Four-year sustainable development degree with environmental and social focus.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/sustainable-development/sustainable-development-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Art History',
  'art-history',
  'V310',
  'ma'::degree_type,
  'Art and Design',
  'Four-year art history degree with medieval to contemporary art.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/art-history/art-history-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Film Studies',
  'film-studies',
  'P300',
  'ma'::degree_type,
  'Media Studies',
  'Four-year film studies degree with cinema history and criticism.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/film-studies/film-studies-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Music',
  'music',
  'W300',
  'bmus'::degree_type,
  'Music',
  'Four-year music degree with composition, performance and musicology.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/music/music-ma/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Physics',
  'physics',
  'F300',
  'bsc'::degree_type,
  'Physics',
  'Study of matter and energy from subatomic to cosmic scales with emphasis on quantum mechanics and experimentation.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Physics","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/821/F300/physics/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Engineering',
  'engineering',
  'H300',
  'beng'::degree_type,
  'Engineering',
  'Foundational engineering in all disciplines with specialisation in mechanical engineering from year three.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/576/H300/engineering-mechanical/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'English and Scottish Literature',
  'english-and-scottish-literature',
  'Q314',
  'ma'::degree_type,
  'English',
  'Evolution of English and Scottish literature from medieval to modernist periods.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/593/Q314/english-and-scottish-literature/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'History',
  'history',
  'V100',
  'ma'::degree_type,
  'History',
  'Comprehensive study of human history across medieval, early modern and modern periods.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/735/V100/history/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Accountancy',
  'accountancy',
  'N400',
  'ma'::degree_type,
  'Business Management',
  'Thorough grounding in accounting theory and practice with professional training facilities.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/1137/N400/accountancy/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Petroleum Engineering',
  'petroleum-engineering',
  'H851',
  'beng'::degree_type,
  'Engineering',
  'Design and development of technologies for oil and gas exploration and extraction.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics","Physics","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/811/H851/petroleum-engineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Economics',
  'economics',
  'L100',
  'ma'::degree_type,
  'Economics',
  'Understanding global economy and factors influencing income, wealth and wellbeing.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/549/L100/economics/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Finance',
  'finance',
  'N300',
  'ma'::degree_type,
  'Business Management',
  'Comprehensive knowledge of finance sector emphasising business theory application.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/1138/N300/finance/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Biochemistry',
  'biochemistry',
  'C700',
  'bsc'::degree_type,
  'Biological Sciences',
  'Complex array of molecules and interactions that create living things.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/456/C700/biochemistry/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Geography',
  'geography',
  'F800',
  'bsc'::degree_type,
  'Geography',
  'Understanding geography''s role in addressing climate change and sustainable development.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/671/F800/geography/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Anthropology',
  'anthropology',
  'L600',
  'ma'::degree_type,
  'Sociology',
  'Study of human cultures and societies across time and geography.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/419/L600/anthropology/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Philosophy',
  'philosophy',
  'V500',
  'ma'::degree_type,
  'Philosophy',
  'Fundamental questions about knowledge, reality, ethics and reasoning.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/797/V500/philosophy/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Environmental Science',
  'environmental-science',
  'F900',
  'bsc'::degree_type,
  'Environmental Science',
  'Understanding environmental systems and addressing sustainability challenges.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/degree-programmes/600/F900/environmental-science/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Chemistry',
  'chemistry',
  'F100',
  'bsc'::degree_type,
  'Chemistry',
  'Broad chemistry curriculum providing maximum flexibility with optional industrial placement.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["Chemistry","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/chemistry/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Civil Engineering',
  'civil-engineering',
  'H200',
  'beng'::degree_type,
  'Engineering',
  'Infrastructure engineering across structural, geotechnical, water and transport domains.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/civilengineeringbeng/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Psychology',
  'psychology',
  'C800',
  'ba'::degree_type,
  'Psychology',
  'BPS-accredited psychology programme exploring human behaviour and mental processes.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/psychology/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Accounting',
  'accounting',
  'N400',
  'ba'::degree_type,
  'Business Management',
  'Preparation in financial accounting and interpretation with professional accreditation.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/accounting/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Aero-Mechanical Engineering',
  'aero-mechanical-engineering',
  'H420',
  'beng'::degree_type,
  'Engineering',
  'Four-year engineering programme combining mechanical and aerospace specialisations.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/aero-mechanicalengineeringbeng/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Chemical Engineering',
  'chemical-engineering',
  'H810',
  'beng'::degree_type,
  'Engineering',
  'Application of chemistry and engineering principles to production processes.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Chemistry","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/chemicalengineeringbeng/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Electronic and Electrical Engineering',
  'electronic-and-electrical-engineering',
  'H600',
  'beng'::degree_type,
  'Engineering',
  'Broad-based education in electrical engineering from low current to high power systems.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/electronicelectricalengineeringbeng/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Mathematics',
  'mathematics',
  'G100',
  'bsc'::degree_type,
  'Mathematics',
  'Rigorous foundation in mathematical theory with emphasis on real-world problem solving.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/mathematics-bsc'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Physics',
  'physics',
  'F380',
  'bsc'::degree_type,
  'Physics',
  'Broad and rigorous education in physics with computational and mathematical training.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Physics","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/physics-bsc'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Electrical and Electronic Engineering',
  'electrical-and-electronic-engineering',
  'H600',
  'beng'::degree_type,
  'Engineering',
  'Broad-based education covering low current electronics to high power systems.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/electrical-and-electronic-engineering'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'International Business Management',
  'international-business-management',
  'N202',
  'ma'::degree_type,
  'Business Management',
  'Explores all aspects of business from practice and academic perspectives.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/international-business-management'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Architectural Engineering',
  'architectural-engineering',
  'K323',
  'beng'::degree_type,
  'Architecture',
  'Knowledge and skills for architectural engineering and building systems design.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/architectural-engineering-beng'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Chemical Engineering',
  'chemical-engineering',
  'H800',
  'beng'::degree_type,
  'Engineering',
  'Application of chemistry principles to large-scale production and processing.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/chemical-engineering-beng'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Aerospace Engineering',
  'aerospace-engineering',
  'H400',
  'beng'::degree_type,
  'Engineering',
  'Aircraft and aerospace vehicle design with emphasis on aerodynamics and systems.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/aerospace-engineering'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Structural Engineering',
  'structural-engineering',
  'H201',
  'beng'::degree_type,
  'Architecture',
  'Design and analysis of structures with emphasis on safety and sustainability.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/structural-engineering'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Anatomical Sciences',
  'anatomical-sciences',
  'B110',
  'bsc'::degree_type,
  'Biological Sciences',
  'Study of human anatomy through hands-on dissection with Thiel-embalmed cadavers and modern imaging.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/anatomical-sciences'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Biological Sciences',
  'biological-sciences',
  'C100',
  'bsc'::degree_type,
  'Biological Sciences',
  'Comprehensive study of living organisms with emphasis on molecular biology, genetics and cell biology.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/biological-sciences'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Biomedical Sciences',
  'biomedical-sciences',
  'B900',
  'bsc'::degree_type,
  'Biological Sciences',
  'Study of human biology with focus on disease mechanisms and therapeutic applications.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/biomedical-sciences'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Forensic Anthropology',
  'forensic-anthropology',
  'FL46',
  'bsc'::degree_type,
  'Biological Sciences',
  'Study of skeletal remains for forensic investigation and legal applications.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/forensic-anthropology'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Biochemistry',
  'biochemistry',
  'C700',
  'bsc'::degree_type,
  'Biological Sciences',
  'Study of chemical reactions in living organisms and metabolic pathways.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/biochemistry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Pharmacology',
  'pharmacology',
  'B210',
  'bsc'::degree_type,
  'Biological Sciences',
  'Study of drug interactions with biological systems and medicinal chemistry.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/pharmacology'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Environmental Science',
  'environmental-science',
  'F750',
  'bsc'::degree_type,
  'Environmental Science',
  'Study of Earth systems, ecology and environmental management with field research components.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/environmental-science'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Geography',
  'geography',
  'F800',
  'bsc'::degree_type,
  'Geography',
  'Study of physical and human geography with international field work opportunities.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/geography-bsc'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Aquaculture',
  'aquaculture',
  'C163',
  'bsc'::degree_type,
  'Marine Science',
  'Study of fish and shellfish farming with focus on sustainable production systems.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/natural-sciences/aquaculture/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Sport Business Management',
  'sport-business-management',
  'N8U6',
  'ba'::degree_type,
  'Sport and Fitness',
  'Study of business management within sport industry with entrepreneurial focus.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/sport-business-management/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Sport Development and Coaching',
  'sport-development-and-coaching',
  'C601',
  'ba'::degree_type,
  'Sport and Fitness',
  'Study of sport development theory and coaching practice with applied experience.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/sport-development-coaching/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'English Studies',
  'english-studies',
  'Q300',
  'ba'::degree_type,
  'English',
  'Study of literature, creative writing and linguistics from medieval to contemporary periods.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/english-studies/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'International Politics',
  'international-politics',
  'L240',
  'ba'::degree_type,
  'Politics',
  'Study of international relations, geopolitics and global governance systems.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/international-politics/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Accountancy',
  'accountancy',
  'N400',
  'ba'::degree_type,
  'Business Management',
  'Study of accounting theory, practice and professional accounting standards.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/accountancy/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Economics',
  'economics',
  'L100',
  'bsc'::degree_type,
  'Economics',
  'Study of economic theory, policy and applied microeconomics and macroeconomics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/economics/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Primary Education',
  'primary-education',
  'XX13',
  'bed'::degree_type,
  'Education',
  'Four-year teacher training for primary education with early years specialisation.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["English","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/education-primary/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Marine and Freshwater Biology',
  'marine-and-freshwater-biology',
  'C160',
  'bsc'::degree_type,
  'Marine Science',
  'Study of freshwater and marine ecosystems with field research in aquatic environments.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/marine-biology/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Social Work',
  'social-work',
  'L500',
  'ba'::degree_type,
  'Social Work',
  'Study of social work practice with mandatory experience in social care settings.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/social-work/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Mechanical Engineering',
  'mechanical-engineering',
  'H300',
  'beng'::degree_type,
  'Engineering',
  'Study of mechanical systems, thermodynamics and industrial engineering design.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/beng-hons-mechanical-engineering-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Electrical and Electronic Engineering',
  'electrical-and-electronic-engineering',
  'H310',
  'beng'::degree_type,
  'Engineering',
  'Study of electrical circuits, power systems and electronic device design.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/beng-hons-electrical-electronic-engineering-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Cybersecurity and Forensics',
  'cybersecurity-and-forensics',
  'H607',
  'beng'::degree_type,
  'Computing Science',
  'Study of network security, digital forensics and cybercrime investigation.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/beng-hons-cyber-security-forensics-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Software Engineering',
  'software-engineering',
  'H313',
  'bsc'::degree_type,
  'Computing Science',
  'Study of software development, programming and software project management.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bsc-hons-software-engineering-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Graphic Design',
  'graphic-design',
  'W230',
  'ba'::degree_type,
  'Art and Design',
  'Study of visual communication, typography and digital design with industry projects.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bdes-hons-graphic-design-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Product Design',
  'product-design',
  'W250',
  'ba'::degree_type,
  'Art and Design',
  'Study of 3D design, prototyping and innovation in consumer product development.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bdes-hons-product-design-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Interior and Spatial Design',
  'interior-and-spatial-design',
  'W261',
  'ba'::degree_type,
  'Art and Design',
  'Study of interior spaces, spatial planning and environmental design.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bdes-hons-interior--spatial-design-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'International Hospitality Management',
  'international-hospitality-management',
  'N680',
  'ba'::degree_type,
  'Travel and Tourism',
  'Study of hospitality operations and management in international contexts.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/ba-hons-international-hospitality-management-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Midwifery',
  'midwifery',
  'B720',
  'bnurs'::degree_type,
  'Nursing',
  'Three-year midwifery degree with clinical practice in maternity and women''s health.',
  3,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bmid-hons-midwifery-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Digital Media and Interaction Design',
  'digital-media-and-interaction-design',
  'W265',
  'bsc'::degree_type,
  'Media Studies',
  'Study of interactive media design, user experience and digital applications.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bsc-hons-digital-media-interaction-design-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Web Design and Development',
  'web-design-and-development',
  'H368',
  'bsc'::degree_type,
  'Computing Science',
  'Study of web technologies, programming and responsive design for digital platforms.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/bsc-hons-web-design-development-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Marketing',
  'marketing',
  'N500',
  'ba'::degree_type,
  'Business Management',
  'Study of marketing strategy, consumer behaviour and digital marketing.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/ba-hons-marketing-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'International Festival and Event Management',
  'international-festival-and-event-management',
  'N695',
  'ba'::degree_type,
  'Travel and Tourism',
  'Study of event planning, festival management and tourism marketing.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses/ba-hons-international-festival-event-management-undergraduate-fulltime'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Optometry',
  'optometry',
  'B510',
  'bsc'::degree_type,
  'Health Sciences',
  'Four-year degree preparing optometrists to practice independently and provide comprehensive eye care.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Physics","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-optometry-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Human Nutrition and Dietetics',
  'human-nutrition-and-dietetics',
  'B490',
  'bsc'::degree_type,
  'Health Sciences',
  'Accredited degree combining nutrition science and dietetics practice for careers in health promotion.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-human-nutrition-and-dietetics-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Diagnostic Imaging',
  'diagnostic-imaging',
  'B820',
  'bsc'::degree_type,
  'Health Sciences',
  'Clinical radiography degree preparing diagnostic radiographers to produce and interpret medical images.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-diagnostic-imaging-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Radiotherapy and Oncology',
  'radiotherapy-and-oncology',
  'B821',
  'bsc'::degree_type,
  'Health Sciences',
  'Prepares therapeutic radiographers to plan and deliver radiotherapy treatment to cancer patients.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-radiotherapy-and-oncology-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Applied Biomedical Science',
  'applied-biomedical-science',
  'B940',
  'bsc'::degree_type,
  'Biological Sciences',
  'HCPC-accredited degree introducing biomedical science careers including laboratory diagnostics and disease monitoring.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-applied-biomedical-sciencebiomedical-science-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Orthoptics',
  'orthoptics',
  'B954',
  'bsc'::degree_type,
  'Health Sciences',
  'Scotland''s only orthoptics degree preparing graduates to diagnose and treat eye movement disorders.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-orthoptics-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Games Development',
  'games-development',
  'G460',
  'bsc'::degree_type,
  'Computing Science',
  'Specialises in games software development and games design for careers in computer games industry.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/bsc-hons-games-development-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Software Development',
  'software-development',
  'G550',
  'bsc'::degree_type,
  'Computing Science',
  'Industry-led software development degree teaching DevOps, agile methods, and modern software engineering practices.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/software-development'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Construction Management',
  'construction-management',
  'K220',
  'bsc'::degree_type,
  'Engineering',
  'Studies technical, financial and planning aspects of construction management for infrastructure projects.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-construction-management-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Electrical Power Engineering',
  'electrical-power-engineering',
  'H345',
  'beng'::degree_type,
  'Engineering',
  'Broad electrical engineering education with specialisation in power systems and power electronics.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-electrical-power-engineering-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Electrical and Electronic Engineering',
  'electrical-and-electronic-engineering',
  'H621',
  'beng'::degree_type,
  'Engineering',
  'Develops expertise in electrical and electronic engineering with specialist options in wireless networks.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-electrical-and-electronic-engineering-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Applied Psychology',
  'applied-psychology',
  'C801',
  'bsc'::degree_type,
  'Psychology',
  'BPS-accredited psychology degree with pathways in counselling, forensic, health and sport psychology.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-applied-psychology-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'International Marketing',
  'international-marketing',
  'N501',
  'ba'::degree_type,
  'Business Management',
  'Marketing degree combining strategic thinking with international business context for global careers.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-international-marketing-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Accountancy',
  'accountancy',
  'N400',
  'ba'::degree_type,
  'Business Management',
  'Accounting degree covering financial reporting, auditing, taxation and management accounting.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"BCCC"}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-accountancy-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Social Work',
  'social-work',
  'L500',
  'ba'::degree_type,
  'Social Work',
  'Social work degree combining social justice theory with professional practice in health and social care.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/undergraduate-social-work-glasgow'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Engineering Design',
  'engineering-design',
  'H313',
  'beng'::degree_type,
  'Engineering',
  'Equips engineers with creative problem-solving skills to address sustainability challenges through design.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/3367-beng-hons-engineering-design'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Applied Biomedical Science',
  'applied-biomedical-science',
  'B902',
  'bsc'::degree_type,
  'Biological Sciences',
  'IBMS and HCPC accredited biomedical degree combining laboratory training across hospital diagnostic disciplines.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/873-bsc-hons-applied-biomedical-science'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Biomedical Science',
  'biomedical-science',
  'B901',
  'bsc'::degree_type,
  'Biological Sciences',
  'Covers diagnosis, treatment and monitoring of disease through molecular biology, genetics and advanced diagnostics.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/872-bsc-hons-biomedical-science'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Cyber Security',
  'cyber-security',
  'I100',
  'bsc'::degree_type,
  'Computing Science',
  'BCS-accredited degree preparing graduates to prevent and manage cyber security threats and incidents.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/430-bsc-hons-cyber-security'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Computer Science',
  'computer-science',
  'G400',
  'bsc'::degree_type,
  'Computing Science',
  'Teaches design and implementation of state-of-the-art software systems with excellent student satisfaction.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/446-bsc-hons-computer-science'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Midwifery',
  'midwifery',
  'B720',
  'bnurs'::degree_type,
  'Nursing',
  'NMC-accredited degree preparing midwives to provide skilled care to women, infants and families.',
  3,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["English","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/900-bsc-midwifery'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Occupational Therapy',
  'occupational-therapy',
  'B920',
  'bsc'::degree_type,
  'Health Sciences',
  'Develops evidence-based occupational therapy practice for careers in NHS and social care.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/980-moccth-occupational-therapy'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Communication Design',
  'communication-design',
  'WW26',
  'ba'::degree_type,
  'Art and Design',
  'Develops graphics, illustration and photography skills for creative industries careers.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Art and Design"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/453-ba-hons-communication-design-graphic-design-illustration-photography'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Diagnostic Radiography',
  'diagnostic-radiography',
  'B813',
  'bsc'::degree_type,
  'Health Sciences',
  'Joint interprofessional programme providing radiography knowledge, clinical practice and image interpretation.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["English","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/975-mdrad-diagnostic-radiography'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Social Work',
  'social-work',
  'L500',
  'ba'::degree_type,
  'Social Work',
  'Prepares graduates for SSSC registration as qualified social workers in health and social care settings.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/courses/917-ba-hons-social-work'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Paramedic Science',
  'paramedic-science',
  'B761',
  'bsc'::degree_type,
  'Health Sciences',
  'Royal College of Paramedics endorsed degree preparing paramedics for emergency and non-emergency care.',
  3,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology","English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/bsc-paramedic-science-2026-entry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Psychology',
  'psychology',
  'C800',
  'bsc'::degree_type,
  'Psychology',
  'BPS-accredited degree exploring how people think, feel and behave with clinical and forensic specialisms.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/bsc-hons-psychology-2026-entry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Drama',
  'drama',
  'W490',
  'ba'::degree_type,
  'Performing Arts',
  'Combines theory and practical training in theatre production, performance and directing.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/ba-hons-drama-2026-entry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Film and Media',
  'film-and-media',
  'P303',
  'ba'::degree_type,
  'Media Studies',
  'Develops students as critical makers and consumers of film and media through practical and analytical study.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/ba-hons-film-and-media-2026-entry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Theatre and Film',
  'theatre-and-film',
  'WW46',
  'ba'::degree_type,
  'Performing Arts',
  'Scotland''s only degree combining theatre and film study, merging theory and practical creative industries skills.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/ba-hons-theatre-and-film-2026-entry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Nutrition',
  'nutrition',
  'B404',
  'bsc'::degree_type,
  'Health Sciences',
  'AfN-accredited programme combining nutrition science theory with practical skills for nutritionist careers.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/master-of-nutrition-mnutrition-bsc-hons-nutrition-2026-entry'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Occupational Therapy',
  'occupational-therapy',
  'B920',
  'bsc'::degree_type,
  'Health Sciences',
  'HCPC-accredited integrated master''s degree developing occupational therapists for health and social care.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/2026/bsc-hons-occupational-therapy'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Food Science and Innovation',
  'food-science-and-innovation',
  'B560',
  'bsc'::degree_type,
  'Food Science',
  'Combines chemistry, biochemistry, nutrition, microbiology and engineering for food industry careers.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/food-science'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Ethical Hacking',
  'ethical-hacking',
  NULL,
  'bsc'::degree_type,
  'Computing Science',
  'NCSC-certified cybersecurity degree focusing on penetration testing, forensics and defensive security techniques.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/ethical-hacking/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Computer Science with Cybersecurity',
  'computer-science-with-cybersecurity',
  NULL,
  'bsc'::degree_type,
  'Computing Science',
  'Applied computer science with specialised cybersecurity modules covering defensive and offensive security practices.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/computer-science-with-cybersecurity/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Game Design and Production',
  'game-design-and-production',
  NULL,
  'ba'::degree_type,
  'Computing Science',
  'Creative game design degree covering narrative, mechanics and production at one of the UK''s top-ranked game schools.',
  4,
  '{"highers":"CCC","ucas_points":80,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/game-design-and-production/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Computer Game Applications Development',
  'computer-game-applications-development',
  NULL,
  'bsc'::degree_type,
  'Computing Science',
  'Technical game development focusing on programming, engines and interactive systems for commercial game production.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/computer-game-applications-development/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Forensic Sciences',
  'forensic-sciences',
  NULL,
  'bsc'::degree_type,
  'Biological Sciences',
  'Science-based forensic degree covering scene investigation, evidence analysis and criminal investigation methods.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/forensic-sciences/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Psychology',
  'psychology',
  NULL,
  'bsc'::degree_type,
  'Psychology',
  'Comprehensive psychology degree covering cognitive, clinical, social and research methodologies in behavioural science.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/psychology/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Sport and Exercise',
  'sport-and-exercise',
  NULL,
  'bsc'::degree_type,
  'Sport and Fitness',
  'Sport science degree covering exercise physiology, biomechanics, nutrition and performance optimisation.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/sport-and-exercise-science/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Food Science, Nutrition and Wellbeing',
  'food-science-nutrition-and-wellbeing',
  NULL,
  'bsc'::degree_type,
  'Food Science',
  'Food science degree covering nutrition, food chemistry, food safety and development of health-focused food products.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/food-science-nutrition-and-wellbeing/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Biomedical Science',
  'biomedical-science',
  NULL,
  'bsc'::degree_type,
  'Biological Sciences',
  'IBMS-accredited biomedical science degree with pathways to NHS biomedical scientist registration and clinical practice.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/biomedical-science/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Accounting and Finance',
  'accounting-and-finance',
  NULL,
  'ba'::degree_type,
  'Business Management',
  'Accountancy and finance degree covering financial management and professional accounting practice.',
  4,
  '{"highers":"BBB","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/accounting-and-finance/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Computer Arts',
  'computer-arts',
  NULL,
  'ba'::degree_type,
  'Art and Design',
  'Creative computing combining digital art, animation and interactive design for games and media industries.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/computer-arts/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Adult Nursing',
  'adult-nursing',
  NULL,
  'bnurs'::degree_type,
  'Nursing',
  'Registered adult nursing degree with clinical placements, leading to NMC professional registration.',
  4,
  '{"highers":"BBB","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/adult-nursing/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Mental Health Nursing',
  'mental-health-nursing',
  NULL,
  'bnurs'::degree_type,
  'Nursing',
  'Mental health nursing degree with clinical placements, preparing students for mental healthcare registration.',
  4,
  '{"highers":"BBB","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/mental-health-nursing/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Midwifery',
  'midwifery',
  NULL,
  'bnurs'::degree_type,
  'Nursing',
  'Midwifery degree with clinical placements in maternity settings, leading to NMC registration.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/midwifery/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Mechanical Engineering',
  'mechanical-engineering',
  NULL,
  'beng'::degree_type,
  'Engineering',
  'Mechanical engineering degree covering thermodynamics, fluid mechanics, design and manufacturing processes.',
  4,
  '{"highers":"BCCC","ucas_points":96,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/mechanical-engineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Aircraft Engineering',
  'aircraft-engineering',
  NULL,
  'beng'::degree_type,
  'Engineering',
  'Aircraft engineering degree covering aerodynamics, propulsion, structures and avionics for aerospace industry.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/aircraft-engineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Aerospace Engineering',
  'aerospace-engineering',
  NULL,
  'meng'::degree_type,
  'Engineering',
  'Integrated master''s in aerospace engineering covering advanced aerodynamics, flight mechanics and systems integration.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/aerospace-engineering/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Social Work',
  'social-work',
  NULL,
  'ba'::degree_type,
  'Social Work',
  'Social work degree covering theory and practice in individual support, community work and care management.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/social-work/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Graphic Arts and Moving Image',
  'graphic-arts-and-moving-image',
  NULL,
  'ba'::degree_type,
  'Art and Design',
  'Creative design degree combining graphic arts, motion graphics, animation and digital media production.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/graphic-arts-moving-image/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Business Management',
  'business-management',
  NULL,
  'bsc'::degree_type,
  'Business Management',
  'Business management degree covering strategy, finance, marketing, operations and organisational leadership.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/business-management/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Accounting and Finance',
  'accounting-and-finance',
  NULL,
  'bsc'::degree_type,
  'Business Management',
  'Accountancy degree covering financial accounting, management accounting and professional accounting standards.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/undergraduate-course-search/accounting-and-finance/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Applied Software Development',
  'applied-software-development',
  NULL,
  'bsc'::degree_type,
  'Computing Science',
  'Applied computing degree focusing on practical software engineering, development frameworks and industry-relevant programming skills.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/bsc-hons-applied-software-development/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Culture and Heritage',
  'culture-and-heritage',
  NULL,
  'ba'::degree_type,
  'History',
  'Heritage and cultural studies degree exploring Scottish Highland and Island traditions, languages and historical contexts.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/ba-hons-culture-and-heritage/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Environmental Science',
  'environmental-science',
  NULL,
  'bsc'::degree_type,
  'Environmental Science',
  'Environmental science degree covering ecology, conservation, climate and sustainable resource management in rural contexts.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/bsc-hons-environmental-science/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Gaelic and Education',
  'gaelic-and-education',
  NULL,
  'ba'::degree_type,
  'Education',
  'Gaelic language and education degree preparing teachers and heritage professionals with fluent Gaelic and pedagogical skills.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":["Gàidhlig"]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/ba-hons-gaelic-and-education/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Gaelic Studies',
  'gaelic-studies',
  NULL,
  'ba'::degree_type,
  'Modern Languages',
  'Gaelic language degree for both learners and fluent speakers, covering literature, linguistics and cultural heritage.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/ba-hons-gaelic/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Sustainable Development',
  'sustainable-development',
  NULL,
  'bsc'::degree_type,
  'Environmental Science',
  'Sustainable development degree focused on rural, remote and island community resilience and green economics.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/bsc-hons-sustainable-development/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Astrophysics',
  'astrophysics',
  'F510',
  'bsc'::degree_type,
  'Physics',
  'Four-year degree combining physics with astronomy, observational techniques and cosmology.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Geology',
  'geology',
  'F640',
  'bsc'::degree_type,
  'Geology',
  'Four-year earth sciences degree covering geology, geochemistry and geological field work.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Geography',
  'geography',
  'L700',
  'ma'::degree_type,
  'Geography',
  'Four-year geography degree covering human, physical and environmental geography.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Sociology',
  'sociology',
  'L300',
  'ma'::degree_type,
  'Sociology',
  'Four-year sociology degree examining social structures, inequality and human behaviour.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Politics',
  'politics',
  'L200',
  'ma'::degree_type,
  'Politics',
  'Four-year politics degree covering political theory, UK and international politics.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'International Relations',
  'international-relations',
  'L250',
  'ma'::degree_type,
  'Politics',
  'Four-year degree in international relations covering global politics, diplomacy and security.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Linguistics',
  'linguistics',
  'Q100',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year linguistics degree covering phonetics, syntax, semantics and sociolinguistics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'French',
  'french',
  'R100',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year French language degree with year abroad and literature study.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["French"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Spanish',
  'spanish',
  'R400',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year Spanish language degree with year abroad in Spain or Latin America.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Spanish"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Celtic Studies',
  'celtic-studies',
  'Q500',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year degree in Celtic and Gaelic languages, literature and culture.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Classics',
  'classics',
  'Q800',
  'ma'::degree_type,
  'Classics',
  'Four-year classics degree with Latin, Ancient Greek, classical literature and history.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Divinity',
  'divinity',
  'V600',
  'ma'::degree_type,
  'Theology and Divinity',
  'Four-year divinity degree covering theology, biblical studies and world religions.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Religious Studies',
  'religious-studies',
  'V620',
  'ma'::degree_type,
  'Theology and Divinity',
  'Four-year degree in world religions, comparative religion and religious philosophy.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Social Anthropology',
  'social-anthropology',
  'L601',
  'ma'::degree_type,
  'Sociology',
  'Four-year degree in social anthropology examining cultures and societies globally.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Archaeology',
  'archaeology',
  'V400',
  'ma'::degree_type,
  'History',
  'Four-year archaeology degree covering prehistoric to historical periods with fieldwork.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Geosciences',
  'geosciences',
  'F660',
  'bsc'::degree_type,
  'Environmental Science',
  'Four-year degree covering physical geography, geology and earth system sciences.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Ecology',
  'ecology',
  'C180',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year ecology degree covering field research, conservation and ecosystem dynamics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Neuroscience',
  'neuroscience',
  'B140',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year degree covering brain and nervous system function, cognition and pathology.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Business Management',
  'business-management',
  'N200',
  'ma'::degree_type,
  'Business Management',
  'Four-year business degree combining management theory with practical business skills.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Accounting and Finance',
  'accounting-and-finance',
  'NN43',
  'ma'::degree_type,
  'Business Management',
  'Four-year degree in accounting and finance with professional qualification exemptions.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Civil and Environmental Engineering',
  'civil-and-environmental-engineering',
  'H220',
  'beng'::degree_type,
  'Engineering',
  'Four-year civil engineering degree with environmental and sustainability focus.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Electrical and Electronic Engineering',
  'electrical-and-electronic-engineering',
  'H600',
  'beng'::degree_type,
  'Engineering',
  'Four-year electrical engineering degree with electronics, power systems and communications.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Mechanical Engineering',
  'mechanical-engineering',
  'H300',
  'beng'::degree_type,
  'Engineering',
  'Four-year mechanical engineering degree with design, dynamics and thermodynamics.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Chemical Engineering',
  'chemical-engineering',
  'H800',
  'beng'::degree_type,
  'Engineering',
  'Four-year chemical engineering degree covering reactor design and process engineering.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":["Chemistry","Mathematics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Primary Education',
  'primary-education',
  'X120',
  'bed'::degree_type,
  'Education',
  'Four-year primary teaching degree with GTCS registration.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["English"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '68365bd6-7529-4de7-bc78-d9a9e5753d62',
  'Theoretical Physics',
  'theoretical-physics',
  'F340',
  'bsc'::degree_type,
  'Physics',
  'Four-year theoretical physics degree with advanced mathematics and quantum mechanics.',
  4,
  '{"highers":"AAAAA","ucas_points":176,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{"simd20_offer":"AABB"}'::jsonb,
  'https://www.ed.ac.uk/studying/undergraduate/degrees'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Anatomy',
  'anatomy',
  'B100',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year degree in human anatomy with dissection, imaging and clinical applications.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Physiology',
  'physiology',
  'B120',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year degree in human physiology covering body systems and organ function.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Neuroscience',
  'neuroscience',
  'B140',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year neuroscience degree covering brain function and neural mechanisms.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Microbiology',
  'microbiology',
  'C500',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year microbiology degree covering bacteria, viruses and infectious diseases.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Genetics',
  'genetics',
  'C400',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year genetics degree covering molecular genetics, genomics and genetic engineering.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Zoology',
  'zoology',
  'C300',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year zoology degree covering animal biology, behaviour and evolution.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Marine and Freshwater Biology',
  'marine-and-freshwater-biology',
  'C160',
  'bsc'::degree_type,
  'Marine Science',
  'Four-year degree covering marine and freshwater ecosystems with fieldwork.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Geography',
  'geography',
  'L700',
  'ma'::degree_type,
  'Geography',
  'Four-year geography degree with human and physical geography pathways.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Sociology',
  'sociology',
  'L300',
  'ma'::degree_type,
  'Sociology',
  'Four-year sociology degree examining social structures and contemporary issues.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Politics',
  'politics',
  'L200',
  'ma'::degree_type,
  'Politics',
  'Four-year politics degree covering Scottish, UK, European and international politics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'International Relations',
  'international-relations',
  'L250',
  'ma'::degree_type,
  'Politics',
  'Four-year international relations degree with diplomacy and global governance focus.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Classics',
  'classics',
  'Q800',
  'ma'::degree_type,
  'Classics',
  'Four-year classics degree with Latin, Ancient Greek and classical civilisation.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Theology and Religious Studies',
  'theology-and-religious-studies',
  'V600',
  'ma'::degree_type,
  'Theology and Divinity',
  'Four-year theology degree covering religious studies, biblical studies and ethics.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Celtic and Gaelic',
  'celtic-and-gaelic',
  'Q500',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year degree in Celtic and Gaelic languages, literature and culture.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Spanish',
  'spanish',
  'R400',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year Spanish degree with year abroad in Spain or Latin America.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Spanish"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Film and Television Studies',
  'film-and-television-studies',
  'P303',
  'ma'::degree_type,
  'Media Studies',
  'Four-year degree covering film theory, television history and media production.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Primary Education',
  'primary-education',
  'X120',
  'bed'::degree_type,
  'Education',
  'Four-year primary teaching degree with GTCS registration.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["English"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Pharmacology',
  'pharmacology',
  'B210',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year pharmacology degree covering drug action and therapeutic applications.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Statistics',
  'statistics',
  'G300',
  'bsc'::degree_type,
  'Mathematics',
  'Four-year statistics degree covering probability theory and statistical applications.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '09a13240-bb0a-41df-ab61-81465cfa39f1',
  'Social Work',
  'social-work',
  'L500',
  'ma'::degree_type,
  'Social Work',
  'Four-year social work degree preparing students for SSSC registration.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.gla.ac.uk/undergraduate/degrees/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Middle East Studies',
  'middle-east-studies',
  'T700',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year degree in Middle East studies with Arabic and regional politics.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Statistics',
  'statistics',
  'G300',
  'bsc'::degree_type,
  'Mathematics',
  'Four-year statistics degree covering theory and applied statistical methods.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Neuroscience',
  'neuroscience',
  'B140',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year neuroscience degree covering brain function and nervous system biology.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Marine Biology',
  'marine-biology',
  'C160',
  'bsc'::degree_type,
  'Marine Science',
  'Four-year degree in marine biology with field research in coastal ecosystems.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Biology"]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Arabic',
  'arabic',
  'T620',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year Arabic language degree with Middle East culture and literature.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'b46b546a-6283-4a50-9960-f3daa88deae1',
  'Hebrew',
  'hebrew',
  'Q400',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year Hebrew language and biblical studies degree.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.st-andrews.ac.uk/subjects/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Dental Therapy and Hygiene',
  'dental-therapy-and-hygiene',
  'B750',
  'bsc'::degree_type,
  'Dentistry',
  'Three-year degree in dental therapy and hygiene with GDC registration.',
  3,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Immunology',
  'immunology',
  'C550',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year immunology degree covering immune system function and disease.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology","Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Sociology',
  'sociology',
  'L300',
  'ma'::degree_type,
  'Sociology',
  'Four-year sociology degree examining society, culture and social change.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Politics and International Relations',
  'politics-and-international-relations',
  'L200',
  'ma'::degree_type,
  'Politics',
  'Four-year degree in politics and international relations with global focus.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Divinity',
  'divinity',
  'V600',
  'ma'::degree_type,
  'Theology and Divinity',
  'Four-year divinity degree with theology, biblical studies and Christian ethics.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Modern Languages',
  'modern-languages',
  'R100',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year modern languages degree with two languages and year abroad.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Celtic and Gaelic Studies',
  'celtic-and-gaelic-studies',
  'Q540',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year degree in Celtic and Gaelic languages, literature and Scottish heritage.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Business Management',
  'business-management',
  'N200',
  'ma'::degree_type,
  'Business Management',
  'Four-year business management degree covering strategy and operations.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Chemical Engineering',
  'chemical-engineering',
  'H810',
  'beng'::degree_type,
  'Engineering',
  'Four-year chemical engineering degree with process and reaction engineering.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Chemistry","Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Civil Engineering',
  'civil-engineering',
  'H200',
  'beng'::degree_type,
  'Engineering',
  'Four-year civil engineering degree covering structures and infrastructure.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Electrical and Electronic Engineering',
  'electrical-and-electronic-engineering',
  'H600',
  'beng'::degree_type,
  'Engineering',
  'Four-year electrical engineering degree with electronics and power systems.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c86def8d-a03b-40d8-9b82-00faa77b0302',
  'Sports and Exercise Science',
  'sports-and-exercise-science',
  'C600',
  'bsc'::degree_type,
  'Sport and Fitness',
  'Four-year sports science degree covering physiology and biomechanics.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.abdn.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Biochemistry and Immunology',
  'biochemistry-and-immunology',
  'CC75',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year degree combining biochemistry and immunology for biomedical research careers.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Microbiology and Pharmacology',
  'microbiology-and-pharmacology',
  'BC50',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year integrated degree in microbiology and pharmacology for drug development careers.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Forensic and Analytical Chemistry',
  'forensic-and-analytical-chemistry',
  'F1F4',
  'bsc'::degree_type,
  'Chemistry',
  'Four-year degree combining analytical chemistry with forensic investigation techniques.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Marketing',
  'marketing',
  'N500',
  'ba'::degree_type,
  'Business Management',
  'Four-year marketing degree covering consumer behaviour, branding and digital marketing.',
  4,
  '{"highers":"AAAA","ucas_points":152,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Hospitality and Tourism Management',
  'hospitality-and-tourism-management',
  'N820',
  'ba'::degree_type,
  'Travel and Tourism',
  'Four-year degree in hospitality and tourism management with international perspective.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Sports Coaching and Management',
  'sports-coaching-and-management',
  'C601',
  'ba'::degree_type,
  'Sport and Fitness',
  'Four-year degree in sports coaching and management with industry placements.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'International Business',
  'international-business',
  'N200',
  'ba'::degree_type,
  'Business Management',
  'Four-year international business degree with year abroad and language study.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Economics',
  'economics',
  'L100',
  'ba'::degree_type,
  'Economics',
  'Four-year economics degree with quantitative analysis and policy focus.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Politics and International Relations',
  'politics-and-international-relations',
  'L200',
  'ba'::degree_type,
  'Politics',
  'Four-year politics and international relations degree with global focus.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Journalism, Media and Communication',
  'journalism-media-and-communication',
  'P500',
  'ba'::degree_type,
  'Media Studies',
  'Four-year degree in journalism and media with practical broadcasting skills.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'English and Creative Writing',
  'english-and-creative-writing',
  'Q301',
  'ba'::degree_type,
  'English',
  'Four-year degree combining English literature with creative writing workshops.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["English"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Physics',
  'physics',
  'F300',
  'bsc'::degree_type,
  'Physics',
  'Four-year physics degree with laser physics and photonics specialisms.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '429f13e5-4500-4b90-9690-c89765632653',
  'Biomedical Engineering',
  'biomedical-engineering',
  'H810',
  'beng'::degree_type,
  'Engineering',
  'Four-year biomedical engineering degree combining engineering with medical applications.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.strath.ac.uk/courses/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Actuarial Mathematics and Statistics',
  'actuarial-mathematics-and-statistics',
  'G320',
  'bsc'::degree_type,
  'Mathematics',
  'Four-year degree in actuarial science with professional exemptions.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Mathematics and Statistics',
  'mathematics-and-statistics',
  'G1G3',
  'bsc'::degree_type,
  'Mathematics',
  'Four-year joint degree in mathematics and statistics.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Quantity Surveying',
  'quantity-surveying',
  'K240',
  'bsc'::degree_type,
  'Architecture',
  'Four-year degree in quantity surveying for construction and built environment careers.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Construction Project Management',
  'construction-project-management',
  'K220',
  'bsc'::degree_type,
  'Architecture',
  'Four-year degree in construction project management with industry accreditation.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Food Science, Nutrition and Health',
  'food-science-nutrition-and-health',
  'D610',
  'bsc'::degree_type,
  'Food Science',
  'Four-year food science degree with nutrition and public health focus.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Brewing and Distilling',
  'brewing-and-distilling',
  'D700',
  'bsc'::degree_type,
  'Food Science',
  'Four-year degree in brewing and distilling, the UK''s only specialist programme.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Chemistry"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Psychology',
  'psychology',
  'C800',
  'bsc'::degree_type,
  'Psychology',
  'Four-year BPS-accredited psychology degree with research methods focus.',
  4,
  '{"highers":"ABBB","ucas_points":128,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Languages for Business',
  'languages-for-business',
  'R900',
  'ma'::degree_type,
  'Modern Languages',
  'Four-year degree combining two languages with international business studies.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'c303cfbb-d936-40d8-aa10-e8308b9871de',
  'Fashion and Textiles',
  'fashion-and-textiles',
  'W230',
  'ba'::degree_type,
  'Art and Design',
  'Four-year fashion and textiles degree with studio-based design and production.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{}'::jsonb,
  'https://www.hw.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Architecture',
  'architecture',
  'K100',
  'ma'::degree_type,
  'Architecture',
  'Five-year architecture degree with RIBA Part 1 accreditation.',
  5,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Interior and Environmental Design',
  'interior-and-environmental-design',
  'W250',
  'ba'::degree_type,
  'Art and Design',
  'Four-year degree in interior and environmental design with sustainability focus.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Animation',
  'animation',
  'W615',
  'ba'::degree_type,
  'Art and Design',
  'Four-year animation degree covering 2D, 3D and motion graphics for industry careers.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Product Design',
  'product-design',
  'W240',
  'ba'::degree_type,
  'Art and Design',
  'Four-year product design degree combining creativity with engineering principles.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Art and Design"]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'English',
  'english',
  'Q300',
  'ma'::degree_type,
  'English',
  'Four-year English degree covering literature from medieval to contemporary periods.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["English"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'History',
  'history',
  'V100',
  'ma'::degree_type,
  'History',
  'Four-year history degree with Scottish, European and modern history pathways.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Philosophy',
  'philosophy',
  'V500',
  'ma'::degree_type,
  'Philosophy',
  'Four-year philosophy degree covering ethics, logic and metaphysics.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Business Management',
  'business-management',
  'N200',
  'ma'::degree_type,
  'Business Management',
  'Four-year business management degree with strategy and entrepreneurship focus.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '02362909-4ff2-41d5-99a9-9f179f57c8b8',
  'Accountancy',
  'accountancy',
  'N400',
  'ma'::degree_type,
  'Business Management',
  'Four-year accountancy degree with professional exemption pathways.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Mathematics"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.dundee.ac.uk/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Marketing',
  'marketing',
  'N500',
  'ba'::degree_type,
  'Business Management',
  'Four-year marketing degree with digital marketing and consumer behaviour focus.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Business Management',
  'business-management',
  'N200',
  'ba'::degree_type,
  'Business Management',
  'Four-year business management degree with strategy and entrepreneurship.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'History',
  'history',
  'V100',
  'ba'::degree_type,
  'History',
  'Four-year history degree with Scottish, European and global history modules.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Philosophy',
  'philosophy',
  'V500',
  'ba'::degree_type,
  'Philosophy',
  'Four-year philosophy degree covering ethics, epistemology and philosophy of mind.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Religion',
  'religion',
  'V620',
  'ba'::degree_type,
  'Theology and Divinity',
  'Four-year degree in religion covering world religions and religious studies.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBC"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'French',
  'french',
  'R100',
  'ba'::degree_type,
  'Modern Languages',
  'Four-year French degree with year abroad and literature study.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["French"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Spanish',
  'spanish',
  'R400',
  'ba'::degree_type,
  'Modern Languages',
  'Four-year Spanish degree with year abroad and cultural studies.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":["Spanish"]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Journalism Studies',
  'journalism-studies',
  'P500',
  'ba'::degree_type,
  'Media Studies',
  'Four-year journalism degree with practical reporting and digital journalism.',
  4,
  '{"highers":"AABB","ucas_points":136,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
  'Law',
  'law',
  'M100',
  'llb'::degree_type,
  'Law',
  'Four-year law degree covering Scots law with Law Society of Scotland accreditation.',
  4,
  '{"highers":"AAAB","ucas_points":144,"required_subjects":["English"]}'::jsonb,
  '{"simd20_offer":"ABBB"}'::jsonb,
  'https://www.stir.ac.uk/courses/ug/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Environmental Health',
  'environmental-health',
  'B900',
  'bsc'::degree_type,
  'Health Sciences',
  'Four-year environmental health degree with professional chartered status pathway.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Sport and Exercise Science',
  'sport-and-exercise-science',
  'C600',
  'bsc'::degree_type,
  'Sport and Fitness',
  'Four-year sports science degree covering exercise physiology, biomechanics and nutrition.',
  4,
  '{"highers":"BBBB","ucas_points":120,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  'fe29b5f9-cbaa-49c5-9532-51cebdbefadb',
  'Sociology',
  'sociology',
  'L300',
  'ba'::degree_type,
  'Sociology',
  'Four-year sociology degree examining contemporary social issues and research methods.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.napier.ac.uk/courses'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Mechanical Engineering',
  'mechanical-engineering',
  'H300',
  'beng'::degree_type,
  'Engineering',
  'Four-year mechanical engineering degree with design and manufacturing emphasis.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics","Physics"]}'::jsonb,
  '{"simd20_offer":"CCCC"}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Building Surveying',
  'building-surveying',
  'K240',
  'bsc'::degree_type,
  'Architecture',
  'Four-year building surveying degree with RICS accreditation.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '7d24935a-6e6b-4e50-941c-7d89b1e019be',
  'Quantity Surveying',
  'quantity-surveying',
  'K410',
  'bsc'::degree_type,
  'Architecture',
  'Four-year quantity surveying degree with RICS accreditation.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":["Mathematics"]}'::jsonb,
  '{}'::jsonb,
  'https://www.gcu.ac.uk/study/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Fashion Management',
  'fashion-management',
  'N221',
  'ba'::degree_type,
  'Business Management',
  'Four-year fashion management degree combining business with creative industries.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Management with Marketing',
  'management-with-marketing',
  'NN25',
  'ba'::degree_type,
  'Business Management',
  'Four-year business degree with marketing specialism and industry placement.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Mental Health Nursing',
  'mental-health-nursing',
  'B761',
  'bnurs'::degree_type,
  'Nursing',
  'Four-year mental health nursing degree with NMC registration.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.rgu.ac.uk/study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '30b5a864-7750-4fe8-ab17-153b37e70100',
  'Forensic and Analytical Science',
  'forensic-and-analytical-science',
  'F410',
  'bsc'::degree_type,
  'Chemistry',
  'Four-year forensic and analytical science degree with laboratory practice.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.rgu.ac.uk/study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'Events Management',
  'events-management',
  'N820',
  'ba'::degree_type,
  'Business Management',
  'Four-year events management degree with festival, corporate and tourism specialisations.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'International Business Management',
  'international-business-management',
  'N120',
  'ba'::degree_type,
  'Business Management',
  'Four-year international business degree with global trade and management focus.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '258362ad-ecc9-47c7-97a9-2ba8d4800bb8',
  'International Hospitality and Tourism Management',
  'international-hospitality-and-tourism-management',
  'N800',
  'ba'::degree_type,
  'Travel and Tourism',
  'Four-year international hospitality and tourism management degree.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.qmu.ac.uk/study-here/undergraduate-study/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Sociology',
  'sociology',
  'L300',
  'ba'::degree_type,
  'Sociology',
  'Four-year sociology degree exploring society, inequality and social change.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e',
  'Mental Health Nursing',
  'mental-health-nursing',
  'B761',
  'bnurs'::degree_type,
  'Nursing',
  'Three-year mental health nursing degree with NMC registration.',
  3,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":[]}'::jsonb,
  '{"simd20_offer":"BBCC"}'::jsonb,
  'https://www.abertay.ac.uk/course-search/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Events Management',
  'events-management',
  'N820',
  'ba'::degree_type,
  'Business Management',
  'Four-year events management degree with festival and corporate specialisations.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Sports Coaching',
  'sports-coaching',
  'C600',
  'bsc'::degree_type,
  'Sport and Fitness',
  'Four-year sports coaching degree with practical coaching experience.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Forensic Science',
  'forensic-science',
  'F410',
  'bsc'::degree_type,
  'Biological Sciences',
  'Four-year forensic science degree covering crime scene investigation and lab analysis.',
  4,
  '{"highers":"BBBC","ucas_points":112,"required_subjects":["Chemistry","Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Filmmaking and Screenwriting',
  'filmmaking-and-screenwriting',
  'P310',
  'ba'::degree_type,
  'Media Studies',
  'Four-year filmmaking and screenwriting degree with practical production.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '8f039a85-07be-4b42-b631-130ffe3c038e',
  'Broadcast Production',
  'broadcast-production',
  'P305',
  'ba'::degree_type,
  'Media Studies',
  'Four-year broadcast production degree covering TV, radio and online media.',
  4,
  '{"highers":"BBCC","ucas_points":104,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uws.ac.uk/study/undergraduate/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Marine Biology',
  'marine-biology',
  'C162',
  'bsc'::degree_type,
  'Marine Science',
  'Four-year marine biology degree with field research in the Highlands and Islands.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":["Biology"]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Outdoor Education',
  'outdoor-education',
  'X321',
  'ba'::degree_type,
  'Sport and Fitness',
  'Four-year outdoor education degree with practical adventure sports training.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Scottish History',
  'scottish-history',
  'V130',
  'ba'::degree_type,
  'History',
  'Four-year Scottish history degree with Highland, Island and clan studies.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/'
)
ON CONFLICT DO NOTHING;

INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)
VALUES (
  '939894a6-f553-4250-b1d1-4f9cae1cfa21',
  'Business',
  'business',
  'N100',
  'ba'::degree_type,
  'Business Management',
  'Four-year business degree covering rural enterprise and Highland economies.',
  4,
  '{"highers":"BBC","ucas_points":96,"required_subjects":[]}'::jsonb,
  '{}'::jsonb,
  'https://www.uhi.ac.uk/en/courses/'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COURSE_SUBJECT_REQUIREMENTS INSERTS
-- ============================================================================
-- Matches required_subjects in entry_requirements to subjects table

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'veterinary medicine'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'veterinary medicine'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'informatics minf'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'business management'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'accountancy and finance'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'civil engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'civil engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'biological sciences'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'aerospace engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'aerospace engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'medicine'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'medicine'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'physics'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'physics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'accountancy'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'petroleum engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'petroleum engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'petroleum engineering'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'economics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'finance'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'biochemistry'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'biochemistry'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'environmental science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'environmental science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'chemistry'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'chemistry'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'civil engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'civil engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'accounting'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'aero-mechanical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'aero-mechanical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'electronic and electrical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'electronic and electrical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'mathematics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'physics'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'physics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'architectural engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'aerospace engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'aerospace engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'structural engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'anatomical sciences'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'anatomical sciences'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'biological sciences'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'biological sciences'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'biomedical sciences'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'biomedical sciences'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'forensic anthropology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'forensic anthropology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'biochemistry'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'biochemistry'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'pharmacology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'pharmacology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'environmental science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'environmental science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'aquaculture'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'english studies'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'economics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'primary education'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'primary education'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'marine and freshwater biology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'cybersecurity and forensics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'software engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'graphic design'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'product design'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'interior and spatial design'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'midwifery'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'optometry'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'optometry'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'human nutrition and dietetics'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'human nutrition and dietetics'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'diagnostic imaging'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'radiotherapy and oncology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'applied biomedical science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'applied biomedical science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'orthoptics'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'games development'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'software development'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'construction management'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'electrical power engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'electrical power engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'accountancy'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'social work'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'engineering design'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'engineering design'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'applied biomedical science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'applied biomedical science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'biomedical science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'biomedical science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'cyber security'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'computer science'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'midwifery'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'midwifery'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'occupational therapy'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'communication design'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'diagnostic radiography'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'diagnostic radiography'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'social work'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'paramedic science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'paramedic science'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'drama'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'film and media'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'theatre and film'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'nutrition'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'nutrition'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'occupational therapy'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'food science and innovation'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '258362ad-ecc9-47c7-97a9-2ba8d4800bb8'
  AND LOWER(c.name) = 'food science and innovation'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e'
  AND LOWER(c.name) = 'forensic sciences'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e'
  AND LOWER(c.name) = 'forensic sciences'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e'
  AND LOWER(c.name) = 'biomedical science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e'
  AND LOWER(c.name) = 'biomedical science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'aircraft engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'aircraft engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'aerospace engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'aerospace engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '939894a6-f553-4250-b1d1-4f9cae1cfa21'
  AND LOWER(c.name) = 'gaelic and education'
  AND s.name = 'Gàidhlig'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'astrophysics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'astrophysics'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'french'
  AND s.name = 'French'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'spanish'
  AND s.name = 'Spanish'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'geosciences'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'ecology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'neuroscience'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'neuroscience'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'accounting and finance'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'civil and environmental engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'civil and environmental engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'primary education'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'theoretical physics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'A', true
FROM courses c, subjects s
WHERE c.university_id = '68365bd6-7529-4de7-bc78-d9a9e5753d62'
  AND LOWER(c.name) = 'theoretical physics'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'anatomy'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'anatomy'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'physiology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'physiology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'neuroscience'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'neuroscience'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'microbiology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'microbiology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'genetics'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'genetics'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'zoology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'marine and freshwater biology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'spanish'
  AND s.name = 'Spanish'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'primary education'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'pharmacology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'pharmacology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '09a13240-bb0a-41df-ab61-81465cfa39f1'
  AND LOWER(c.name) = 'statistics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'statistics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'neuroscience'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'neuroscience'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'b46b546a-6283-4a50-9960-f3daa88deae1'
  AND LOWER(c.name) = 'marine biology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'dental therapy and hygiene'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'dental therapy and hygiene'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'immunology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'immunology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'chemical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'civil engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'civil engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'electrical and electronic engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c86def8d-a03b-40d8-9b82-00faa77b0302'
  AND LOWER(c.name) = 'sports and exercise science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'biochemistry and immunology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'biochemistry and immunology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'microbiology and pharmacology'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'microbiology and pharmacology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'forensic and analytical chemistry'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'economics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'english and creative writing'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'physics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'physics'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'biomedical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '429f13e5-4500-4b90-9690-c89765632653'
  AND LOWER(c.name) = 'biomedical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'actuarial mathematics and statistics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'mathematics and statistics'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'quantity surveying'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'construction project management'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'food science, nutrition and health'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'food science, nutrition and health'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'brewing and distilling'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'c303cfbb-d936-40d8-aa10-e8308b9871de'
  AND LOWER(c.name) = 'fashion and textiles'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'interior and environmental design'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'animation'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'product design'
  AND s.name = 'Art and Design'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'english'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = '02362909-4ff2-41d5-99a9-9f179f57c8b8'
  AND LOWER(c.name) = 'accountancy'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'french'
  AND s.name = 'French'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'spanish'
  AND s.name = 'Spanish'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee'
  AND LOWER(c.name) = 'law'
  AND s.name = 'English'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'environmental health'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'B', true
FROM courses c, subjects s
WHERE c.university_id = 'fe29b5f9-cbaa-49c5-9532-51cebdbefadb'
  AND LOWER(c.name) = 'sport and exercise science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'mechanical engineering'
  AND s.name = 'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '7d24935a-6e6b-4e50-941c-7d89b1e019be'
  AND LOWER(c.name) = 'quantity surveying'
  AND s.name = 'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'forensic and analytical science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '30b5a864-7750-4fe8-ab17-153b37e70100'
  AND LOWER(c.name) = 'forensic and analytical science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'forensic science'
  AND s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '8f039a85-07be-4b42-b631-130ffe3c038e'
  AND LOWER(c.name) = 'forensic science'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)
SELECT c.id, s.id, 'higher', 'C', true
FROM courses c, subjects s
WHERE c.university_id = '939894a6-f553-4250-b1d1-4f9cae1cfa21'
  AND LOWER(c.name) = 'marine biology'
  AND s.name = 'Biology'
ON CONFLICT DO NOTHING;

COMMIT;
