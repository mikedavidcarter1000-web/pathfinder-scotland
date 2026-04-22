-- ============================================
-- Seed: career_roles + links for the 3 sectors not covered
--       by the research doc's sector tables
-- Migration: 20260412000004
--
-- The research document "AI and the Future of Careers: A Guide for
-- Scottish School Leavers" (April 2026) has explicit role tables for
-- 15 sector archetypes. Three DB sectors do not appear as dedicated
-- tables in the doc:
--
--   * Media & Communications       (doc folds this into "Creative arts,
--                                    media and design")
--   * Social Work & Community      (doc touches on care work under
--                                    "Healthcare and social care")
--   * Performing Arts & Entertainment (doc treats creative judgment
--                                    as part of "Creative arts, media
--                                    and design")
--
-- Roles below are constructed by applying the research document's
-- stated framework to standard UK role catalogues for these sectors:
--   - physical / interpersonal / live presence  = low rating (1-3)
--   - routine content production                = higher rating (5-7)
--   - creative judgment under ambiguity         = medium-low (3-5)
--   - "new AI roles emerging"                   = rating 1 (growth)
--
-- Where the doc DID give a rating for a directly comparable role
-- (e.g. Journalist / Content Writer = 6 in Creative), we reuse that
-- rating verbatim.
-- ============================================

BEGIN;

-- Clean prior seeds for these three sectors so the migration is re-runnable.
DELETE FROM career_role_subjects
  WHERE career_role_id IN (
    SELECT r.id FROM career_roles r
    JOIN career_sectors cs ON cs.id = r.career_sector_id
    WHERE cs.name IN ('Media & Communications','Social Work & Community','Performing Arts & Entertainment')
  );

DELETE FROM career_roles
  WHERE career_sector_id IN (
    SELECT id FROM career_sectors
    WHERE name IN ('Media & Communications','Social Work & Community','Performing Arts & Entertainment')
  );

-- ============================================
-- PART 1: Sector narratives (extrapolated)
-- ============================================
-- These narratives are written in the voice of the research document
-- but apply its framework rather than quoting it, since the doc does
-- not have dedicated sections for these three sectors.

UPDATE career_sectors SET
  ai_sector_narrative = 'Media and communications sit at the sharp end of generative AI. Routine content work — social copy, basic news reports, press releases, SEO-driven articles — is now produced at near-zero marginal cost by AI. At the same time, investigative journalism, editorial judgment, original storytelling, trust-bearing reporting and strategic communications become more valuable, not less. The sector is polarising fast: entry-level writing and routine newsroom roles face the steepest pressure, while senior editors, broadcast journalists, documentary makers and PR strategists remain firmly human. AI verification and media literacy are themselves growing careers as misinformation and AI-generated content multiply.',
  sqa_subjects_text = 'English (N5/Higher/Advanced Higher); Media Studies (N5/Higher); Modern Studies and History (Higher); Journalism (N5); Film and Media (NPA); Art and Design; Photography; Music Technology; Business Management.',
  apprenticeships_text = 'FA Creative and Digital Media; MA Broadcast Production; MA Creative and Cultural.',
  scottish_context = 'Scotland''s media sector includes BBC Scotland, STV, independent production companies in Glasgow and Edinburgh, and a growing digital media cluster. Dundee is a notable games and content hub. Traditional print journalism continues to contract; digital and podcast content is growing.'
WHERE name = 'Media & Communications';

UPDATE career_sectors SET
  ai_sector_narrative = 'Social work and community services are among the most AI-resilient fields in the economy. The core of this work is trust, advocacy, and hands-on support for vulnerable people — the exact things AI cannot do. The research consensus (Oxford Martin, OECD, McKinsey) places social workers, mental health workers, youth workers and addiction counsellors in the least-exposed group, alongside early-years educators and skilled trades. AI''s contribution in this sector is administrative: case note drafting, appointment scheduling, pattern spotting across datasets, and digital inclusion support. The human work itself — complex assessment, therapeutic intervention, safeguarding, community building — remains distinctly human and is subject to growing demand as mental health needs and an ageing population push up caseloads.',
  sqa_subjects_text = 'English (N5/Higher/Advanced Higher); Psychology (Higher/Advanced Higher); Sociology (Higher); Modern Studies; Biology; Health and Food Technology; Care (N4/N5); Religious, Moral and Philosophical Studies.',
  apprenticeships_text = 'FA Social Services: Children and Young People; FA Social Services and Healthcare; MA Social Services: Children and Young People; MA Social Services and Healthcare.',
  scottish_context = 'Demand for social workers and mental-health support workers is growing across Scotland. Scotland''s Community Planning Partnerships rely heavily on community development and advocacy roles, and the third sector is a major employer. AI-free core work combined with heavy admin load makes this a sector where AI assists rather than displaces.'
WHERE name = 'Social Work & Community';

UPDATE career_sectors SET
  ai_sector_narrative = 'Performing arts and entertainment rely on live physical presence, creative judgment under ambiguity, and genuine emotional connection — the three areas where AI is weakest. Actors on stage, musicians playing live, dancers, and theatre directors all operate in a mode that no AI system can replicate. Generative AI does affect the sector at the edges: AI-generated backing tracks, AI-assisted sound design, virtual production techniques and AI-assisted casting tools. Music production and post-production are the most exposed parts of the industry; live performance and stagecraft are the least. The sector''s biggest structural challenges — income insecurity, freelance precarity, funding cuts — come from economics rather than automation.',
  sqa_subjects_text = 'Drama (N5/Higher/Advanced Higher); Music (N5/Higher/Advanced Higher); Dance (N5/Higher); Music Technology (N5/Higher); Musical Theatre; Art and Design; English; Film and Media.',
  apprenticeships_text = 'FA Creative and Digital Media; MA Creative and Cultural.',
  scottish_context = 'Scotland''s festivals (Edinburgh International Festival, Fringe, Celtic Connections) anchor a major performing arts economy. Traditional Scottish music, theatre, and dance remain strong niches. Much of the workforce is freelance, making the sector economically fragile but culturally robust.'
WHERE name = 'Performing Arts & Entertainment';

-- ============================================
-- PART 2: career_roles for Media & Communications (10)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Broadcast Journalist', 5,
 'AI handles routine news summarisation, transcription, and basic story drafting. Live reporting, investigative work, on-camera presence, and editorial judgment remain firmly human. Entry-level roles face most pressure; experienced broadcasters more insulated.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Polarising — entry-level contracting, senior reporting stable'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'TV / Film Producer', 3,
 'Creative direction, talent management, budgets, and final judgment remain human. AI assists with scripting, scheduling, and post-production automation. Strong protection for the core role.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Stable — creative direction remains human'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Public Relations Officer', 4,
 'AI drafts press releases, monitors coverage, and summarises stakeholder sentiment. Crisis management, relationship building, and strategic positioning remain human. Routine media monitoring roles face most pressure.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Stable — strategic PR in demand'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Social Media Manager', 6,
 'Content generation, post scheduling, and analytics are heavily automated by AI. Community management, brand voice development, and creative campaign strategy remain human. Role evolving toward strategy + AI orchestration.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Transforming — routine content work automated'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Copywriter', 6,
 'AI produces draft copy, headlines, and marketing content at speed. Brand voice, tone of voice strategy, and distinctive creative writing remain human. Junior copywriting roles face most pressure.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Entry-level shrinking, senior/strategic roles stable'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Broadcast Technician', 3,
 'Physical work on cameras, sound desks, lighting rigs, and OB trucks. AI assists with automated camera tracking and audio clean-up but the hands-on operational role remains.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Stable — physical technical work protected'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Publishing Editor', 5,
 'AI supports copy-editing, fact-checking, and content tagging. Acquisition decisions, editorial judgment, and authorial relationships remain human. Entry-level assistant editor roles most exposed.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Transforming — editorial judgment remains human'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Communications Officer', 4,
 'AI drafts internal comms, stakeholder updates, and routine reports. Strategic messaging, tone setting, and senior leadership comms remain human.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', false,
 'Stable — strategic comms in demand'),

-- New AI roles (media)
((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'AI News Verification Specialist', 1,
 'Verifies the authenticity of images, video, audio, and text in a world of AI-generated content. A fast-emerging role as deepfakes and synthetic media spread.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', true,
 'Fast-emerging — misinformation response'),

((SELECT id FROM career_sectors WHERE name='Media & Communications'),
 'Automated Media Monitoring Analyst', 1,
 'Uses AI tools to monitor brand mentions, sentiment, and emerging narratives across media channels, turning AI output into human insight.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 55,000', true,
 'Emerging — hybrid AI and insight role');

-- ============================================
-- PART 3: career_roles for Social Work & Community (10)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Social Worker', 2,
 'Assessment, advocacy, safeguarding, and multi-agency work rely on human judgment and trust. AI handles case note drafting and caseload analytics. One of the least AI-exposed professions.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Strong demand — shortages across Scotland'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Community Development Worker', 2,
 'Building local relationships, running community projects, and working with grassroots groups. AI assists with funding applications, reporting, and data analysis. The core role remains human.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Stable — community work protected'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Youth Worker', 1,
 'Direct relationship-building with young people, running activities, mentoring, and intervening in crisis. Physical presence and trust are the whole role. Very low automation risk.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Stable — highly automation-resistant'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Family Support Worker', 1,
 'Working directly with families in crisis, offering practical and emotional support in their own homes. The human presence is the intervention. Among the most AI-resistant roles in the economy.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Growing — demand rising with mental health needs'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Mental Health Support Worker', 1,
 'Providing direct emotional support, supervision, and de-escalation for people in mental health crisis. AI cannot replicate therapeutic presence. Demand outstripping supply.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Strong growth — mental health demand rising'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Addiction Counsellor', 2,
 'Therapeutic work with people struggling with addiction. Long-term human relationships and trauma-informed care are irreplaceable. AI assists with screening tools only.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Stable — therapeutic work protected'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Homelessness Support Worker', 1,
 'Frontline support for people experiencing homelessness, including outreach, housing advice, and crisis intervention. AI cannot replace human presence on the street.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Growing — Scotland housing pressure'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Charity Manager', 4,
 'Strategy, fundraising, HR, finance, and governance. AI automates routine reporting, fundraising analytics, and grant-writing support. Leadership and donor relationships remain human.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', false,
 'Stable — leadership roles protected'),

-- New AI roles (social work)
((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Digital Inclusion Worker', 1,
 'Helps vulnerable groups access digital services and AI tools. A new role that bridges the growing digital divide in health, benefits, and services.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', true,
 'Growing — Scotland digital inclusion priority'),

((SELECT id FROM career_sectors WHERE name='Social Work & Community'),
 'Social Services Data Analyst', 2,
 'Uses AI and data tools to surface patterns in case data and help target interventions. A hybrid analytical role emerging in councils and charities.',
 'GBP 22,000 - GBP 28,000', 'GBP 32,000 - GBP 45,000', true,
 'Emerging — councils adopting analytics');

-- ============================================
-- PART 4: career_roles for Performing Arts & Entertainment (11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Actor', 2,
 'Live stage and screen performance rely on physical presence, emotional range, and audience connection that AI cannot replicate. Contract work remains precarious but not for AI reasons.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — live performance protected'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Musician (Live Performer)', 2,
 'Live performance in orchestras, bands, gigs, and sessions remains entirely human. AI-generated music is a separate market; live music is growing as audiences seek real experiences.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — live music market growing'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Dancer', 1,
 'Entirely physical art form. AI has no purchase on the core role. One of the most automation-resistant professions.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — physical art form protected'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Theatre Director', 3,
 'Creative vision, casting decisions, working with actors in rehearsal. AI may assist with scheduling and production planning. The core directorial role remains firmly human.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — creative direction remains human'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Stage Manager', 3,
 'Running live performances, coordinating cast and crew, cueing technical elements. AI tools help with scheduling and comms; the in-room role is human.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — live coordination human'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Choreographer', 3,
 'Creating new movement and directing dancers. AI has experimented with movement generation but cannot replicate embodied creative judgment. Core role protected.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — embodied creative work protected'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Sound Technician', 3,
 'Operating live sound desks, setting up PAs, managing monitor mixes. AI assists with automated mixing and noise reduction. Live operation remains human.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — live sound remains human'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Lighting Designer', 4,
 'Creative lighting plots and live operation. AI assists with automated cue generation and simulation. Creative design work remains human; some operator tasks automating.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Stable — creative lighting work protected'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Music Producer', 5,
 'AI music tools automate aspects of arrangement, mixing, and mastering. Artistic direction, talent development, and A&R remain human. The most AI-exposed role in performing arts.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', false,
 'Transforming — AI music generation rising'),

-- New AI roles (performing arts)
((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'AI Music Production Specialist', 1,
 'Uses AI tools to accelerate music production workflows, including arrangement, stem separation, mastering, and ambient composition. An emerging hybrid creative-technical role.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', true,
 'Emerging — AI music workflows expanding'),

((SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'),
 'Virtual Production Technician', 1,
 'Operates LED volume stages and real-time game-engine environments used in film and TV production. A fast-growing area where AI, VFX and theatre craft meet.',
 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)', 'GBP 25,000 - GBP 50,000+', true,
 'Fast-growing — virtual production mainstream');

-- ============================================
-- PART 5: career_role_subjects links for these sectors
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  -- Media & Communications
  ('Media & Communications', 'Broadcast Journalist', 'English',       'essential'),
  ('Media & Communications', 'Broadcast Journalist', 'Media Studies', 'essential'),
  ('Media & Communications', 'Broadcast Journalist', 'Modern Studies','recommended'),
  ('Media & Communications', 'Broadcast Journalist', 'Journalism',    'recommended'),
  ('Media & Communications', 'Broadcast Journalist', 'History',       'useful'),

  ('Media & Communications', 'TV / Film Producer', 'English',       'essential'),
  ('Media & Communications', 'TV / Film Producer', 'Media Studies', 'essential'),
  ('Media & Communications', 'TV / Film Producer', 'Film and Media','recommended'),
  ('Media & Communications', 'TV / Film Producer', 'Business Management','recommended'),
  ('Media & Communications', 'TV / Film Producer', 'Drama',         'useful'),

  ('Media & Communications', 'Public Relations Officer', 'English',         'essential'),
  ('Media & Communications', 'Public Relations Officer', 'Media Studies',   'essential'),
  ('Media & Communications', 'Public Relations Officer', 'Business Management','recommended'),
  ('Media & Communications', 'Public Relations Officer', 'Modern Studies',  'recommended'),
  ('Media & Communications', 'Public Relations Officer', 'Psychology',      'useful'),

  ('Media & Communications', 'Social Media Manager', 'English',              'essential'),
  ('Media & Communications', 'Social Media Manager', 'Business Management',  'essential'),
  ('Media & Communications', 'Social Media Manager', 'Media Studies',        'recommended'),
  ('Media & Communications', 'Social Media Manager', 'Digital Media',        'recommended'),
  ('Media & Communications', 'Social Media Manager', 'Graphic Communication','useful'),

  ('Media & Communications', 'Copywriter', 'English',      'essential'),
  ('Media & Communications', 'Copywriter', 'Media Studies','recommended'),
  ('Media & Communications', 'Copywriter', 'Modern Studies','recommended'),
  ('Media & Communications', 'Copywriter', 'History',      'useful'),
  ('Media & Communications', 'Copywriter', 'Psychology',   'useful'),

  ('Media & Communications', 'Broadcast Technician', 'Physics',            'essential'),
  ('Media & Communications', 'Broadcast Technician', 'Music Technology',   'essential'),
  ('Media & Communications', 'Broadcast Technician', 'Engineering Science','recommended'),
  ('Media & Communications', 'Broadcast Technician', 'Film and Media',     'recommended'),
  ('Media & Communications', 'Broadcast Technician', 'Mathematics',        'useful'),

  ('Media & Communications', 'Publishing Editor', 'English',          'essential'),
  ('Media & Communications', 'Publishing Editor', 'Media Studies',    'recommended'),
  ('Media & Communications', 'Publishing Editor', 'Modern Studies',   'recommended'),
  ('Media & Communications', 'Publishing Editor', 'History',          'useful'),
  ('Media & Communications', 'Publishing Editor', 'Classical Studies','useful'),

  ('Media & Communications', 'Communications Officer', 'English',            'essential'),
  ('Media & Communications', 'Communications Officer', 'Business Management','recommended'),
  ('Media & Communications', 'Communications Officer', 'Modern Studies',     'recommended'),
  ('Media & Communications', 'Communications Officer', 'Media Studies',      'useful'),
  ('Media & Communications', 'Communications Officer', 'Administration and IT','useful'),

  ('Media & Communications', 'AI News Verification Specialist', 'English',         'essential'),
  ('Media & Communications', 'AI News Verification Specialist', 'Computing Science','essential'),
  ('Media & Communications', 'AI News Verification Specialist', 'Media Studies',   'recommended'),
  ('Media & Communications', 'AI News Verification Specialist', 'Modern Studies',  'recommended'),
  ('Media & Communications', 'AI News Verification Specialist', 'Philosophy',      'useful'),

  ('Media & Communications', 'Automated Media Monitoring Analyst', 'English',           'essential'),
  ('Media & Communications', 'Automated Media Monitoring Analyst', 'Computing Science', 'essential'),
  ('Media & Communications', 'Automated Media Monitoring Analyst', 'Mathematics',       'recommended'),
  ('Media & Communications', 'Automated Media Monitoring Analyst', 'Business Management','recommended'),
  ('Media & Communications', 'Automated Media Monitoring Analyst', 'Data Science',      'useful'),

  -- Social Work & Community
  ('Social Work & Community', 'Social Worker', 'English',       'essential'),
  ('Social Work & Community', 'Social Worker', 'Psychology',    'essential'),
  ('Social Work & Community', 'Social Worker', 'Sociology',     'recommended'),
  ('Social Work & Community', 'Social Worker', 'Modern Studies','recommended'),
  ('Social Work & Community', 'Social Worker', 'Biology',       'useful'),

  ('Social Work & Community', 'Community Development Worker', 'English',       'essential'),
  ('Social Work & Community', 'Community Development Worker', 'Modern Studies','essential'),
  ('Social Work & Community', 'Community Development Worker', 'Sociology',     'recommended'),
  ('Social Work & Community', 'Community Development Worker', 'Psychology',    'recommended'),
  ('Social Work & Community', 'Community Development Worker', 'Business Management','useful'),

  ('Social Work & Community', 'Youth Worker', 'English',              'essential'),
  ('Social Work & Community', 'Youth Worker', 'Psychology',           'recommended'),
  ('Social Work & Community', 'Youth Worker', 'Physical Education',   'recommended'),
  ('Social Work & Community', 'Youth Worker', 'Modern Studies',       'recommended'),
  ('Social Work & Community', 'Youth Worker', 'Early Learning and Childcare','useful'),

  ('Social Work & Community', 'Family Support Worker', 'English',                     'essential'),
  ('Social Work & Community', 'Family Support Worker', 'Psychology',                  'essential'),
  ('Social Work & Community', 'Family Support Worker', 'Early Learning and Childcare','recommended'),
  ('Social Work & Community', 'Family Support Worker', 'Sociology',                   'recommended'),
  ('Social Work & Community', 'Family Support Worker', 'Health and Food Technology',  'useful'),

  ('Social Work & Community', 'Mental Health Support Worker', 'Psychology',    'essential'),
  ('Social Work & Community', 'Mental Health Support Worker', 'English',       'essential'),
  ('Social Work & Community', 'Mental Health Support Worker', 'Biology',       'recommended'),
  ('Social Work & Community', 'Mental Health Support Worker', 'Human Biology', 'recommended'),
  ('Social Work & Community', 'Mental Health Support Worker', 'Sociology',     'useful'),

  ('Social Work & Community', 'Addiction Counsellor', 'Psychology',    'essential'),
  ('Social Work & Community', 'Addiction Counsellor', 'English',       'essential'),
  ('Social Work & Community', 'Addiction Counsellor', 'Sociology',     'recommended'),
  ('Social Work & Community', 'Addiction Counsellor', 'Biology',       'recommended'),
  ('Social Work & Community', 'Addiction Counsellor', 'Modern Studies','useful'),

  ('Social Work & Community', 'Homelessness Support Worker', 'English',       'essential'),
  ('Social Work & Community', 'Homelessness Support Worker', 'Modern Studies','essential'),
  ('Social Work & Community', 'Homelessness Support Worker', 'Psychology',    'recommended'),
  ('Social Work & Community', 'Homelessness Support Worker', 'Sociology',     'recommended'),
  ('Social Work & Community', 'Homelessness Support Worker', 'Religious, Moral and Philosophical Studies (RMPS)','useful'),

  ('Social Work & Community', 'Charity Manager', 'English',              'essential'),
  ('Social Work & Community', 'Charity Manager', 'Business Management',  'essential'),
  ('Social Work & Community', 'Charity Manager', 'Modern Studies',       'recommended'),
  ('Social Work & Community', 'Charity Manager', 'Mathematics',          'recommended'),
  ('Social Work & Community', 'Charity Manager', 'Administration and IT','useful'),

  ('Social Work & Community', 'Digital Inclusion Worker', 'English',             'essential'),
  ('Social Work & Community', 'Digital Inclusion Worker', 'Computing Science',   'essential'),
  ('Social Work & Community', 'Digital Inclusion Worker', 'Administration and IT','recommended'),
  ('Social Work & Community', 'Digital Inclusion Worker', 'Modern Studies',      'recommended'),
  ('Social Work & Community', 'Digital Inclusion Worker', 'Psychology',          'useful'),

  ('Social Work & Community', 'Social Services Data Analyst', 'Mathematics',         'essential'),
  ('Social Work & Community', 'Social Services Data Analyst', 'Computing Science',   'essential'),
  ('Social Work & Community', 'Social Services Data Analyst', 'Sociology',           'recommended'),
  ('Social Work & Community', 'Social Services Data Analyst', 'Psychology',          'recommended'),
  ('Social Work & Community', 'Social Services Data Analyst', 'Data Science',        'useful'),

  -- Performing Arts & Entertainment
  ('Performing Arts & Entertainment', 'Actor', 'Drama',        'essential'),
  ('Performing Arts & Entertainment', 'Actor', 'English',      'essential'),
  ('Performing Arts & Entertainment', 'Actor', 'Musical Theatre','recommended'),
  ('Performing Arts & Entertainment', 'Actor', 'Dance',        'recommended'),
  ('Performing Arts & Entertainment', 'Actor', 'Music',        'useful'),

  ('Performing Arts & Entertainment', 'Musician (Live Performer)', 'Music',           'essential'),
  ('Performing Arts & Entertainment', 'Musician (Live Performer)', 'Music Technology','recommended'),
  ('Performing Arts & Entertainment', 'Musician (Live Performer)', 'Musical Theatre', 'recommended'),
  ('Performing Arts & Entertainment', 'Musician (Live Performer)', 'English',         'useful'),
  ('Performing Arts & Entertainment', 'Musician (Live Performer)', 'Physical Education','useful'),

  ('Performing Arts & Entertainment', 'Dancer', 'Dance',              'essential'),
  ('Performing Arts & Entertainment', 'Dancer', 'Physical Education', 'essential'),
  ('Performing Arts & Entertainment', 'Dancer', 'Drama',              'recommended'),
  ('Performing Arts & Entertainment', 'Dancer', 'Music',              'recommended'),
  ('Performing Arts & Entertainment', 'Dancer', 'Musical Theatre',    'useful'),

  ('Performing Arts & Entertainment', 'Theatre Director', 'Drama',       'essential'),
  ('Performing Arts & Entertainment', 'Theatre Director', 'English',     'essential'),
  ('Performing Arts & Entertainment', 'Theatre Director', 'History',     'recommended'),
  ('Performing Arts & Entertainment', 'Theatre Director', 'Music',       'recommended'),
  ('Performing Arts & Entertainment', 'Theatre Director', 'Art and Design','useful'),

  ('Performing Arts & Entertainment', 'Stage Manager', 'Drama',              'essential'),
  ('Performing Arts & Entertainment', 'Stage Manager', 'English',            'essential'),
  ('Performing Arts & Entertainment', 'Stage Manager', 'Business Management','recommended'),
  ('Performing Arts & Entertainment', 'Stage Manager', 'Music Technology',   'recommended'),
  ('Performing Arts & Entertainment', 'Stage Manager', 'Event Organisation', 'useful'),

  ('Performing Arts & Entertainment', 'Choreographer', 'Dance',             'essential'),
  ('Performing Arts & Entertainment', 'Choreographer', 'Physical Education','essential'),
  ('Performing Arts & Entertainment', 'Choreographer', 'Music',             'recommended'),
  ('Performing Arts & Entertainment', 'Choreographer', 'Drama',             'recommended'),
  ('Performing Arts & Entertainment', 'Choreographer', 'Musical Theatre',   'useful'),

  ('Performing Arts & Entertainment', 'Sound Technician', 'Music Technology',   'essential'),
  ('Performing Arts & Entertainment', 'Sound Technician', 'Physics',            'essential'),
  ('Performing Arts & Entertainment', 'Sound Technician', 'Engineering Science','recommended'),
  ('Performing Arts & Entertainment', 'Sound Technician', 'Music',              'recommended'),
  ('Performing Arts & Entertainment', 'Sound Technician', 'Computing Science',  'useful'),

  ('Performing Arts & Entertainment', 'Lighting Designer', 'Drama',              'essential'),
  ('Performing Arts & Entertainment', 'Lighting Designer', 'Physics',            'recommended'),
  ('Performing Arts & Entertainment', 'Lighting Designer', 'Art and Design',     'recommended'),
  ('Performing Arts & Entertainment', 'Lighting Designer', 'Graphic Communication','useful'),
  ('Performing Arts & Entertainment', 'Lighting Designer', 'Computing Science',  'useful'),

  ('Performing Arts & Entertainment', 'Music Producer', 'Music Technology','essential'),
  ('Performing Arts & Entertainment', 'Music Producer', 'Music',           'essential'),
  ('Performing Arts & Entertainment', 'Music Producer', 'Computing Science','recommended'),
  ('Performing Arts & Entertainment', 'Music Producer', 'Physics',         'recommended'),
  ('Performing Arts & Entertainment', 'Music Producer', 'English',         'useful'),

  ('Performing Arts & Entertainment', 'AI Music Production Specialist', 'Music Technology','essential'),
  ('Performing Arts & Entertainment', 'AI Music Production Specialist', 'Music',           'essential'),
  ('Performing Arts & Entertainment', 'AI Music Production Specialist', 'Computing Science','recommended'),
  ('Performing Arts & Entertainment', 'AI Music Production Specialist', 'Mathematics',     'recommended'),
  ('Performing Arts & Entertainment', 'AI Music Production Specialist', 'Physics',         'useful'),

  ('Performing Arts & Entertainment', 'Virtual Production Technician', 'Computing Science',  'essential'),
  ('Performing Arts & Entertainment', 'Virtual Production Technician', 'Computer Games Development','essential'),
  ('Performing Arts & Entertainment', 'Virtual Production Technician', 'Film and Media',     'recommended'),
  ('Performing Arts & Entertainment', 'Virtual Production Technician', 'Art and Design',     'recommended'),
  ('Performing Arts & Entertainment', 'Virtual Production Technician', 'Drama',              'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify
-- ============================================
DO $$
DECLARE
  total_roles  INT;
  total_links  INT;
  below_min    INT;
  missing      INT;
BEGIN
  SELECT COUNT(*) INTO total_roles FROM career_roles;
  SELECT COUNT(*) INTO total_links FROM career_role_subjects;

  -- Every sector should now have >= 8 roles.
  SELECT COUNT(*) INTO below_min
    FROM (
      SELECT cs.id, COUNT(r.id) AS c
      FROM career_sectors cs
      LEFT JOIN career_roles r ON r.career_sector_id = cs.id
      GROUP BY cs.id
      HAVING COUNT(r.id) < 8
    ) t;

  -- Every role should have >= 3 linked subjects.
  SELECT COUNT(*) INTO missing
    FROM (
      SELECT r.id
      FROM career_roles r
      LEFT JOIN career_role_subjects crs ON crs.career_role_id = r.id
      GROUP BY r.id
      HAVING COUNT(crs.subject_id) < 3
    ) t;

  RAISE NOTICE 'career_roles total: %', total_roles;
  RAISE NOTICE 'career_role_subjects total: %', total_links;
  RAISE NOTICE 'sectors below 8-role floor: %', below_min;
  RAISE NOTICE 'roles with fewer than 3 subjects: %', missing;

  IF total_roles < 180 THEN
    RAISE EXCEPTION 'Expected at least 180 roles total; got %', total_roles;
  END IF;
  IF total_links < 900 THEN
    RAISE EXCEPTION 'Expected at least 900 role-subject links; got %', total_links;
  END IF;
  IF below_min > 0 THEN
    RAISE EXCEPTION 'Some sectors have fewer than 8 roles (count: %)', below_min;
  END IF;
  IF missing > 0 THEN
    RAISE EXCEPTION 'Some roles have fewer than 3 linked subjects (count: %)', missing;
  END IF;
END $$;

COMMIT;
