-- ============================================
-- Granular AI career impact system — schema + sector enrichment
-- Migration: 20260412000001
--
-- Creates per-role AI impact tables (career_roles, career_role_subjects)
-- and enriches career_sectors with richer narrative columns sourced from
-- the research document "AI and the Future of Careers: A Guide for
-- Scottish School Leavers" (April 2026). Adds two sectors (Retail &
-- Customer Service, Transport & Logistics) that were missing from the
-- original 16-sector seed but are covered by the research.
--
-- The existing 3-tier ai_impact_rating on career_sectors is retained —
-- this migration layers a per-role 1-10 rating on top rather than
-- replacing the sector-level rating.
-- ============================================

-- ============================================
-- PART 1: career_roles + career_role_subjects
-- ============================================

CREATE TABLE career_roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_sector_id  UUID REFERENCES career_sectors(id) ON DELETE CASCADE NOT NULL,
  title             TEXT NOT NULL,
  ai_rating         INT  NOT NULL CHECK (ai_rating BETWEEN 1 AND 10),
  ai_description    TEXT NOT NULL,
  salary_entry      TEXT,
  salary_experienced TEXT,
  is_new_ai_role    BOOLEAN DEFAULT false,
  growth_outlook    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (career_sector_id, title)
);

CREATE TABLE career_role_subjects (
  career_role_id UUID REFERENCES career_roles(id) ON DELETE CASCADE,
  subject_id     UUID REFERENCES subjects(id) ON DELETE CASCADE,
  relevance      TEXT DEFAULT 'recommended'
                   CHECK (relevance IN ('essential', 'recommended', 'useful')),
  PRIMARY KEY (career_role_id, subject_id)
);

ALTER TABLE career_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_role_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON career_roles         FOR SELECT USING (true);
CREATE POLICY "Public read access" ON career_role_subjects FOR SELECT USING (true);

CREATE INDEX idx_cr_sector  ON career_roles(career_sector_id);
CREATE INDEX idx_cr_rating  ON career_roles(ai_rating);
CREATE INDEX idx_crs_role   ON career_role_subjects(career_role_id);
CREATE INDEX idx_crs_subject ON career_role_subjects(subject_id);

GRANT SELECT ON career_roles         TO anon, authenticated;
GRANT SELECT ON career_role_subjects TO anon, authenticated;

-- ============================================
-- PART 2: Sector narrative columns
-- ============================================

ALTER TABLE career_sectors
  ADD COLUMN IF NOT EXISTS ai_sector_narrative TEXT,
  ADD COLUMN IF NOT EXISTS sqa_subjects_text   TEXT,
  ADD COLUMN IF NOT EXISTS apprenticeships_text TEXT,
  ADD COLUMN IF NOT EXISTS scottish_context    TEXT;

-- ============================================
-- PART 3: Add two missing sectors
-- ============================================
-- The research document covers 15 sector archetypes. The existing 16-sector
-- seed does not include Retail or Transport, so both are added here. The
-- three remaining DB-only sectors (Media & Communications, Social Work &
-- Community, Performing Arts & Entertainment) have no direct counterpart
-- in the research doc and are deliberately left without new narratives or
-- roles in this migration; they retain their existing 3-tier AI impact.

INSERT INTO career_sectors (name, description, display_order)
VALUES
  ('Retail & Customer Service',
   'From shop-floor roles to contact centres and e-commerce — retail and customer service careers are about helping people find what they need, online and in person.',
   17),
  ('Transport & Logistics',
   'HGV drivers, train crew, warehouse teams, logistics planners and transport engineers — the people and systems that move goods and passengers around Scotland and beyond.',
   18)
ON CONFLICT (name) DO NOTHING;

-- Enrich the two new sectors with the same structured content the older
-- sectors already carry (example_jobs, salary, growth, course_subject_areas)
-- plus the legacy 3-tier ai_impact_rating so the sector still works on
-- pages that read the old field.

