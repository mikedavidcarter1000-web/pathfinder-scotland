-- ============================================================================
-- Career Interests Quiz (RIASEC / Holland Code)
-- ============================================================================
-- An 18-question career interests quiz adapted for Scottish secondary pupils.
-- Each question maps to one of six RIASEC types (Realistic, Investigative,
-- Artistic, Social, Enterprising, Conventional). Responses are 1-5 Likert;
-- per-type totals are normalised to 0-100 for display.
--
-- Tables:
--   quiz_questions         -- Master 18-question list, 3 per RIASEC type
--   quiz_results           -- Per-student score snapshots (most-recent wins)
--   riasec_career_mapping  -- Static taxonomy: type -> career areas + subjects
--
-- RLS note: students.id IS auth.users.id (see initial_schema.sql), so the
-- per-student policy uses `student_id = auth.uid()` directly — no join.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  riasec_type TEXT NOT NULL CHECK (riasec_type IN ('R','I','A','S','E','C')),
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  realistic_score INT NOT NULL CHECK (realistic_score BETWEEN 0 AND 100),
  investigative_score INT NOT NULL CHECK (investigative_score BETWEEN 0 AND 100),
  artistic_score INT NOT NULL CHECK (artistic_score BETWEEN 0 AND 100),
  social_score INT NOT NULL CHECK (social_score BETWEEN 0 AND 100),
  enterprising_score INT NOT NULL CHECK (enterprising_score BETWEEN 0 AND 100),
  conventional_score INT NOT NULL CHECK (conventional_score BETWEEN 0 AND 100),
  top_types TEXT[] NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE riasec_career_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riasec_type TEXT NOT NULL CHECK (riasec_type IN ('R','I','A','S','E','C')),
  career_area TEXT NOT NULL,
  example_careers TEXT[] NOT NULL,
  recommended_highers TEXT[],
  description TEXT,
  display_order INT DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE riasec_career_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active questions" ON quiz_questions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users see own results" ON quiz_results
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Anyone can read mappings" ON riasec_career_mapping
  FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX idx_quiz_questions_active_order ON quiz_questions(is_active, display_order);
CREATE INDEX idx_quiz_results_student ON quiz_results(student_id, completed_at DESC);
CREATE INDEX idx_riasec_mapping_type ON riasec_career_mapping(riasec_type, display_order);

-- ----------------------------------------------------------------------------
-- Seed: Quiz questions (18 total, 3 per RIASEC type)
-- Language aimed at 13-16 year olds in Scotland.
-- ----------------------------------------------------------------------------

INSERT INTO quiz_questions (question_text, riasec_type, display_order) VALUES
-- Realistic (R) — practical, hands-on
('Building or fixing something with your hands — like repairing a bike or putting together flat-pack furniture', 'R', 1),
('Working outdoors in all weathers — farming, forestry, or conservation work', 'R', 2),
('Using tools or equipment to make something — woodwork, metalwork, or 3D printing', 'R', 3),
-- Investigative (I) — analytical, problem-solving
('Figuring out why something works the way it does — like how a disease spreads or how gravity works', 'I', 4),
('Working through a complicated maths or logic problem until you crack it', 'I', 5),
('Designing an experiment to test a theory or answer a question', 'I', 6),
-- Artistic (A) — creative, expressive
('Creating something original — writing a story, composing music, designing a poster', 'A', 7),
('Performing in front of people — acting, presenting, playing an instrument', 'A', 8),
('Coming up with a completely new way to solve a problem that nobody else has thought of', 'A', 9),
-- Social (S) — helping, teaching
('Helping someone understand something they''re struggling with', 'S', 10),
('Volunteering or working with people who need support', 'S', 11),
('Working as part of a team to achieve something together', 'S', 12),
-- Enterprising (E) — leading, persuading
('Convincing someone to see things your way or buy into your idea', 'E', 13),
('Organising an event or running a project from start to finish', 'E', 14),
('Starting your own business or side hustle', 'E', 15),
-- Conventional (C) — organising, detail-oriented
('Organising information into spreadsheets, lists, or databases so it all makes sense', 'C', 16),
('Following a detailed process step by step to get a perfect result', 'C', 17),
('Checking work carefully for errors and making sure everything is accurate', 'C', 18);

-- ----------------------------------------------------------------------------
-- Seed: RIASEC -> career area + recommended Highers
-- Scotland-relevant: uses SQA Higher subject names and UK-recognised careers.
-- ----------------------------------------------------------------------------

INSERT INTO riasec_career_mapping (
  riasec_type, career_area, example_careers, recommended_highers, description, display_order
) VALUES
-- Realistic
('R', 'Engineering',
  ARRAY['Mechanical engineer','Civil engineer','Electrical engineer','Aerospace engineer'],
  ARRAY['Maths','Physics','Design & Manufacture'],
  'Designing, building, and maintaining the machines, structures, and systems that make modern life work.', 1),
('R', 'Construction & Trades',
  ARRAY['Site manager','Joiner','Electrician','Plumber','Architectural technician'],
  ARRAY['Maths','Graphic Communication','Physics'],
  'Hands-on work building homes, infrastructure, and commercial spaces — a strong apprenticeship route in Scotland.', 2),
('R', 'Agriculture & Forestry',
  ARRAY['Farm manager','Forestry officer','Countryside ranger','Conservation worker'],
  ARRAY['Biology','Geography','Chemistry'],
  'Managing land, animals, and natural resources across Scotland''s rural economy.', 3),
