-- ============================================
-- Enrich career_sectors with rich student-facing content
-- Migration: 20260411000005
-- Adds: example_jobs[], salary_range_entry, salary_range_experienced,
--       growth_outlook, plus course_subject_areas[] for /careers/[id]
--       university-course lookups.
-- ============================================

-- 1. Add columns
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS example_jobs             TEXT[] DEFAULT '{}';
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS salary_range_entry       TEXT;
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS salary_range_experienced TEXT;
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS growth_outlook           TEXT;
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS course_subject_areas     TEXT[] DEFAULT '{}';

-- 2. Populate each sector
UPDATE career_sectors SET
  description = 'From doctors and nurses to paramedics and pharmacists — healthcare is one of Scotland''s largest employers. These careers focus on keeping people healthy, treating illness, and improving lives.',
  example_jobs = ARRAY['Doctor','Nurse','Dentist','Pharmacist','Paramedic','Physiotherapist','Radiographer','Occupational Therapist','Midwife','Clinical Psychologist'],
  salary_range_entry = 'GBP 25,000 - GBP 32,000',
  salary_range_experienced = 'GBP 40,000 - GBP 90,000+',
  growth_outlook = 'Strong growth — NHS Scotland is actively recruiting across all healthcare roles, with particular demand for nurses and GPs.',
  course_subject_areas = ARRAY['Medicine','Dentistry','Nursing','Pharmacy','Health Sciences','Veterinary Medicine']
WHERE name = 'Healthcare & Medicine';

UPDATE career_sectors SET
  description = 'Engineers design, build, and improve everything from bridges and buildings to cars and computer chips. Scotland has a strong engineering heritage, especially in energy, aerospace, and construction.',
  example_jobs = ARRAY['Civil Engineer','Mechanical Engineer','Electrical Engineer','Chemical Engineer','Structural Engineer','Aerospace Engineer','Manufacturing Engineer','Energy Engineer','Marine Engineer','Robotics Engineer'],
  salary_range_entry = 'GBP 24,000 - GBP 30,000',
  salary_range_experienced = 'GBP 38,000 - GBP 65,000',
  growth_outlook = 'Growing — Scotland''s renewable energy sector and infrastructure investment are driving strong demand for engineers.',
  course_subject_areas = ARRAY['Engineering']
WHERE name = 'Engineering & Manufacturing';

UPDATE career_sectors SET
  description = 'From building apps and websites to protecting against cyber attacks and analysing data — digital technology is the fastest-growing sector in Scotland. Almost every other industry needs people with tech skills.',
  example_jobs = ARRAY['Software Developer','Data Analyst','Cyber Security Analyst','Web Developer','UX Designer','IT Support Engineer','Network Engineer','AI/Machine Learning Engineer','Games Developer','Database Administrator'],
  salary_range_entry = 'GBP 25,000 - GBP 32,000',
  salary_range_experienced = 'GBP 40,000 - GBP 75,000',
  growth_outlook = 'Fastest-growing sector in Scotland — Edinburgh and Glasgow are major tech hubs with strong demand for developers and data specialists.',
  course_subject_areas = ARRAY['Computing Science']
WHERE name = 'Computing & Digital Technology';

UPDATE career_sectors SET
  description = 'Scientists investigate the natural world, develop new medicines, improve food production, and tackle climate change. Scotland''s universities and research institutes are world-leading in many fields.',
  example_jobs = ARRAY['Research Scientist','Lab Technician','Environmental Scientist','Biomedical Scientist','Marine Biologist','Geologist','Forensic Scientist','Food Scientist','Meteorologist','Conservation Scientist'],
  salary_range_entry = 'GBP 22,000 - GBP 28,000',
  salary_range_experienced = 'GBP 35,000 - GBP 60,000',
  growth_outlook = 'Stable with growth in life sciences — Scotland''s life sciences sector around Edinburgh and Dundee is expanding.',
  course_subject_areas = ARRAY['Biological Sciences','Chemistry','Physics','Mathematics','Environmental Science','Food Science','Geology','Marine Science']
WHERE name = 'Science & Research';

UPDATE career_sectors SET
  description = 'Lawyers, judges, and police officers work to protect people''s rights, resolve disputes, and keep communities safe. Scotland has its own legal system, different from England and Wales.',
  example_jobs = ARRAY['Solicitor','Advocate','Legal Secretary','Police Officer','Prison Officer','Probation Officer','Court Reporter','Legal Executive','Immigration Adviser','Victims Support Worker'],
  salary_range_entry = 'GBP 22,000 - GBP 28,000',
  salary_range_experienced = 'GBP 40,000 - GBP 80,000+',
  growth_outlook = 'Stable — consistent demand for solicitors and police officers across Scotland.',
  course_subject_areas = ARRAY['Law']