UPDATE career_sectors SET
  description = 'UK retail and customer service is facing significant structural change as AI reshapes routine store and contact-centre tasks. Careers in this sector are increasingly advisory, experience-focused, and digitally augmented.',
  example_jobs = ARRAY['Retail Manager','Visual Merchandiser','Shop Assistant','E-commerce Specialist','Customer Service Advisor','Supply Chain Coordinator','Buyer','Store Planner','Personal Shopper','Contact Centre Team Leader'],
  salary_range_entry = 'GBP 18,000 - GBP 22,000',
  salary_range_experienced = 'GBP 28,000 - GBP 45,000',
  growth_outlook = 'Changing — routine transactional roles under pressure from AI and self-service, but demand is growing for experience-focused, advisory, and e-commerce/data roles.',
  course_subject_areas = ARRAY['Business Management','Retail','Marketing'],
  ai_impact_rating = 'ai-exposed',
  ai_impact_description = 'Generative AI could automate 40-60% of routine store tasks by 2035 and agentic AI is projected to resolve 80% of common customer-service queries by 2029. Remaining roles become more advisory and experience-focused.'
WHERE name = 'Retail & Customer Service';

UPDATE career_sectors SET
  description = 'Transport and logistics covers everything from HGV and train driving to warehouse automation, delivery, traffic planning and supply-chain management. AI is transforming warehouses faster than roads.',
  example_jobs = ARRAY['HGV Driver','Train Driver','Delivery Driver','Warehouse Operative','Logistics Coordinator','Traffic Planner','Fleet Manager','Supply Chain Analyst','Transport Planner','Rail Signaller'],
  salary_range_entry = 'GBP 22,000 - GBP 32,000',
  salary_range_experienced = 'GBP 35,000 - GBP 55,000',
  growth_outlook = 'Strong in driving roles due to long-term shortages; rapid change in warehousing as robotics accelerates. Autonomous road transport remains a long horizon.',
  course_subject_areas = ARRAY['Logistics','Transport Planning','Engineering'],
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'Warehouse automation is accelerating fast, with over 50% of UK fulfilment centres projected to use AI by 2025. Autonomous driving on open UK roads remains distant — industry experts say autonomous 42-tonne trucks are unlikely before 2050.'
WHERE name = 'Transport & Logistics';

-- ============================================
-- PART 4: Populate narrative columns per sector
-- ============================================
-- Each UPDATE below populates ai_sector_narrative (the sector overview
-- paragraph), sqa_subjects_text (the SQA subject list), apprenticeships_text
-- (the FA/MA/GA pathways), and scottish_context (Scotland-specific data
-- points) directly from the research document.
--
-- NOTE: The three DB sectors that the research document does not cover —
-- Media & Communications, Social Work & Community, and Performing Arts &
-- Entertainment — are deliberately not updated here. They keep their
-- existing description + 3-tier ai_impact_rating and will have no entries
-- in career_roles.

-- Healthcare & Medicine --------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Healthcare is Scotland''s largest employment sector (15.3% of all jobs) and one of the most resilient to AI displacement. The NHS is actively deploying AI in diagnostics and triage, but physical care, emotional support, and clinical judgment remain firmly human. AI-supported breast cancer screening has been shown to reduce radiologist workload by nearly half without missing cancers, and AI tools match or exceed clinician accuracy in over 87% of imaging tasks. Yet the sector faces chronic understaffing — the Royal College of Radiologists reports a 30% workforce shortfall — meaning AI fills gaps rather than replaces staff.',
  sqa_subjects_text = 'Biology, Human Biology, Chemistry (N5/Higher/Advanced Higher); Care (N4/N5); Psychology (Higher); PE; English and Mathematics (N5/Higher).',
  apprenticeships_text = 'Foundation Apprenticeship in Social Services & Healthcare; Modern Apprenticeships in Healthcare Support, Dental Nursing and Pharmacy Services; Graduate Apprenticeship in Early Learning and Childhood.',
  scottish_context = 'Healthcare is Scotland''s largest employment sector at 15.3% of all jobs. NHS Scotland faces a 30% radiologist workforce shortfall per the Royal College of Radiologists, so AI is being used to fill gaps rather than displace staff.'
WHERE name = 'Healthcare & Medicine';

-- Education & Teaching ---------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Teaching has among the lowest automation risks of any profession — estimated at just 19% — because the core of the role is relational. UK teacher AI adoption rose from 31% to nearly 48% between 2023 and 2024, primarily for lesson planning, marking, and resource creation. The UK Government''s position is explicit: "Teachers are irreplaceable." For Scottish school leavers considering teaching, the career outlook is strong: teacher shortages persist across Scotland, and AI tools are expected to reduce the ~54-hour average working week rather than reduce headcount.',
  sqa_subjects_text = 'English (N5/Higher/Advanced Higher); Mathematics (N5/Higher); Psychology (Higher/Advanced Higher); any teaching subject to Higher/Advanced Higher level; Childcare and Development (N4/N5).',
  apprenticeships_text = 'FA Social Services: Children and Young People; MA Childhood Practice; GA Early Learning and Childhood.',
  scottish_context = 'Scotland faces a persistent teacher shortage, particularly in STEM subjects. Teachers work an average ~54-hour week; AI tools are expected to cut administrative load rather than headcount.'