('R', 'Skilled Trades & Apprenticeships',
  ARRAY['Mechanic','Welder','HGV driver','Renewable energy technician'],
  ARRAY['Maths','Physics','Design & Manufacture'],
  'Modern Apprenticeships and Foundation Apprenticeships offer earn-while-you-learn routes into skilled trades.', 4),

-- Investigative
('I', 'Medicine & Dentistry',
  ARRAY['Doctor','Dentist','Surgeon','Paramedic'],
  ARRAY['Chemistry','Biology','Maths','English'],
  'Diagnosing, treating, and preventing illness. Requires strong Highers and an interest in both science and people.', 1),
('I', 'Science & Research',
  ARRAY['Research scientist','Biologist','Chemist','Physicist','Environmental scientist'],
  ARRAY['Chemistry','Physics','Biology','Maths'],
  'Investigating how the world works, from molecules to ecosystems, in labs, universities, and industry.', 2),
('I', 'Computing & Data Science',
  ARRAY['Software developer','Data scientist','Cyber security analyst','AI engineer'],
  ARRAY['Maths','Computing Science','Physics'],
  'Designing software, analysing data, and protecting digital systems — one of Scotland''s fastest-growing sectors.', 3),
('I', 'Pharmacy & Healthcare Science',
  ARRAY['Pharmacist','Biomedical scientist','Radiographer','Clinical scientist'],
  ARRAY['Chemistry','Biology','Maths'],
  'Applying scientific knowledge directly to patient care and diagnostics.', 4),

-- Artistic
('A', 'Design & Architecture',
  ARRAY['Architect','Graphic designer','Interior designer','Product designer'],
  ARRAY['Art','Graphic Communication','Maths'],
  'Blending creativity with problem-solving to shape buildings, products, and visual communication.', 1),
('A', 'Media, Film & TV',
  ARRAY['Film director','Journalist','Content creator','Video editor'],
  ARRAY['English','Media Studies','Art'],
  'Telling stories and reporting news across film, broadcast, print, and digital platforms.', 2),
('A', 'Music & Performing Arts',
  ARRAY['Musician','Actor','Dancer','Music producer','Theatre director'],
  ARRAY['Music','English','Drama'],
  'Performing, composing, and producing — from the Royal Conservatoire of Scotland to working performer routes.', 3),
('A', 'Writing & Journalism',
  ARRAY['Journalist','Author','Copywriter','Editor','Publisher'],
  ARRAY['English','Modern Studies','History'],
  'Communicating ideas, news, and stories through the written word, across print and digital.', 4),

-- Social
('S', 'Teaching & Education',
  ARRAY['Primary teacher','Secondary teacher','Lecturer','Educational psychologist'],
  ARRAY['English','Maths','Subject specialism'],
  'Helping others learn. Primary requires a broad range of Highers; secondary needs strong grades in your specialist subject.', 1),
('S', 'Nursing & Midwifery',
  ARRAY['Adult nurse','Mental health nurse','Midwife','Health visitor'],
  ARRAY['Biology','Chemistry','English'],
  'Frontline healthcare roles with strong NHS Scotland career paths and placement-based degrees.', 2),
('S', 'Social Work & Counselling',
  ARRAY['Social worker','Counsellor','Probation officer','Youth justice worker'],
  ARRAY['Modern Studies','Psychology','Sociology'],
  'Supporting people through difficult life circumstances — statutory and third-sector roles.', 3),
('S', 'Youth Work & Community',
  ARRAY['Youth worker','Community development worker','Charity programme manager'],
  ARRAY['Modern Studies','English','Psychology'],
  'Working with young people and communities to build opportunity — strong third-sector presence in Scotland.', 4),

-- Enterprising
('E', 'Business & Management',
  ARRAY['Business analyst','Project manager','Operations manager','Entrepreneur'],
  ARRAY['Business Management','Maths','English'],
  'Leading teams, growing organisations, and making strategic decisions across sectors.', 1),
('E', 'Law',
  ARRAY['Solicitor','Advocate','Paralegal','Legal adviser'],
  ARRAY['English','History','Modern Studies'],
  'Advising, advocating, and applying Scots law — a distinct legal system that requires a Scottish LLB.', 2),
('E', 'Marketing & Sales',
  ARRAY['Marketing manager','Brand strategist','Digital marketer','Sales executive'],
  ARRAY['Business Management','English','Media Studies'],
  'Understanding customers and persuading them — from product launches to digital campaigns.', 3),
('E', 'Politics & Policy',
  ARRAY['Political researcher','Policy adviser','Civil servant','Campaign manager'],
  ARRAY['Modern Studies','History','English'],
  'Shaping public decisions at Holyrood, Westminster, councils, and think tanks.', 4),

-- Conventional
('C', 'Accounting & Finance',
  ARRAY['Chartered accountant','Auditor','Tax adviser','Financial analyst'],
  ARRAY['Maths','Accounting','Business Management'],
  'The numbers behind every organisation. Strong graduate programmes with the big professional bodies.', 1),
('C', 'Administration & Civil Service',
  ARRAY['Civil servant','Executive assistant','Operations coordinator','Records manager'],
  ARRAY['English','Business Management','Modern Studies'],
  'Keeping organisations running — from government departments to large corporations.', 2),
('C', 'IT & Systems',
  ARRAY['Systems analyst','Database administrator','IT support specialist','Network engineer'],
  ARRAY['Computing Science','Maths','Physics'],
  'Configuring, maintaining, and troubleshooting the technology every organisation depends on.', 3),
('C', 'Lab Work & Quality Control',
  ARRAY['Lab technician','Quality assurance officer','Food scientist','Compliance officer'],
  ARRAY['Chemistry','Biology','Maths'],
  'Precise, structured work ensuring products and processes meet exacting standards.', 4);