WHERE name = 'Law & Justice';

UPDATE career_sectors SET
  description = 'Teachers, lecturers, and support workers help people learn at every stage of life. Scotland needs thousands of new teachers over the next decade, especially in STEM subjects.',
  example_jobs = ARRAY['Primary Teacher','Secondary Teacher','Nursery Practitioner','University Lecturer','Educational Psychologist','Learning Support Assistant','Music Teacher','PE Teacher','Librarian','Training Officer'],
  salary_range_entry = 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)',
  salary_range_experienced = 'GBP 40,000 - GBP 55,000',
  growth_outlook = 'Growing — Scotland faces a teacher shortage, particularly in Maths, Physics, Computing, and Technical subjects.',
  course_subject_areas = ARRAY['Education']
WHERE name = 'Education & Teaching';

UPDATE career_sectors SET
  description = 'From managing a company''s money to starting your own business — these careers involve planning, analysing, and making decisions that help organisations succeed. Edinburgh is one of Europe''s biggest financial centres.',
  example_jobs = ARRAY['Accountant','Financial Adviser','Bank Manager','Business Analyst','Actuary','Auditor','Insurance Underwriter','Investment Analyst','Tax Adviser','Management Consultant'],
  salary_range_entry = 'GBP 22,000 - GBP 30,000',
  salary_range_experienced = 'GBP 40,000 - GBP 75,000',
  growth_outlook = 'Strong — Edinburgh''s financial services sector is the second largest in the UK after London.',
  course_subject_areas = ARRAY['Business Management','Economics']
WHERE name = 'Business & Finance';

UPDATE career_sectors SET
  description = 'Artists, designers, and creators shape the visual world around us — from buildings and products to graphics and fashion. Scotland has a thriving creative economy, especially in Edinburgh, Glasgow, and Dundee.',
  example_jobs = ARRAY['Graphic Designer','Architect','Interior Designer','Product Designer','Animator','Illustrator','Fashion Designer','Photographer','Jewellery Designer','Textile Designer'],
  salary_range_entry = 'GBP 18,000 - GBP 24,000',
  salary_range_experienced = 'GBP 30,000 - GBP 50,000',
  growth_outlook = 'Growing — Scotland''s creative industries are expanding, with particular strength in games design (Dundee) and architecture.',
  course_subject_areas = ARRAY['Art and Design','Architecture']
WHERE name = 'Creative Arts & Design';

UPDATE career_sectors SET
  description = 'Journalists, filmmakers, and communications professionals tell stories, share information, and help organisations connect with people. Scotland has a strong media industry including the BBC, STV, and a growing digital media sector.',
  example_jobs = ARRAY['Journalist','TV/Film Producer','Public Relations Officer','Social Media Manager','Copywriter','Marketing Manager','Broadcaster','Video Editor','Communications Officer','Content Creator'],
  salary_range_entry = 'GBP 20,000 - GBP 26,000',
  salary_range_experienced = 'GBP 32,000 - GBP 55,000',
  growth_outlook = 'Changing — traditional media declining but digital media, content creation, and marketing communications growing.',
  course_subject_areas = ARRAY['Media Studies','English']
WHERE name = 'Media & Communications';

UPDATE career_sectors SET
  description = 'Social workers, community workers, and charity staff support vulnerable people and help build stronger communities. These careers are emotionally demanding but deeply rewarding.',
  example_jobs = ARRAY['Social Worker','Community Development Worker','Youth Worker','Charity Manager','Family Support Worker','Mental Health Worker','Addiction Counsellor','Homelessness Worker','Refugee Support Worker','Advocacy Officer'],
  salary_range_entry = 'GBP 22,000 - GBP 28,000',
  salary_range_experienced = 'GBP 32,000 - GBP 45,000',
  growth_outlook = 'Growing — increased demand for social workers and mental health support workers across Scotland.',
  course_subject_areas = ARRAY['Social Work','Sociology','Psychology']
WHERE name = 'Social Work & Community';