WHERE name = 'Education & Teaching';

-- Law & Justice ----------------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Law is experiencing one of the fastest AI adoption rates of any profession. In 2024, 82% of UK lawyers reported adopting generative AI or having plans in motion — a near fourfold jump from 2023. By 2025, 96% of UK law firms integrate AI into at least one aspect of operations. The primary uses are document review, legal research, contract drafting, and due diligence — tasks that once consumed junior lawyers'' entire working days. This creates both risk and opportunity: routine legal work is being automated at pace, but high-level advisory, advocacy, and client relationships are more valuable than ever.',
  sqa_subjects_text = 'English (Higher/Advanced Higher); Modern Studies and History (Higher/Advanced Higher); Politics, Philosophy, Sociology and Psychology (Higher).',
  apprenticeships_text = 'MA Paralegal Practice.',
  scottish_context = 'Scotland has its own legal system, distinct from England and Wales. 96% of UK law firms integrate AI into at least one operation by 2025, and 82% of UK lawyers had AI adoption in progress by 2024.'
WHERE name = 'Law & Justice';

-- Business & Finance -----------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Finance and insurance are more exposed to AI than any other UK sector, according to the Department for Science, Innovation and Technology. Yet the picture is nuanced. AI adoption in UK accounting could add GBP 2 billion to GDP and create around 20,000 jobs — because the profession is shifting from compliance and number-crunching toward advisory and strategic work. The paradox is acute: there is both a severe talent shortage (accounting was listed among the UK''s 10 most critically in-demand occupations in 2024) and rapid automation of the routine tasks that traditionally defined the role.',
  sqa_subjects_text = 'Accounting (N5/Higher); Mathematics (N5/Higher/Advanced Higher); Business Management (N5/Higher/Advanced Higher); Economics (Higher/Advanced Higher); Administration and IT (N5/Higher); Statistics (Advanced Higher).',
  apprenticeships_text = 'FA Financial Services; FA Accountancy; MA Accounting, Banking and Payroll; GA Accounting; GA Business Management (Financial Services).',
  scottish_context = 'Edinburgh is the second-largest financial centre in the UK after London. UK accounting AI adoption is projected to add GBP 2 billion to GDP and ~20,000 jobs as the profession pivots from compliance work to advisory.'
WHERE name = 'Business & Finance';

-- Engineering & Manufacturing --------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Engineering employment in the UK is projected to grow by 2.8%, adding roughly 173,000 net new jobs by 2030. Scotland''s National Manufacturing Institute is actively investing in AI skills, and the National Robotarium at Heriot-Watt is developing robotics for construction and energy sectors. Only 22% of UK engineering firms have begun integrating generative AI into daily operations, and where AI is used, it handles documentation, compliance checks, and data analysis — not core design or hands-on work. The sector faces significant skills shortages, with 58,000 manufacturing vacancies currently open across the UK.',
  sqa_subjects_text = 'Mathematics, Physics and Engineering Science (N5/Higher/Advanced Higher); Chemistry; Design and Manufacture; Graphic Communication; Computing Science (N5/Higher); Practical Electronics and Practical Metalworking (N5).',
  apprenticeships_text = 'FA Engineering; MA Engineering (various specialisms); GA Engineering: Design & Manufacture; GA Engineering: Instrumentation, Measurement & Control.',
  scottish_context = 'Scotland hosts the National Manufacturing Institute and the National Robotarium at Heriot-Watt. Around 58,000 UK manufacturing vacancies remain open, and engineering employment is projected to add 173,000 net jobs by 2030.'
WHERE name = 'Engineering & Manufacturing';

-- Construction & Trades --------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Construction is among the least AI-exposed sectors in the entire economy. The Scottish Employer Skills Survey (2024) found AI use in construction at just 7% — the lowest of any sector. The physical, variable, and bespoke nature of trades work creates fundamental barriers to automation. Yet tradespeople are pragmatic adopters: 76% of UK trades professionals now use AI daily for business management tasks like invoicing, calculations, and material ordering. Scotland needs an additional 22,000 construction workers by 2027, and severe skills shortages across all trades make this one of the most secure career pathways available.',
  sqa_subjects_text = 'Mathematics (N5/Higher); Graphic Communication (N5/Higher/Advanced Higher); Design and Manufacture (N5/Higher); Physics; Engineering Science; Practical Woodworking, Practical Metalworking and Practical Craft Skills (N5).',
  apprenticeships_text = 'FA Construction (pilot); FA Civil Engineering; MA Building, Electrical Installation, Plumbing and HVAC; GA Civil Engineering; GA Construction and the Built Environment.',
  scottish_context = 'Scotland needs ~22,000 additional construction workers by 2027. Scottish Employer Skills Survey (2024) found AI use in construction at just 7% — the lowest of any sector in Scotland.'
WHERE name = 'Construction & Trades';

-- Computing & Digital Technology -----------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'The tech sector presents the sharpest paradox of any career field. AI is both the biggest threat and biggest opportunity. Stanford research documents a 13% relative decline in employment for early-career engineers (ages 22-25) since late 2022, and new graduates now account for just 7% of new hires at major tech firms — down 25% from 2023. Yet the software development market is expected to grow at 20% annually, from $24 billion in 2024 to $61 billion by 2029. The historical pattern — the Jevons Paradox — holds that every productivity improvement in coding has led to more developers, not fewer. The entry pathway is changing, but the sector''s growth trajectory remains strong for those with the right skills.',
  sqa_subjects_text = 'Computing Science (N5/Higher/Advanced Higher); Mathematics (N5/Higher/Advanced Higher); Physics (N5/Higher); Administration and IT. NPAs in Data Science, Cyber Security, Software Development and Digital Literacies (SCQF 4-6).',
  apprenticeships_text = 'FA IT Software Development; FA IT Hardware Systems Support; MA IT & Telecoms; MA Data Analytics; MA Information Security; GA IT: Software Development; GA Cyber Security; GA Data Science. UWS offers a renamed "Data, AI and Software Engineering" GA.',
  scottish_context = 'Edinburgh hosts the GBP 750 million UK National Supercomputing Centre. The UK AI Security Institute hires across Scottish cities. Over 5,700 AI-related job postings were live in Scotland between July 2024 and June 2025, and the Lanarkshire AI Growth Zone is a GBP 15 billion project.'
WHERE name = 'Computing & Digital Technology';

-- Creative Arts & Design -------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'The creative sector has experienced the sharpest perception shift of any field. Generative AI has overturned the long-held assumption that creative jobs were safe from automation. The WEF now ranks graphic designer among the fastest-declining roles, and 26% of illustrators report already losing work to AI-generated art. Goldman Sachs estimates generative AI could automate 26% of tasks in arts, design, and media. Yet the picture is more nuanced than headlines suggest: UK creative industries employ 2.4 million people and the graphic design sector alone includes over 10,500 businesses. Creative agencies are using AI as an assistant for ideation and admin, not as a replacement for strategic creative direction. The sector is polarising — routine production work is under serious threat, but high-level creative direction and brand strategy are more valued than ever.',
  sqa_subjects_text = 'Art and Design, Graphic Communication and Music (N5/Higher/Advanced Higher); Drama, Media, Photography and Music Technology (N5/Higher); Design and Manufacture; English; Fashion and Textile Technology. NPAs in Digital Media and Digital Animation.',
  apprenticeships_text = 'FA Creative and Digital Media; MA Creative and Cultural, Design, Fashion & Textile.',
  scottish_context = 'UK creative industries employ 2.4 million people; the UK graphic design sector has over 10,500 businesses. Dundee is recognised as a global games-design hub.'
WHERE name = 'Creative Arts & Design';

-- Retail & Customer Service (new sector) ---------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'UK retail faces significant structural change. Research by Oliver Wyman and Retail Economics projects generative AI could automate 40-60% of routine store tasks by 2035, and up to 160,000 UK retail jobs could be at risk if retailers fail to adapt. AI-driven customer service chatbots are advancing rapidly — Gartner predicts that by 2029, agentic AI will resolve 80% of common customer issues autonomously. Yet 77% of UK consumers still use "hacks" to bypass AI and reach human agents, and in-person retail experience remains valued. The shift is toward "silent displacement" — roles going unfilled rather than formally cut — with remaining roles becoming more advisory and experience-focused.',
  sqa_subjects_text = 'Business (N4/N5); Business Management (N5/Higher); English (N5/Higher); Administration and IT (N5/Higher); Mathematics or Applications of Maths (N5).',
  apprenticeships_text = 'MA Customer Service; MA Retail.',
  scottish_context = 'Up to 160,000 UK retail jobs could be at risk by 2035 without adaptation, but 77% of UK consumers still prefer reaching human agents over chatbots.'