UPDATE career_sectors SET
  description = 'From coaching elite athletes to helping people stay healthy — sport and fitness careers combine physical activity with teaching and motivation. Scotland invests heavily in sport through sportscotland.',
  example_jobs = ARRAY['PE Teacher','Sports Coach','Personal Trainer','Physiotherapist','Sports Scientist','Sports Development Officer','Leisure Centre Manager','Outdoor Activities Instructor','Nutritionist','Sports Journalist'],
  salary_range_entry = 'GBP 18,000 - GBP 24,000',
  salary_range_experienced = 'GBP 28,000 - GBP 45,000',
  growth_outlook = 'Stable with growth in health and wellbeing roles.',
  course_subject_areas = ARRAY['Sport and Fitness']
WHERE name = 'Sport & Fitness';

UPDATE career_sectors SET
  description = 'Scotland''s hospitality and tourism industry welcomes millions of visitors every year. From hotels and restaurants to festivals and visitor attractions — these careers are about creating memorable experiences.',
  example_jobs = ARRAY['Hotel Manager','Chef','Restaurant Manager','Event Coordinator','Tour Guide','Travel Agent','Barista','Sommelier','Visitor Attraction Manager','Conference Organiser'],
  salary_range_entry = 'GBP 18,000 - GBP 22,000',
  salary_range_experienced = 'GBP 28,000 - GBP 45,000',
  growth_outlook = 'Recovering and growing — Scotland''s tourism sector is expanding with increasing international visitor numbers.',
  course_subject_areas = ARRAY['Travel and Tourism']
WHERE name = 'Hospitality & Tourism';

UPDATE career_sectors SET
  description = 'Builders, electricians, plumbers, and joiners create and maintain the buildings and infrastructure we all depend on. These are skilled, hands-on careers with strong earning potential and high demand.',
  example_jobs = ARRAY['Electrician','Plumber','Joiner','Bricklayer','Painter & Decorator','Roofer','Plasterer','Site Manager','Quantity Surveyor','Building Inspector'],
  salary_range_entry = 'GBP 20,000 - GBP 26,000',
  salary_range_experienced = 'GBP 32,000 - GBP 50,000+',
  growth_outlook = 'Strong growth — Scotland''s housing and infrastructure programmes are creating sustained demand for skilled tradespeople.',
  course_subject_areas = ARRAY['Architecture','Engineering']
WHERE name = 'Construction & Trades';

UPDATE career_sectors SET
  description = 'Civil servants, politicians, policy advisers, and public service workers run the institutions that serve Scottish communities — from local councils to the Scottish Government.',
  example_jobs = ARRAY['Civil Servant','Policy Adviser','Council Officer','Firefighter','Armed Forces','Diplomat','Town Planner','Environmental Health Officer','Trading Standards Officer','Benefits Adviser'],
  salary_range_entry = 'GBP 22,000 - GBP 28,000',
  salary_range_experienced = 'GBP 35,000 - GBP 60,000',
  growth_outlook = 'Stable — the Scottish Government and local authorities are major employers with consistent recruitment.',
  course_subject_areas = ARRAY['Politics','History','Geography']
WHERE name = 'Public Services & Government';

UPDATE career_sectors SET
  description = 'Farmers, conservationists, and environmental scientists work with Scotland''s land, seas, and wildlife. With growing concerns about climate change, these careers are becoming increasingly important.',
  example_jobs = ARRAY['Farmer','Gamekeeper','Forestry Worker','Marine Biologist','Environmental Consultant','Conservation Officer','Veterinary Surgeon','Agricultural Scientist','Ecologist','Renewable Energy Technician'],
  salary_range_entry = 'GBP 20,000 - GBP 26,000',
  salary_range_experienced = 'GBP 30,000 - GBP 50,000',
  growth_outlook = 'Growing — Scotland''s commitment to net zero and rewilding is creating new roles in conservation and renewable energy.',
  course_subject_areas = ARRAY['Environmental Science','Marine Science','Geology','Biological Sciences']
WHERE name = 'Agriculture & Environment';

UPDATE career_sectors SET
  description = 'Actors, musicians, dancers, and technicians create live and recorded entertainment. Scotland has a world-famous arts scene, especially during the Edinburgh Festival season.',
  example_jobs = ARRAY['Actor','Musician','Dancer','Theatre Director','Sound Technician','Lighting Designer','Stage Manager','Choreographer','Music Producer','Arts Administrator'],
  salary_range_entry = 'GBP 16,000 - GBP 22,000 (highly variable — many freelance)',
  salary_range_experienced = 'GBP 25,000 - GBP 50,000+',
  growth_outlook = 'Stable — Scotland''s festivals and cultural sector provide consistent opportunities, though many roles are freelance or seasonal.',
  course_subject_areas = ARRAY['Performing Arts','Music']
WHERE name = 'Performing Arts & Entertainment';