WHERE name = 'Retail & Customer Service';

-- Hospitality & Tourism --------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'The global AI market in hospitality is projected to grow from $10.3 billion in 2020 to $110.6 billion by 2031, yet the sector''s fundamentally interpersonal and physical nature provides strong protection for most frontline roles. Research on UK frontline food service finds that just 3.1% of task time involves empathetic skills — but those moments disproportionately define the guest experience and cannot be replicated by AI. Where AI is making inroads is in booking management, revenue pricing, stock ordering, and back-office admin — freeing up staff for guest-facing work rather than replacing them.',
  sqa_subjects_text = 'Practical Cookery (N5); Hospitality: Practical Cake Craft (N5); Health and Food Technology (N5/Higher); Business Management (N5/Higher); English (N5); Food, Health and Wellbeing (N4).',
  apprenticeships_text = 'FA Hospitality (pilot, SCQF 4/5); MA Chef; MA Hospitality Team Member; MA Hospitality Management; MA Hospitality Supervision & Leadership.',
  scottish_context = 'Scotland''s festivals and tourism sector is a core part of the national economy. The global hospitality AI market is forecast to grow from $10.3 billion (2020) to $110.6 billion (2031).'
WHERE name = 'Hospitality & Tourism';

-- Agriculture & Environment ----------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Scotland''s agricultural and environmental sectors are characterised by physical outdoor work, labour shortages, and growing demand driven by climate policy and renewable energy. AI is advancing rapidly through precision agriculture — GPS-guided tractors, drone monitoring, smart livestock collars, satellite crop analysis — but adoption in Scotland remains early-stage, with AI primarily filling labour gaps rather than displacing workers. The UK government''s AI Action Plan identifies agriculture as a key growth sector, and Scotland''s commitment to net-zero targets is creating new environmental roles. Peatland restoration, biodiversity monitoring, and carbon tracking are expanding career fields.',
  sqa_subjects_text = 'Biology and Environmental Science (N5/Higher); Geography (N5/Higher/Advanced Higher); Chemistry (N5/Higher); Mathematics; Physics.',
  apprenticeships_text = 'MA Agriculture; MA Aquaculture Production/Management; FA Food and Drink Technologies; FA Scientific Technologies.',
  scottish_context = 'Scotland''s net-zero targets are driving growth in peatland restoration, biodiversity monitoring and carbon tracking roles. The UK AI Action Plan identifies agriculture as a key growth sector.'
WHERE name = 'Agriculture & Environment';

-- Public Services & Government -------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'The UK government has made AI adoption a top priority, with the Prime Minister personally directing all Cabinet members to drive AI integration. The Science Secretary has stated that civil service workforce reductions are "almost certain" as AI is adopted, identifying a GBP 45 billion productivity opportunity from proper public sector technology use. Scotland''s public sector employs roughly 599,000 people (22.3% of total employment). The IPPR estimates back-office, entry-level, and part-time public sector roles face highest first-wave risk. However, complex casework, policy development, and citizen-facing services requiring empathy remain firmly human.',
  sqa_subjects_text = 'Modern Studies and English (N5/Higher/Advanced Higher); Administration and IT (N5/Higher); History; Politics (Higher); Mathematics (N5/Higher); Business Management; Sociology (Higher/Advanced Higher).',
  apprenticeships_text = 'MA Policing; MA Housing; MA Facilities Services & Management.',
  scottish_context = 'Scotland''s public sector employs ~599,000 people (22.3% of total employment). The UK has identified a GBP 45 billion productivity opportunity from AI adoption in the public sector.'
WHERE name = 'Public Services & Government';

-- Science & Research -----------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'AI is transforming how research is conducted rather than replacing researchers. The AI-driven drug discovery market grew from $1.5 billion in 2023 and is projected to exceed $20 billion by 2030. AlphaFold won the 2024 Nobel Prize in Chemistry, and Scotland hosts critical AI research infrastructure including the ARCHER2 supercomputer and the new GBP 750 million UK National Supercomputing Centre at Edinburgh. Scotland''s AI Strategy 2026-2031 identifies Healthcare and Life Sciences as a priority sector. The WEF estimates roughly 40% of routine laboratory tasks could be automated within the next decade, but experimental design, hypothesis generation, and cross-disciplinary creativity remain distinctly human.',
  sqa_subjects_text = 'Biology, Chemistry, Physics and Mathematics (N5/Higher/Advanced Higher); Human Biology; Environmental Science; Computing Science; Statistics (Advanced Higher); Scottish Baccalaureate in Science. NPA Data Science (SCQF 4-6).',
  apprenticeships_text = 'FA Scientific Technologies; GA Data Science.',
  scottish_context = 'Scotland hosts the ARCHER2 supercomputer and the GBP 750 million UK National Supercomputing Centre in Edinburgh. Scotland''s AI Strategy 2026-2031 identifies Healthcare and Life Sciences as a priority sector.'
WHERE name = 'Science & Research';

-- Sport & Fitness --------------------------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Sport and fitness is one of the most AI-resilient sectors. Only 3% of fitness instructor roles face full automation risk, and 90% of consumers prefer human coaching over AI workout guidance. The global AI in fitness and wellness market is growing at nearly 17% annually, but this growth is driven by tools that assist coaches rather than replace them. The defining insight from the International Sports Sciences Association is clear: "AI will not replace trainers. Trainers who learn to use AI well will replace those who do not." The physical, interpersonal, and motivational core of these roles provides strong natural protection.',
  sqa_subjects_text = 'Physical Education (N5/Higher/Advanced Higher); Biology; Human Biology (Higher); Psychology (Higher/Advanced Higher); Business Management (N5/Higher); English; Dance (N5/Higher/Advanced Higher).',
  apprenticeships_text = 'MA Active Leisure, Learning & Wellbeing.',
  scottish_context = 'Only 3% of UK fitness instructor roles face full automation risk. 90% of UK consumers prefer human coaching over AI-only fitness guidance.'
WHERE name = 'Sport & Fitness';

-- Transport & Logistics (new sector) -------------------------------------
UPDATE career_sectors SET
  ai_sector_narrative = 'Transport presents a split picture: warehouse automation is advancing rapidly, but autonomous driving on UK roads remains far more distant than headlines suggest. The UK warehouse automation market is growing at 9.5% annually and over 50% of UK fulfilment centres are projected to use AI by 2025. Ocado''s robotic system delivered 30 million picks in 2024 with 99.9% accuracy. In contrast, industry experts say autonomous 42-tonne trucks on open UK roads are "unlikely before 2050", and the UK faces a structural HGV driver shortage of 40,000-60,000 drivers with an average driver age of 51. The UK''s Automated Vehicles Act 2024 provides a legal framework, but Level 4 autonomous taxis are not expected even in pilot form until spring 2026 at the earliest, and only in limited London zones.',
  sqa_subjects_text = 'Mathematics (N5/Higher); Geography (N5/Higher); Physics (N5/Higher); Business Management; Administration and IT; Engineering Science; Practical Electronics (N5).',
  apprenticeships_text = 'FA Automotive (pilot); MA in various transport-related frameworks.',
  scottish_context = 'UK faces an HGV driver shortage of 40,000-60,000 with an average driver age of 51. Industry experts say autonomous 42-tonne trucks on open UK roads are unlikely before 2050. UK warehouse automation market growing ~9.5% annually.'
WHERE name = 'Transport & Logistics';

-- ============================================
-- PART 5: Verify
-- ============================================
DO $$
DECLARE
  sector_count     INT;
  enriched_count   INT;
  missing_sectors  TEXT;
BEGIN
  SELECT COUNT(*) INTO sector_count FROM career_sectors;
  SELECT COUNT(*) INTO enriched_count
    FROM career_sectors
    WHERE ai_sector_narrative IS NOT NULL;

  SELECT string_agg(name, ', ') INTO missing_sectors
    FROM career_sectors
    WHERE ai_sector_narrative IS NULL;

  RAISE NOTICE 'career_sectors rows: %', sector_count;
  RAISE NOTICE 'sectors with ai_sector_narrative: %', enriched_count;
  RAISE NOTICE 'sectors left without AI narrative (no research-doc coverage): %', COALESCE(missing_sectors, 'none');

  IF sector_count < 18 THEN
    RAISE EXCEPTION 'Expected at least 18 career_sectors (16 original + 2 new), got %', sector_count;
  END IF;
  IF enriched_count < 15 THEN
    RAISE EXCEPTION 'Expected 15 sectors with ai_sector_narrative, got %', enriched_count;
  END IF;
END $$;
