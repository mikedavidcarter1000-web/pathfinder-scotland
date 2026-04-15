-- ============================================
-- Seed: Scottish Curriculum Subject Pathway Data
-- Migration: 20260410000003
-- Feature: Populate subjects, progressions, career sectors,
--          subject↔career mappings, and course choice rules
-- ============================================
-- Seeds the master reference data that powers the subject
-- choice and pathway planning features. Subjects cover the
-- breadth of SQA qualifications commonly delivered across
-- Scottish secondary schools (N3/N4/N5/Higher/Advanced Higher),
-- plus NPAs and Academy/enrichment options.
-- ============================================

BEGIN;

-- ============================================
-- PART 0: RESET DEPENDENT TABLES
-- ============================================
-- course_choice_rules were seeded with placeholder data in the
-- create-tables migration. Replace with the user-specified rules
-- modelled on the Royal High School structure.
DELETE FROM subject_career_sectors;
DELETE FROM subject_progressions;
DELETE FROM subjects;
DELETE FROM career_sectors;
DELETE FROM course_choice_rules;

-- ============================================
-- PART 1: SUBJECTS
-- ============================================
-- Each row references curricular_areas by name via a subquery
-- so seeding is independent of UUID values.
-- assessment_type gives a student-facing summary.
-- skills_tags enable pathway matching in the app.

-- -----------------------------------------------------
-- Languages
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'English',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of literature, language and communication. Develops reading, writing, talking and listening skills across a wide range of texts including novels, poetry, drama, non-fiction and media.',
  'English is a core subject required for almost all post-school pathways, including university, college, apprenticeships and employment. Most universities require a minimum of Higher English for entry.',
  'Exam and coursework (portfolio + assignment)',
  true, true, true, true, true,
  false, false,
  ARRAY['research','analysis','communication','critical-thinking'],
  'school'
),
(
  'ESOL',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'English for Speakers of Other Languages: structured English language development for students whose first language is not English.',
  'Builds the English reading, writing, listening and speaking skills needed for life, study and work in Scotland, and provides a recognised qualification alternative to English.',
  'Exam and coursework',
  true, true, true, true, false,
  false, false,
  ARRAY['communication','critical-thinking'],
  'school'
),
(
  'French',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of French language and Francophone culture through reading, writing, talking and listening activities.',
  'Modern languages open doors to careers in business, travel, translation, diplomacy and the creative industries, and are highly valued by universities.',
  'Exam and coursework',
  true, true, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking','analysis'],
  'school'
),
(
  'Spanish',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of Spanish language and Hispanic culture across Spain and Latin America.',
  'Spanish is one of the world''s most spoken languages. Useful for careers in business, tourism, international relations and translation.',
  'Exam and coursework',
  true, true, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking','analysis'],
  'school'
),
(
  'German',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of German language and German-speaking cultures through reading, writing, talking and listening.',
  'German is the most widely spoken first language in the EU. Strong for careers in engineering, science, business and academia.',
  'Exam and coursework',
  true, true, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking','analysis'],
  'school'
),
(
  'Mandarin',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of Mandarin Chinese (Simplified characters and Pinyin) and Chinese culture.',
  'Mandarin is the most spoken language in the world. Highly valued in international business, trade and diplomacy.',
  'Exam and coursework',
  false, true, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking'],
  'school'
),
(
  'Italian',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of Italian language and culture through reading, writing, talking and listening.',
  'Italian supports careers in fashion, art, design, music, food and travel, and connects with European history and culture.',
  'Exam and coursework',
  false, false, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking'],
  'school'
),
(
  'Gaelic (Learners)',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of Scottish Gaelic language and culture for students learning Gaelic as a second language.',
  'Gaelic is a unique part of Scotland''s heritage. Useful for careers in broadcasting, teaching, tourism and cultural industries.',
  'Exam and coursework',
  false, true, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking'],
  'school'
),
(
  'Gàidhlig',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of Gàidhlig for fluent speakers, typically students in Gaelic Medium Education. Literature, composition and cultural study.',
  'The fluent-speaker route supports Gaelic-speaking careers in media, education, arts and public services.',
  'Exam and coursework',
  false, false, true, true, true,
  false, false,
  ARRAY['communication','research','critical-thinking','analysis'],
  'school'
),
(
  'BSL (British Sign Language)',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Learn to communicate in British Sign Language with the Deaf community through practical signing tasks.',
  'BSL is a recognised language in Scotland. Useful for careers in education, healthcare, social work and interpreting.',
  'Practical and coursework',
  false, true, true, false, false,
  false, false,
  ARRAY['communication','practical'],
  'school'
),
(
  'Languages for Life and Work Award',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Practical language and communication skills for the workplace. Focuses on employability-linked tasks.',
  'Useful for students wanting to apply language learning in practical, work-related contexts.',
  'Coursework only',
  false, true, false, false, false,
  false, false,
  ARRAY['communication','practical','teamwork'],
  'school'
),
(
  'Latin',
  (SELECT id FROM curricular_areas WHERE name = 'Languages'),
  'Study of the Latin language and Roman literature. Develops understanding of grammar, translation and ancient Roman culture.',
  'Highly regarded by universities, particularly for Law, Medicine, Classics and Modern Languages. Builds vocabulary and analytical skills.',
  'Exam and coursework',
  false, false, true, true, true,
  false, true,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
);

-- -----------------------------------------------------
-- Mathematics
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Mathematics',
  (SELECT id FROM curricular_areas WHERE name = 'Mathematics'),
  'Study of numerical, algebraic, geometric, trigonometric and statistical concepts. Builds abstract reasoning and problem-solving skills.',
  'Mathematics is required for almost all STEM, finance, computing and engineering pathways, and is a university entry requirement for many courses.',
  'Exam (externally marked)',
  true, true, true, true, true,
  false, false,
  ARRAY['numeracy','problem-solving','critical-thinking','analysis'],
  'school'
),
(
  'Applications of Mathematics',
  (SELECT id FROM curricular_areas WHERE name = 'Mathematics'),
  'Practical mathematics applied to everyday and work contexts: managing money, statistics, measurement, geometry and numeracy for life.',
  'Strengthens the practical maths skills needed for work, training and everyday life. A good option alongside or instead of Mathematics for students focused on vocational pathways.',
  'Exam and coursework',
  true, true, true, true, false,
  false, false,
  ARRAY['numeracy','problem-solving','practical','analysis'],
  'school'
);

-- -----------------------------------------------------
-- Sciences
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Biology',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Study of living organisms: cells, DNA, genetics, inheritance, ecosystems, physiology and evolution.',
  'Essential for medicine, dentistry, veterinary, nursing, biomedical science, ecology and a wide range of healthcare careers.',
  'Exam and assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['scientific-method','research','analysis','problem-solving'],
  'school'
),
(
  'Human Biology',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'In-depth study of human anatomy, physiology, genetics, reproduction, neurobiology and health.',
  'Strong choice for medicine, nursing, physiotherapy, sports science and allied health professions. Commonly taken in S5 without a National 5 predecessor.',
  'Exam and assignment',
  false, false, false, true, false,
  false, false,
  ARRAY['scientific-method','research','analysis','critical-thinking'],
  'school'
),
(
  'Chemistry',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Study of matter, reactions, bonding, energetics and chemical analysis. Includes significant practical laboratory work.',
  'Essential for medicine, dentistry, pharmacy, chemical engineering and materials science. Required by most medical schools.',
  'Exam and assignment (practical)',
  true, true, true, true, true,
  false, false,
  ARRAY['scientific-method','numeracy','analysis','problem-solving','practical'],
  'school'
),
(
  'Physics',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Study of matter, energy, forces, waves, electricity, particles and the universe. Applies mathematics to explain physical phenomena.',
  'Essential for engineering, architecture, physics, astronomy and many STEM degrees. Strongly supports maths-heavy pathways.',
  'Exam and assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['scientific-method','numeracy','problem-solving','critical-thinking','analysis'],
  'school'
),
(
  'Environmental Science',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Interdisciplinary study of earth systems, ecology, sustainability, climate change and the use of natural resources.',
  'Relevant for careers in environmental management, conservation, renewable energy and sustainability policy. Commonly taken as a Higher without a formal National 5 predecessor.',
  'Exam and assignment',
  false, false, false, true, false,
  false, false,
  ARRAY['scientific-method','research','analysis','critical-thinking'],
  'school'
),
(
  'Laboratory Science',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Develops practical laboratory skills and scientific method across biology, chemistry and physics. Focus on accurate experimental work.',
  'A vocational science route for students interested in working as lab technicians or entering apprenticeships in the science industries.',
  'Practical and assignment',
  false, true, true, true, false,
  false, false,
  ARRAY['scientific-method','practical','analysis','problem-solving'],
  'school'
),
(
  'Applied Science',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Science applied to real-world and industrial contexts. Combines elements of biology, chemistry and physics with practical work.',
  'Broad practical science option for students who want a hands-on route into science and technology careers.',
  'Practical and assignment',
  false, true, true, false, false,
  false, false,
  ARRAY['scientific-method','practical','problem-solving','teamwork'],
  'school'
),
(
  'Young STEM Leader',
  (SELECT id FROM curricular_areas WHERE name = 'Sciences'),
  'Plan and deliver STEM activities to younger pupils, peers and the community. Develops leadership and communication through STEM engagement.',
  'Builds leadership, communication and project management skills, evidence valuable for STEM university applications and apprenticeships.',
  'Portfolio and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['leadership','scientific-method','communication','teamwork'],
  'school'
);

-- -----------------------------------------------------
-- Social Studies
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Geography',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of physical and human environments, landscapes, populations, global issues and fieldwork skills.',
  'Excellent for careers in planning, environmental management, surveying, travel and international development. Valued for combining science and humanities skills.',
  'Exam and assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'History',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of Scottish, British, European and world history. Develops source analysis and interpretation skills.',
  'Strong choice for Law, Politics, Journalism, Teaching and any career requiring research and analytical writing.',
  'Exam and assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'Modern Studies',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of politics, society, international issues and contemporary affairs affecting Scotland and the world.',
  'Excellent for careers in politics, law, policy, social work and journalism. Strong link to civic engagement and current affairs.',
  'Exam and assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'Classical Studies',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of the culture, politics, philosophy and literature of ancient Greece and Rome.',
  'Well regarded by universities for humanities courses. Builds critical thinking and appreciation of how ancient ideas shape the modern world.',
  'Exam and assignment',
  false, true, true, true, true,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'Economics',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of how individuals, businesses and governments make decisions about resources, markets, money and economic policy.',
  'Valuable for careers in finance, accountancy, business, banking and public policy. Combines numeracy with critical analysis.',
  'Exam and assignment',
  false, false, true, true, true,
  false, false,
  ARRAY['numeracy','analysis','critical-thinking','research'],
  'school'
),
(
  'Politics',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of political systems, ideas, parties and government in the UK and globally.',
  'Useful for careers in government, policy, journalism, international relations and law. Commonly taken as a Higher in S5 without a National 5 predecessor.',
  'Exam and assignment',
  false, false, false, true, true,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'Psychology',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Scientific study of human behaviour, cognition, mental processes and research methods.',
  'Excellent preparation for Psychology degrees, social work, teaching, human resources and healthcare. Commonly taken as a Higher in S5/S6 as a crash subject.',
  'Exam and assignment',
  false, false, false, true, true,
  false, false,
  ARRAY['research','analysis','scientific-method','critical-thinking'],
  'school'
),
(
  'Philosophy',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Exploration of fundamental questions about knowledge, reality, ethics, mind and argument.',
  'Sharpens reasoning and argument skills prized by Law, Medicine and Humanities admissions. Commonly taken as a Higher in S5/S6 as a crash subject.',
  'Exam and assignment',
  false, false, false, true, false,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'Sociology',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of human society, social institutions, culture, inequality and social change.',
  'Relevant for careers in social work, teaching, criminal justice, policy and community development. Commonly taken as a Higher as a crash subject.',
  'Exam and assignment',
  false, false, false, true, false,
  false, false,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'People and Society',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Explore how people interact with their community and society through group and individual tasks.',
  'Builds communication and research skills. A supportive entry point to Social Studies for students working towards National 4.',
  'Coursework only',
  false, true, false, false, false,
  false, false,
  ARRAY['research','communication','critical-thinking'],
  'school'
),
(
  'Business Management',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of how businesses are organised, managed and marketed, including finance, operations, human resources and enterprise.',
  'Useful for careers in business, marketing, HR, entrepreneurship and management. Provides practical commercial knowledge.',
  'Exam and assignment',
  false, true, true, true, true,
  false, false,
  ARRAY['analysis','communication','numeracy','teamwork','leadership'],
  'school'
),
(
  'Criminology',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Study of crime, criminal behaviour, victims, the justice system and responses to crime.',
  'Excellent preparation for Law, Criminology, Policing and Social Sciences at university. Develops analytical and critical thinking skills.',
  'Coursework',
  false, false, true, false, false,
  true, true,
  ARRAY['research','analysis','critical-thinking','communication'],
  'school'
),
(
  'Travel and Tourism',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'NPA covering customer service, destinations, travel planning and the tourism industry in Scotland and worldwide.',
  'Strong for careers in travel, hospitality, events and customer service roles.',
  'Coursework',
  false, false, true, false, false,
  true, false,
  ARRAY['communication','practical','teamwork','research'],
  'school'
),
(
  'Journalism',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'NPA exploring news values, writing, editing and producing journalism across print, broadcast and digital platforms.',
  'Introduces skills needed for careers in journalism, PR, content creation and communications.',
  'Portfolio and coursework',
  false, false, true, false, false,
  true, false,
  ARRAY['research','communication','critical-thinking','digital'],
  'school'
),
(
  'Social Anthropology',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Compare and contrast human societies, cultures, beliefs and traditions across the world.',
  'Develops cross-cultural understanding and critical thinking. Valuable for International Relations, Development and Social Sciences.',
  'Coursework',
  false, false, false, false, false,
  false, true,
  ARRAY['research','critical-thinking','analysis','communication'],
  'school'
),
(
  'Scottish Studies',
  (SELECT id FROM curricular_areas WHERE name = 'Social Studies'),
  'Interdisciplinary study of Scottish history, culture, language, environment and identity.',
  'Deepens understanding of Scotland and links multiple subject areas. Supports any pathway rooted in Scottish culture and heritage.',
  'Coursework and portfolio',
  false, false, false, false, false,
  false, true,
  ARRAY['research','critical-thinking','communication'],
  'school'
);

-- -----------------------------------------------------
-- Religious and Moral Education
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Religious, Moral and Philosophical Studies (RMPS)',
  (SELECT id FROM curricular_areas WHERE name = 'Religious and Moral Education'),
  'Study of world religions, ethical issues and philosophical questions such as morality, belief and existence.',
  'Develops critical reasoning and empathy. Valued for courses in Law, Medicine, Social Work and Humanities.',
  'Exam and assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['research','critical-thinking','communication','analysis'],
  'school'
);

-- -----------------------------------------------------
-- Technologies
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Computing Science',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Study of programming, software development, databases, web design, computer systems and computational thinking.',
  'Essential for careers in software engineering, data science, cybersecurity, AI and computing research. Highly in demand.',
  'Exam and coursework',
  false, true, true, true, true,
  false, false,
  ARRAY['digital','problem-solving','analysis','critical-thinking'],
  'school'
),
(
  'Design and Manufacture',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Design and produce products using a range of materials, manufacturing techniques and CAD software.',
  'Strong route into product design, industrial design, engineering and manufacturing careers.',
  'Practical and project',
  true, true, true, true, false,
  false, false,
  ARRAY['practical','creativity','problem-solving','digital'],
  'school'
),
(
  'Engineering Science',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Apply scientific and mathematical principles to engineering systems, mechanics, electronics, control and energy.',
  'Essential for engineering pathways into mechanical, electrical, civil and aeronautical engineering degrees and apprenticeships.',
  'Exam and practical assignment',
  true, true, true, true, true,
  false, false,
  ARRAY['scientific-method','practical','problem-solving','numeracy'],
  'school'
),
(
  'Electronics',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Study of electronic systems, circuits, microcontrollers, and their practical applications.',
  'Highly relevant for electrical and electronic engineering, hardware design, and robotics.',
  'Exam and practical assignment',
  false, false, true, true, true,
  false, false,
  ARRAY['scientific-method','practical','problem-solving','numeracy','digital'],
  'school'
),
(
  'Graphic Communication',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Produce technical and creative graphics using CAD, illustration and design software.',
  'Useful for architecture, engineering, product design, marketing and graphic design careers.',
  'Practical and portfolio',
  true, true, true, true, true,
  false, false,
  ARRAY['creativity','practical','digital','communication'],
  'school'
),
(
  'Administration and IT',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Develop office, IT and business administration skills using industry-standard software.',
  'Builds the employability skills needed for administrative, business support and customer service roles.',
  'Exam and practical assignment',
  true, true, true, true, false,
  false, false,
  ARRAY['digital','communication','problem-solving','practical'],
  'school'
),
(
  'Practical Woodworking',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Design and create wooden products using hand tools, power tools and machinery.',
  'Useful for careers in joinery, carpentry, construction and furniture making, and great for hands-on learners.',
  'Practical',
  true, true, true, false, false,
  false, false,
  ARRAY['practical','creativity','problem-solving'],
  'school'
),
(
  'Practical Metalworking',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Design and create metal products using bench, fabrication and machine processes.',
  'Strong route into fabrication, welding, engineering and construction trades careers.',
  'Practical',
  true, true, true, false, false,
  false, false,
  ARRAY['practical','creativity','problem-solving'],
  'school'
),
(
  'Fashion and Textile Technology',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Design, develop and construct fashion and textile products using a range of techniques.',
  'Excellent for fashion design, textiles, costume and creative industry careers.',
  'Practical and assignment',
  false, true, true, true, false,
  false, false,
  ARRAY['creativity','practical','problem-solving'],
  'school'
),
(
  'Built Environment',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Introduction to careers in the built environment including construction, surveying, architecture and planning.',
  'A broad foundation for construction, civil engineering and architectural pathways.',
  'Coursework and project',
  false, false, true, false, false,
  false, false,
  ARRAY['practical','problem-solving','digital','analysis'],
  'school'
),
(
  'Cyber Security',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'NPA in cyber security: digital forensics, ethical hacking basics, network security and data protection.',
  'Growing career area. Relevant for computing, cybersecurity, digital forensics and IT support pathways.',
  'Coursework',
  false, false, true, true, false,
  true, false,
  ARRAY['digital','analysis','critical-thinking','problem-solving'],
  'school'
),
(
  'Digital Media',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'NPA in digital media: create content using digital tools including image, video, audio and web.',
  'Relevant for digital marketing, web design, media production and creative tech careers.',
  'Coursework',
  false, true, true, false, false,
  true, false,
  ARRAY['digital','creativity','practical','communication'],
  'school'
),
(
  'Data Science',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'NPA in Data Science: work with data, spreadsheets, basic statistics and visualisation tools.',
  'Growing area connecting maths, computing and real-world problem solving. Great for any analytical career path.',
  'Coursework',
  false, false, true, false, false,
  true, false,
  ARRAY['digital','numeracy','analysis','problem-solving'],
  'school'
),
(
  'Computer Games Development',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'NPA exploring the design and development of computer games, including programming, graphics and testing.',
  'Introduces skills for games development, software engineering and interactive media.',
  'Coursework',
  false, false, true, true, false,
  true, false,
  ARRAY['digital','creativity','problem-solving','critical-thinking'],
  'school'
),
(
  'Creative Thinking',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'NPA developing creative thinking techniques for problem solving, innovation and idea generation.',
  'Builds transferable creative and problem-solving skills useful across every career path.',
  'Coursework',
  false, true, true, false, false,
  true, false,
  ARRAY['creativity','problem-solving','teamwork','critical-thinking'],
  'school'
),
(
  'Enterprise and 3D Print Club',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Design and create 3D printed products, run enterprise projects and bring ideas to market.',
  'Hands-on introduction to design, digital manufacture and small business skills.',
  'Portfolio and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['creativity','digital','practical','problem-solving','leadership'],
  'school'
),
(
  'Cycle Maintenance',
  (SELECT id FROM curricular_areas WHERE name = 'Technologies'),
  'Learn to maintain, repair and build bikes in a practical workshop environment.',
  'Practical skill with real-life application. Useful for trade routes and sustainable transport interests.',
  'Practical',
  false, false, false, false, false,
  false, true,
  ARRAY['practical','problem-solving'],
  'school'
);

-- -----------------------------------------------------
-- Expressive Arts
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Art and Design',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Explore expressive and design work across painting, drawing, sculpture, printmaking and design, culminating in a portfolio.',
  'Essential for art school, architecture, design and illustration pathways. Builds strong creative and critical skills.',
  'Portfolio and practical',
  true, true, true, true, true,
  false, false,
  ARRAY['creativity','practical','critical-thinking','analysis'],
  'school'
),
(
  'Drama',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Perform, devise and evaluate drama. Explore texts, scripts and production skills.',
  'Excellent for performing arts, teaching, law and any career needing confident communication and teamwork.',
  'Performance and portfolio',
  true, true, true, true, true,
  false, false,
  ARRAY['performance','communication','creativity','teamwork'],
  'school'
),
(
  'Music',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Perform on two instruments (or instrument and voice), compose original music and study music theory and history.',
  'Builds towards music performance, composition, teaching and sound production careers. Develops discipline and creativity.',
  'Performance and composition',
  true, true, true, true, true,
  false, false,
  ARRAY['performance','creativity','practical','critical-thinking'],
  'school'
),
(
  'Music Technology',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Use digital audio workstations and studio equipment to record, produce and mix music.',
  'Relevant for sound engineering, music production, broadcasting and creative tech careers.',
  'Portfolio and practical',
  false, true, true, true, false,
  false, false,
  ARRAY['digital','creativity','practical','problem-solving'],
  'school'
),
(
  'Dance',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Study dance practice, performance and choreography across contemporary, jazz and other styles.',
  'Good foundation for dance, performing arts and movement-related careers, and an enjoyable way to improve fitness and expression.',
  'Performance and portfolio',
  false, false, true, true, false,
  false, false,
  ARRAY['performance','physical','creativity','teamwork'],
  'school'
),
(
  'Photography',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Develop photography skills across technical, creative and critical areas. Produce a portfolio of photographs.',
  'Builds visual and creative skills useful for art, design, media and journalism pathways.',
  'Portfolio and practical',
  false, false, true, true, false,
  true, false,
  ARRAY['creativity','digital','practical','critical-thinking'],
  'school'
),
(
  'Media Studies',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Analyse and produce media texts across TV, film, print and digital platforms. Study representation, audiences and industries.',
  'Strong for careers in media production, journalism, marketing, PR and screen industries.',
  'Exam and coursework',
  false, true, true, true, false,
  false, false,
  ARRAY['research','analysis','communication','critical-thinking','digital'],
  'school'
),
(
  'Film and Media',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'NPA in film and media production: planning, shooting and editing short films.',
  'Hands-on route into film, TV and content creation careers.',
  'Portfolio and coursework',
  false, false, true, false, false,
  true, false,
  ARRAY['creativity','digital','practical','critical-thinking'],
  'school'
),
(
  'Hair and Make Up Design',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'NPA in hair and make up design: practical styling, creative looks and industry standards.',
  'Relevant for careers in beauty, theatre, TV, film and fashion industries.',
  'Practical and portfolio',
  false, false, true, false, false,
  true, false,
  ARRAY['creativity','practical','communication'],
  'school'
),
(
  'Film and Screen',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Study film form, genre, directors and the film industry through screenings and critical discussion.',
  'Deepens appreciation of cinema as both an art form and industry. Supports Media, English and Creative pathways.',
  'Coursework',
  false, false, false, false, false,
  false, true,
  ARRAY['creativity','critical-thinking','digital','analysis'],
  'school'
),
(
  'Junk Kouture',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Design and create couture fashion from discarded materials as part of a national competition.',
  'Combines sustainability, creativity and teamwork in an exciting, high-profile project.',
  'Portfolio and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['creativity','teamwork','problem-solving','practical'],
  'school'
),
(
  'Musical Theatre',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Sing, dance and act in musical theatre, culminating in group performances.',
  'Combines three performance disciplines and builds stage confidence for performing arts routes.',
  'Performance and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['performance','creativity','teamwork','physical'],
  'school'
),
(
  'Jewellery Making',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Design and create jewellery pieces using a range of techniques, tools and materials.',
  'Hands-on craft option that pairs well with Art and Design and supports craft and design careers.',
  'Practical and portfolio',
  false, false, false, false, false,
  false, true,
  ARRAY['creativity','practical'],
  'school'
),
(
  'Experimenting in Art',
  (SELECT id FROM curricular_areas WHERE name = 'Expressive Arts'),
  'Explore new art media, techniques and creative processes in an experimental studio environment.',
  'Great for students who want to stretch their creativity outside the formal Art and Design syllabus.',
  'Portfolio and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['creativity','practical','critical-thinking'],
  'school'
);

-- -----------------------------------------------------
-- Health and Wellbeing
-- -----------------------------------------------------
INSERT INTO subjects (
  name, curricular_area_id, description, why_choose, assessment_type,
  is_available_n3, is_available_n4, is_available_n5, is_available_higher, is_available_adv_higher,
  is_npa, is_academy, skills_tags, typical_availability
) VALUES
(
  'Physical Education',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Perform, analyse and improve performance in a range of sports and physical activities. Study factors impacting performance.',
  'Essential for sports science, coaching, teaching and physiotherapy pathways. Develops practical and analytical skills.',
  'Performance and portfolio',
  false, true, true, true, true,
  false, false,
  ARRAY['physical','performance','analysis','teamwork'],
  'school'
),
(
  'Health and Food Technology',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Study nutrition, food science, consumer issues, health and food product development.',
  'Excellent for food science, nutrition, dietetics, hospitality and health careers.',
  'Exam and assignment',
  true, true, true, true, false,
  false, false,
  ARRAY['practical','analysis','creativity','scientific-method'],
  'school'
),
(
  'Practical Cookery',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Plan, prepare and cook a variety of dishes using safe food hygiene practices.',
  'Good for hospitality, catering and culinary careers, and useful life skills for all students.',
  'Practical',
  true, true, true, false, false,
  false, false,
  ARRAY['practical','creativity'],
  'school'
),
(
  'Hospitality: Practical Cake Craft',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Develop practical cake making and decoration skills for the hospitality and catering industries.',
  'Specialist option for students interested in baking, patisserie and the hospitality sector.',
  'Practical',
  false, true, true, false, false,
  false, false,
  ARRAY['practical','creativity'],
  'school'
),
(
  'Sport and Fitness',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'NPA in Sport and Fitness: practical performance, fitness training and basic coaching skills.',
  'Good introduction to sports coaching, fitness instruction and active leisure careers.',
  'Practical and coursework',
  false, false, true, false, false,
  true, false,
  ARRAY['physical','teamwork','leadership','practical'],
  'school'
),
(
  'Barista Skills',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'NPA in Barista Skills: coffee making, customer service and café operations.',
  'Practical employability skill relevant to hospitality and food service careers.',
  'Practical and coursework',
  false, true, true, false, false,
  true, false,
  ARRAY['practical','communication','teamwork'],
  'school'
),
(
  'Early Learning and Childcare',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'NPA in Early Learning and Childcare: child development, play and care practices.',
  'First step toward early years, childcare, teaching and social care careers.',
  'Coursework and placement',
  false, false, true, false, false,
  true, false,
  ARRAY['communication','teamwork','leadership','research'],
  'school'
),
(
  'Exercise and Fitness Leadership',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'NPA developing skills to plan and deliver exercise sessions for others.',
  'Practical route into personal training, fitness instruction and sports coaching.',
  'Coursework and practical',
  false, false, true, false, false,
  true, false,
  ARRAY['physical','leadership','teamwork','practical'],
  'school'
),
(
  'Sports Leadership',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'NPA developing leadership, officiating and coaching skills in sport.',
  'Supports coaching, PE teaching and sports development careers.',
  'Coursework and practical',
  false, false, true, false, false,
  true, false,
  ARRAY['physical','leadership','communication','teamwork'],
  'school'
),
(
  'Duke of Edinburgh Bronze Award',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Complete the Bronze DofE Award through volunteering, physical activity, skills development and an expedition.',
  'Builds leadership, teamwork and resilience valued by universities, employers and personal statements.',
  'Portfolio and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['teamwork','leadership','physical','practical'],
  'school'
),
(
  'Event Organisation',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Plan, promote and deliver school and community events.',
  'Great for students who enjoy project work, teamwork and taking the lead.',
  'Portfolio and practical',
  false, false, false, false, false,
  false, true,
  ARRAY['leadership','teamwork','communication','practical'],
  'school'
),
(
  'Netball Leadership and Umpiring',
  (SELECT id FROM curricular_areas WHERE name = 'Health and Wellbeing'),
  'Develop netball leadership, coaching and umpiring skills through practice and games.',
  'A practical leadership route for students who enjoy sport and want to develop coaching experience.',
  'Practical',
  false, false, false, false, false,
  false, true,
  ARRAY['physical','leadership','communication','teamwork'],
  'school'
);

-- ============================================
-- PART 2: SUBJECT PROGRESSIONS
-- ============================================
-- Standard progression rules:
--   BGE → N4/N5 : no formal grade (teacher judgement)
--   N4  → N5    : Pass at N4
--   N5  → Higher: min C, recommended B
--   H   → AH    : min C, recommended B
--
-- For each subject that exists at multiple levels, the same-subject
-- chain is inserted. Subjects that only exist at Higher (Human
-- Biology, Psychology, Philosophy, Politics, Sociology, Environmental
-- Science) do not get BGE / N5 progressions: a note explains why.
-- ============================================

-- Same-subject standard progression chain helper: for each subject
-- present at multiple levels, insert the appropriate links.
-- Values are keyed off subject name via subquery.

-- Subjects with full chain (BGE -> N4 -> N5 -> Higher -> AH)
-- English, Mathematics, Biology, Chemistry, Physics, Geography,
-- History, Modern Studies, Art and Design, Drama, Music,
-- Graphic Communication, Engineering Science, French, Spanish,
-- German, Classical Studies, RMPS, Computing Science (from N4),
-- Physical Education (from N4), Business Management (from N4)

-- BGE -> N5 (where N5 exists)
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'bge', 'n5', NULL, NULL, 'BGE to National 5: teacher assessment / recommendation; no formal grade required'
FROM subjects s
WHERE s.is_available_n5 = true
  AND s.is_academy = false
  AND s.name NOT IN (
    -- Higher-only crash subjects are excluded from BGE links
    'Human Biology','Psychology','Philosophy','Politics','Sociology','Environmental Science'
  );

-- BGE -> N4 (where N5 is NOT available but N4 is - e.g. BSL, Applied Science, Languages for Life and Work, People and Society, Practical Cookery only to N4)
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'bge', 'n4', NULL, NULL, 'BGE to National 4: teacher assessment; no formal grade required'
FROM subjects s
WHERE s.is_available_n4 = true
  AND s.is_available_n5 = false
  AND s.is_academy = false;

-- N3 -> N4 (where both N3 and N4 exist - typical for BGE-level support students)
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'n3', 'n4', 'Pass', 'Pass', 'N3 is an internally assessed step up to N4'
FROM subjects s
WHERE s.is_available_n3 = true
  AND s.is_available_n4 = true
  AND s.is_academy = false;

-- N4 -> N5 (where both exist)
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'n4', 'n5', 'Pass', 'Pass', 'A pass at N4 is required; schools may also look at class performance'
FROM subjects s
WHERE s.is_available_n4 = true
  AND s.is_available_n5 = true
  AND s.is_academy = false;

-- N5 -> Higher (where both exist)
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'n5', 'higher', 'C', 'B', 'Most schools require at least a C at N5; a B or A is strongly recommended for Higher success'
FROM subjects s
WHERE s.is_available_n5 = true
  AND s.is_available_higher = true
  AND s.is_academy = false;

-- Higher -> Advanced Higher (where both exist)
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'higher', 'adv_higher', 'C', 'B', 'At least a C at Higher is required; most schools prefer a B or A for Advanced Higher'
FROM subjects s
WHERE s.is_available_higher = true
  AND s.is_available_adv_higher = true
  AND s.is_academy = false;

-- Higher -> Advanced Higher for Higher-only crash subjects that DO have an Advanced Higher
-- (Psychology, Politics)
-- These are already captured in the Higher -> AH query above (filter only checks both flags),
-- but we add an explicit notes entry for the "crash into Higher" nature via NOTE at the Higher level.
-- Add a BGE -> Higher note for Higher-only entry subjects so the pathway graph still shows them.
INSERT INTO subject_progressions (from_subject_id, to_subject_id, from_level, to_level, min_grade, recommended_grade, notes)
SELECT s.id, s.id, 'bge', 'higher', NULL, 'Strong pass in related N5 subjects recommended',
  'Commonly taken as a ''crash Higher'' in S5/S6 without a formal National 5 predecessor; strong performance in related subjects is expected'
FROM subjects s
WHERE s.name IN ('Human Biology','Psychology','Philosophy','Politics','Sociology','Environmental Science');

-- ============================================
-- PART 3: CAREER SECTORS
-- ============================================

INSERT INTO career_sectors (name, description, display_order) VALUES
('Healthcare & Medicine',           'Doctors, nurses, dentists, pharmacists, paramedics, physiotherapists, mental health, biomedical science.', 1),
('Engineering & Manufacturing',     'Mechanical, civil, electrical, chemical and aerospace engineering; design, manufacturing and maintenance.', 2),
('Computing & Digital Technology',  'Software development, cybersecurity, data science, AI, web and cloud, digital product design.', 3),
('Science & Research',              'Laboratory science, physics, chemistry, biology, environmental research, academia.', 4),
('Law & Justice',                   'Solicitors, advocates, paralegals, criminology, policing, courts and justice.', 5),
('Education & Teaching',            'Primary and secondary teaching, early years, further and higher education, educational support.', 6),
('Business & Finance',              'Accountancy, banking, insurance, consulting, marketing, HR, entrepreneurship.', 7),
('Creative Arts & Design',          'Fine art, illustration, product design, architecture, fashion, graphic design, crafts.', 8),
('Media & Communications',          'Journalism, broadcasting, PR, publishing, digital content, social media, advertising.', 9),
('Social Work & Community',         'Social work, youth work, community development, charity sector, support services.', 10),
('Sport & Fitness',                 'Coaching, sports science, physical education, fitness instruction, outdoor activities.', 11),
('Hospitality & Tourism',           'Catering, hotels, travel, events, restaurants, leisure, tourism services.', 12),
('Construction & Trades',           'Joinery, plumbing, electrical, plastering, construction management, surveying.', 13),
('Public Services & Government',    'Civil service, local government, armed forces, fire and rescue, emergency services.', 14),
('Agriculture & Environment',       'Farming, forestry, conservation, renewable energy, environmental management, horticulture.', 15),
('Performing Arts & Entertainment', 'Acting, music, dance, theatre, TV and film production, stage management.', 16);

-- ============================================
-- PART 4: SUBJECT ↔ CAREER SECTOR MAPPINGS
-- ============================================
-- relevance values:
--   essential    = direct prerequisite or near-prerequisite
--   recommended  = strongly helpful / widely preferred
--   related      = supports skills used in the sector
-- Every subject is mapped to at least one sector.
-- ============================================

-- Helper macro pattern: (subject, sector, relevance) inserted via subqueries.

-- English: broad relevance across most sectors
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),           'recommended'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),                   'essential'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),            'essential'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'essential'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),              'recommended'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),    'recommended'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),          'recommended'),
((SELECT id FROM subjects WHERE name='English'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'recommended');

-- ESOL
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='ESOL'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'), 'recommended'),
((SELECT id FROM subjects WHERE name='ESOL'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),    'recommended'),
((SELECT id FROM subjects WHERE name='ESOL'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'related'),
((SELECT id FROM subjects WHERE name='ESOL'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'related');

-- French
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='French'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),     'recommended'),
((SELECT id FROM subjects WHERE name='French'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'recommended'),
((SELECT id FROM subjects WHERE name='French'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),  'recommended'),
((SELECT id FROM subjects WHERE name='French'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),   'recommended'),
((SELECT id FROM subjects WHERE name='French'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),          'related'),
((SELECT id FROM subjects WHERE name='French'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Spanish
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Spanish'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),     'recommended'),
((SELECT id FROM subjects WHERE name='Spanish'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'recommended'),
((SELECT id FROM subjects WHERE name='Spanish'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),  'recommended'),
((SELECT id FROM subjects WHERE name='Spanish'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),   'recommended'),
((SELECT id FROM subjects WHERE name='Spanish'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),          'related'),
((SELECT id FROM subjects WHERE name='Spanish'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- German
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='German'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),           'recommended'),
((SELECT id FROM subjects WHERE name='German'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),  'recommended'),
((SELECT id FROM subjects WHERE name='German'), (SELECT id FROM career_sectors WHERE name='Science & Research'),           'recommended'),
((SELECT id FROM subjects WHERE name='German'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),         'recommended'),
((SELECT id FROM subjects WHERE name='German'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),       'related');

-- Mandarin
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Mandarin'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),     'recommended'),
((SELECT id FROM subjects WHERE name='Mandarin'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'recommended'),
((SELECT id FROM subjects WHERE name='Mandarin'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),  'related'),
((SELECT id FROM subjects WHERE name='Mandarin'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),   'related');

-- Italian
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Italian'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),   'recommended'),
((SELECT id FROM subjects WHERE name='Italian'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),    'recommended'),
((SELECT id FROM subjects WHERE name='Italian'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'related'),
((SELECT id FROM subjects WHERE name='Italian'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),       'related');

-- Gaelic (Learners)
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Gaelic (Learners)'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'), 'recommended'),
((SELECT id FROM subjects WHERE name='Gaelic (Learners)'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related'),
((SELECT id FROM subjects WHERE name='Gaelic (Learners)'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Gàidhlig
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Gàidhlig'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),   'essential'),
((SELECT id FROM subjects WHERE name='Gàidhlig'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'recommended'),
((SELECT id FROM subjects WHERE name='Gàidhlig'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- BSL
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='BSL (British Sign Language)'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),    'recommended'),
((SELECT id FROM subjects WHERE name='BSL (British Sign Language)'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),   'recommended'),
((SELECT id FROM subjects WHERE name='BSL (British Sign Language)'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'), 'recommended'),
((SELECT id FROM subjects WHERE name='BSL (British Sign Language)'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Languages for Life and Work
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Languages for Life and Work Award'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),    'related'),
((SELECT id FROM subjects WHERE name='Languages for Life and Work Award'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'related');

-- Latin
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Latin'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),        'recommended'),
((SELECT id FROM subjects WHERE name='Latin'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'related'),
((SELECT id FROM subjects WHERE name='Latin'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'recommended'),
((SELECT id FROM subjects WHERE name='Latin'), (SELECT id FROM career_sectors WHERE name='Science & Research'),    'related');

-- Mathematics
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),    'essential'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'essential'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Science & Research'),             'essential'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),             'essential'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),          'recommended'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),          'recommended'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),           'recommended'),
((SELECT id FROM subjects WHERE name='Mathematics'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),   'recommended');

-- Applications of Mathematics
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Applications of Mathematics'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),     'recommended'),
((SELECT id FROM subjects WHERE name='Applications of Mathematics'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),        'recommended'),
((SELECT id FROM subjects WHERE name='Applications of Mathematics'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),     'related'),
((SELECT id FROM subjects WHERE name='Applications of Mathematics'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Biology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Biology'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),       'essential'),
((SELECT id FROM subjects WHERE name='Biology'), (SELECT id FROM career_sectors WHERE name='Science & Research'),          'essential'),
((SELECT id FROM subjects WHERE name='Biology'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),   'essential'),
((SELECT id FROM subjects WHERE name='Biology'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),             'recommended'),
((SELECT id FROM subjects WHERE name='Biology'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),        'related');

-- Human Biology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Human Biology'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'essential'),
((SELECT id FROM subjects WHERE name='Human Biology'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),       'essential'),
((SELECT id FROM subjects WHERE name='Human Biology'), (SELECT id FROM career_sectors WHERE name='Science & Research'),    'recommended'),
((SELECT id FROM subjects WHERE name='Human Biology'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'related');

-- Chemistry
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Chemistry'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),    'essential'),
((SELECT id FROM subjects WHERE name='Chemistry'), (SELECT id FROM career_sectors WHERE name='Science & Research'),       'essential'),
((SELECT id FROM subjects WHERE name='Chemistry'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'essential'),
((SELECT id FROM subjects WHERE name='Chemistry'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'), 'recommended'),
((SELECT id FROM subjects WHERE name='Chemistry'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),     'related');

-- Physics
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Physics'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),    'essential'),
((SELECT id FROM subjects WHERE name='Physics'), (SELECT id FROM career_sectors WHERE name='Science & Research'),             'essential'),
((SELECT id FROM subjects WHERE name='Physics'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'recommended'),
((SELECT id FROM subjects WHERE name='Physics'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),          'recommended'),
((SELECT id FROM subjects WHERE name='Physics'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),          'recommended'),
((SELECT id FROM subjects WHERE name='Physics'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),           'related');

-- Environmental Science
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Environmental Science'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'), 'essential'),
((SELECT id FROM subjects WHERE name='Environmental Science'), (SELECT id FROM career_sectors WHERE name='Science & Research'),        'recommended'),
((SELECT id FROM subjects WHERE name='Environmental Science'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related'),
((SELECT id FROM subjects WHERE name='Environmental Science'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'related');

-- Laboratory Science
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Laboratory Science'), (SELECT id FROM career_sectors WHERE name='Science & Research'),       'essential'),
((SELECT id FROM subjects WHERE name='Laboratory Science'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),    'recommended'),
((SELECT id FROM subjects WHERE name='Laboratory Science'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'recommended');

-- Applied Science
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Applied Science'), (SELECT id FROM career_sectors WHERE name='Science & Research'),           'recommended'),
((SELECT id FROM subjects WHERE name='Applied Science'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),  'recommended'),
((SELECT id FROM subjects WHERE name='Applied Science'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),    'related'),
((SELECT id FROM subjects WHERE name='Applied Science'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),        'related');

-- Young STEM Leader
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Young STEM Leader'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'recommended'),
((SELECT id FROM subjects WHERE name='Young STEM Leader'), (SELECT id FROM career_sectors WHERE name='Science & Research'),    'related'),
((SELECT id FROM subjects WHERE name='Young STEM Leader'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'related');

-- Geography
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Geography'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),    'essential'),
((SELECT id FROM subjects WHERE name='Geography'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'recommended'),
((SELECT id FROM subjects WHERE name='Geography'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),        'recommended'),
((SELECT id FROM subjects WHERE name='Geography'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),        'recommended'),
((SELECT id FROM subjects WHERE name='Geography'), (SELECT id FROM career_sectors WHERE name='Science & Research'),           'related'),
((SELECT id FROM subjects WHERE name='Geography'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),         'related');

-- History
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='History'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),                   'recommended'),
((SELECT id FROM subjects WHERE name='History'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),            'recommended'),
((SELECT id FROM subjects WHERE name='History'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'recommended'),
((SELECT id FROM subjects WHERE name='History'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),    'recommended'),
((SELECT id FROM subjects WHERE name='History'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),          'related'),
((SELECT id FROM subjects WHERE name='History'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),         'related');

-- Modern Studies
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Modern Studies'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),                   'recommended'),
((SELECT id FROM subjects WHERE name='Modern Studies'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),    'essential'),
((SELECT id FROM subjects WHERE name='Modern Studies'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),         'recommended'),
((SELECT id FROM subjects WHERE name='Modern Studies'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'recommended'),
((SELECT id FROM subjects WHERE name='Modern Studies'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),            'recommended');

-- Classical Studies
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Classical Studies'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'recommended'),
((SELECT id FROM subjects WHERE name='Classical Studies'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),         'related'),
((SELECT id FROM subjects WHERE name='Classical Studies'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related'),
((SELECT id FROM subjects WHERE name='Classical Studies'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'related');

-- Economics
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Economics'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),             'essential'),
((SELECT id FROM subjects WHERE name='Economics'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),   'recommended'),
((SELECT id FROM subjects WHERE name='Economics'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),      'related'),
((SELECT id FROM subjects WHERE name='Economics'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),                  'related');

-- Politics
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Politics'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),    'essential'),
((SELECT id FROM subjects WHERE name='Politics'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),                   'recommended'),
((SELECT id FROM subjects WHERE name='Politics'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'recommended'),
((SELECT id FROM subjects WHERE name='Politics'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),         'related');

-- Psychology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Psychology'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),     'recommended'),
((SELECT id FROM subjects WHERE name='Psychology'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),   'essential'),
((SELECT id FROM subjects WHERE name='Psychology'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),      'recommended'),
((SELECT id FROM subjects WHERE name='Psychology'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),             'related'),
((SELECT id FROM subjects WHERE name='Psychology'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),        'related'),
((SELECT id FROM subjects WHERE name='Psychology'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),           'related');

-- Philosophy
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Philosophy'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),             'recommended'),
((SELECT id FROM subjects WHERE name='Philosophy'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),      'recommended'),
((SELECT id FROM subjects WHERE name='Philosophy'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related'),
((SELECT id FROM subjects WHERE name='Philosophy'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),     'related');

-- Sociology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Sociology'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),    'essential'),
((SELECT id FROM subjects WHERE name='Sociology'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),       'recommended'),
((SELECT id FROM subjects WHERE name='Sociology'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),              'related'),
((SELECT id FROM subjects WHERE name='Sociology'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- People and Society
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='People and Society'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'), 'related'),
((SELECT id FROM subjects WHERE name='People and Society'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Business Management
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Business Management'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),        'essential'),
((SELECT id FROM subjects WHERE name='Business Management'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),     'recommended'),
((SELECT id FROM subjects WHERE name='Business Management'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),    'recommended'),
((SELECT id FROM subjects WHERE name='Business Management'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related'),
((SELECT id FROM subjects WHERE name='Business Management'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),    'related');

-- Criminology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Criminology'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),             'essential'),
((SELECT id FROM subjects WHERE name='Criminology'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'recommended'),
((SELECT id FROM subjects WHERE name='Criminology'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),   'recommended');

-- Travel and Tourism
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Travel and Tourism'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'essential'),
((SELECT id FROM subjects WHERE name='Travel and Tourism'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),    'related'),
((SELECT id FROM subjects WHERE name='Travel and Tourism'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related');

-- Journalism
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Journalism'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'essential'),
((SELECT id FROM subjects WHERE name='Journalism'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'related'),
((SELECT id FROM subjects WHERE name='Journalism'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Social Anthropology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Social Anthropology'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'), 'recommended'),
((SELECT id FROM subjects WHERE name='Social Anthropology'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),    'related'),
((SELECT id FROM subjects WHERE name='Social Anthropology'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Scottish Studies
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Scottish Studies'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),   'related'),
((SELECT id FROM subjects WHERE name='Scottish Studies'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),  'related'),
((SELECT id FROM subjects WHERE name='Scottish Studies'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related');

-- RMPS
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Religious, Moral and Philosophical Studies (RMPS)'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),    'recommended'),
((SELECT id FROM subjects WHERE name='Religious, Moral and Philosophical Studies (RMPS)'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'), 'recommended'),
((SELECT id FROM subjects WHERE name='Religious, Moral and Philosophical Studies (RMPS)'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),           'related'),
((SELECT id FROM subjects WHERE name='Religious, Moral and Philosophical Studies (RMPS)'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),   'related');

-- Computing Science
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Computing Science'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'essential'),
((SELECT id FROM subjects WHERE name='Computing Science'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),    'recommended'),
((SELECT id FROM subjects WHERE name='Computing Science'), (SELECT id FROM career_sectors WHERE name='Science & Research'),             'recommended'),
((SELECT id FROM subjects WHERE name='Computing Science'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),             'recommended'),
((SELECT id FROM subjects WHERE name='Computing Science'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),         'related');

-- Design and Manufacture
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Design and Manufacture'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'essential'),
((SELECT id FROM subjects WHERE name='Design and Manufacture'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),      'recommended'),
((SELECT id FROM subjects WHERE name='Design and Manufacture'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),       'recommended');

-- Engineering Science
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Engineering Science'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),    'essential'),
((SELECT id FROM subjects WHERE name='Engineering Science'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),          'recommended'),
((SELECT id FROM subjects WHERE name='Engineering Science'), (SELECT id FROM career_sectors WHERE name='Science & Research'),             'recommended'),
((SELECT id FROM subjects WHERE name='Engineering Science'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'related');

-- Electronics
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Electronics'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),    'essential'),
((SELECT id FROM subjects WHERE name='Electronics'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'essential');

-- Graphic Communication
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Graphic Communication'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),      'essential'),
((SELECT id FROM subjects WHERE name='Graphic Communication'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'recommended'),
((SELECT id FROM subjects WHERE name='Graphic Communication'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),       'recommended'),
((SELECT id FROM subjects WHERE name='Graphic Communication'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),      'recommended');

-- Administration and IT
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Administration and IT'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),             'recommended'),
((SELECT id FROM subjects WHERE name='Administration and IT'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),   'recommended'),
((SELECT id FROM subjects WHERE name='Administration and IT'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'related'),
((SELECT id FROM subjects WHERE name='Administration and IT'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),          'related');

-- Practical Woodworking
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Practical Woodworking'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),        'essential'),
((SELECT id FROM subjects WHERE name='Practical Woodworking'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),  'recommended'),
((SELECT id FROM subjects WHERE name='Practical Woodworking'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),       'related');

-- Practical Metalworking
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Practical Metalworking'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),        'essential'),
((SELECT id FROM subjects WHERE name='Practical Metalworking'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),  'essential'),
((SELECT id FROM subjects WHERE name='Practical Metalworking'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),       'related');

-- Fashion and Textile Technology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Fashion and Textile Technology'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),     'essential'),
((SELECT id FROM subjects WHERE name='Fashion and Textile Technology'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),     'related'),
((SELECT id FROM subjects WHERE name='Fashion and Textile Technology'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'related');

-- Built Environment
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Built Environment'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),       'essential'),
((SELECT id FROM subjects WHERE name='Built Environment'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'recommended'),
((SELECT id FROM subjects WHERE name='Built Environment'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Cyber Security
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Cyber Security'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'essential'),
((SELECT id FROM subjects WHERE name='Cyber Security'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'),   'recommended'),
((SELECT id FROM subjects WHERE name='Cyber Security'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),             'related');

-- Digital Media
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Digital Media'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),         'essential'),
((SELECT id FROM subjects WHERE name='Digital Media'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),         'recommended'),
((SELECT id FROM subjects WHERE name='Digital Media'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'related');

-- Data Science
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Data Science'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'essential'),
((SELECT id FROM subjects WHERE name='Data Science'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),             'recommended'),
((SELECT id FROM subjects WHERE name='Data Science'), (SELECT id FROM career_sectors WHERE name='Science & Research'),             'recommended');

-- Computer Games Development
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Computer Games Development'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'), 'essential'),
((SELECT id FROM subjects WHERE name='Computer Games Development'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),         'recommended'),
((SELECT id FROM subjects WHERE name='Computer Games Development'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),         'related');

-- Creative Thinking
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Creative Thinking'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),     'recommended'),
((SELECT id FROM subjects WHERE name='Creative Thinking'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),         'related'),
((SELECT id FROM subjects WHERE name='Creative Thinking'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),     'related');

-- Enterprise and 3D Print Club
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Enterprise and 3D Print Club'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'related'),
((SELECT id FROM subjects WHERE name='Enterprise and 3D Print Club'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),      'related'),
((SELECT id FROM subjects WHERE name='Enterprise and 3D Print Club'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),          'related');

-- Cycle Maintenance
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Cycle Maintenance'), (SELECT id FROM career_sectors WHERE name='Construction & Trades'),       'related'),
((SELECT id FROM subjects WHERE name='Cycle Maintenance'), (SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'), 'related');

-- Art and Design
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Art and Design'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'essential'),
((SELECT id FROM subjects WHERE name='Art and Design'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'recommended'),
((SELECT id FROM subjects WHERE name='Art and Design'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),   'related'),
((SELECT id FROM subjects WHERE name='Art and Design'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'related');

-- Drama
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Drama'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'essential'),
((SELECT id FROM subjects WHERE name='Drama'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'recommended'),
((SELECT id FROM subjects WHERE name='Drama'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),            'related'),
((SELECT id FROM subjects WHERE name='Drama'), (SELECT id FROM career_sectors WHERE name='Law & Justice'),                   'related');

-- Music
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Music'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'essential'),
((SELECT id FROM subjects WHERE name='Music'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),            'recommended'),
((SELECT id FROM subjects WHERE name='Music'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'related'),
((SELECT id FROM subjects WHERE name='Music'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),          'related');

-- Music Technology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Music Technology'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'recommended'),
((SELECT id FROM subjects WHERE name='Music Technology'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'recommended'),
((SELECT id FROM subjects WHERE name='Music Technology'), (SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),  'related'),
((SELECT id FROM subjects WHERE name='Music Technology'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),          'related');

-- Dance
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Dance'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'essential'),
((SELECT id FROM subjects WHERE name='Dance'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),                 'recommended'),
((SELECT id FROM subjects WHERE name='Dance'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),            'related');

-- Photography
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Photography'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),  'essential'),
((SELECT id FROM subjects WHERE name='Photography'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),  'recommended'),
((SELECT id FROM subjects WHERE name='Photography'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'related');

-- Media Studies
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Media Studies'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'essential'),
((SELECT id FROM subjects WHERE name='Media Studies'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),          'recommended'),
((SELECT id FROM subjects WHERE name='Media Studies'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'recommended'),
((SELECT id FROM subjects WHERE name='Media Studies'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),              'related');

-- Film and Media
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Film and Media'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'essential'),
((SELECT id FROM subjects WHERE name='Film and Media'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'recommended'),
((SELECT id FROM subjects WHERE name='Film and Media'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'related');

-- Hair and Make Up Design
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Hair and Make Up Design'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'essential'),
((SELECT id FROM subjects WHERE name='Hair and Make Up Design'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'recommended'),
((SELECT id FROM subjects WHERE name='Hair and Make Up Design'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related');

-- Film and Screen
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Film and Screen'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'recommended'),
((SELECT id FROM subjects WHERE name='Film and Screen'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'related'),
((SELECT id FROM subjects WHERE name='Film and Screen'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'related');

-- Junk Kouture
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Junk Kouture'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),    'related'),
((SELECT id FROM subjects WHERE name='Junk Kouture'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'), 'related');

-- Musical Theatre
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Musical Theatre'), (SELECT id FROM career_sectors WHERE name='Performing Arts & Entertainment'), 'essential'),
((SELECT id FROM subjects WHERE name='Musical Theatre'), (SELECT id FROM career_sectors WHERE name='Media & Communications'),          'related');

-- Jewellery Making
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Jewellery Making'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'related');

-- Experimenting in Art
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Experimenting in Art'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'recommended'),
((SELECT id FROM subjects WHERE name='Experimenting in Art'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related');

-- Physical Education
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Physical Education'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),          'essential'),
((SELECT id FROM subjects WHERE name='Physical Education'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),    'recommended'),
((SELECT id FROM subjects WHERE name='Physical Education'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),     'recommended'),
((SELECT id FROM subjects WHERE name='Physical Education'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Health and Food Technology
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Health and Food Technology'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'recommended'),
((SELECT id FROM subjects WHERE name='Health and Food Technology'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'recommended'),
((SELECT id FROM subjects WHERE name='Health and Food Technology'), (SELECT id FROM career_sectors WHERE name='Science & Research'),    'related'),
((SELECT id FROM subjects WHERE name='Health and Food Technology'), (SELECT id FROM career_sectors WHERE name='Agriculture & Environment'), 'related');

-- Practical Cookery
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Practical Cookery'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'essential'),
((SELECT id FROM subjects WHERE name='Practical Cookery'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'related');

-- Hospitality: Practical Cake Craft
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Hospitality: Practical Cake Craft'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'essential'),
((SELECT id FROM subjects WHERE name='Hospitality: Practical Cake Craft'), (SELECT id FROM career_sectors WHERE name='Creative Arts & Design'), 'related');

-- Sport and Fitness
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Sport and Fitness'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'), 'essential'),
((SELECT id FROM subjects WHERE name='Sport and Fitness'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'), 'recommended'),
((SELECT id FROM subjects WHERE name='Sport and Fitness'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'related');

-- Barista Skills
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Barista Skills'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'essential'),
((SELECT id FROM subjects WHERE name='Barista Skills'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),    'related');

-- Early Learning and Childcare
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Early Learning and Childcare'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),    'essential'),
((SELECT id FROM subjects WHERE name='Early Learning and Childcare'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'), 'recommended'),
((SELECT id FROM subjects WHERE name='Early Learning and Childcare'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),   'related');

-- Exercise and Fitness Leadership
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Exercise and Fitness Leadership'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),       'essential'),
((SELECT id FROM subjects WHERE name='Exercise and Fitness Leadership'), (SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'), 'related'),
((SELECT id FROM subjects WHERE name='Exercise and Fitness Leadership'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'related');

-- Sports Leadership
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Sports Leadership'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),       'essential'),
((SELECT id FROM subjects WHERE name='Sports Leadership'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'recommended'),
((SELECT id FROM subjects WHERE name='Sports Leadership'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related');

-- Duke of Edinburgh Bronze Award
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Duke of Edinburgh Bronze Award'), (SELECT id FROM career_sectors WHERE name='Public Services & Government'), 'related'),
((SELECT id FROM subjects WHERE name='Duke of Edinburgh Bronze Award'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),              'related'),
((SELECT id FROM subjects WHERE name='Duke of Edinburgh Bronze Award'), (SELECT id FROM career_sectors WHERE name='Social Work & Community'),      'related');

-- Event Organisation
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Event Organisation'), (SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'), 'recommended'),
((SELECT id FROM subjects WHERE name='Event Organisation'), (SELECT id FROM career_sectors WHERE name='Business & Finance'),    'related'),
((SELECT id FROM subjects WHERE name='Event Organisation'), (SELECT id FROM career_sectors WHERE name='Media & Communications'), 'related');

-- Netball Leadership and Umpiring
INSERT INTO subject_career_sectors (subject_id, career_sector_id, relevance) VALUES
((SELECT id FROM subjects WHERE name='Netball Leadership and Umpiring'), (SELECT id FROM career_sectors WHERE name='Sport & Fitness'),       'recommended'),
((SELECT id FROM subjects WHERE name='Netball Leadership and Umpiring'), (SELECT id FROM career_sectors WHERE name='Education & Teaching'),  'related');

-- ============================================
-- PART 5: COURSE CHOICE RULES
-- ============================================
-- Replace the placeholder rules seeded in the create-tables
-- migration with detailed, RHS-style generic rules that reflect
-- the typical Edinburgh model including Academy/elective choices.
-- ============================================

INSERT INTO course_choice_rules (
  transition, total_subjects, compulsory_subjects, num_free_choices, num_reserves,
  non_examined_core, breadth_requirements, special_rules, is_generic
) VALUES
(
  's2_to_s3',
  8,
  ARRAY['English','Mathematics'],
  6,
  1,
  ARRAY['Physical Education','Personal & Social Education','Religious & Moral Education'],
  'Strongly recommended to choose from a wide range of curricular areas including Modern Languages, Expressive Arts, Sciences, Social Studies, and Technologies',
  ARRAY[
    'Students also choose 1 Academy/elective option ranked from 3 choices',
    'Not all Academy options will run — depends on numbers and staffing'
  ],
  true
),
(
  's3_to_s4',
  7,
  ARRAY['English','Mathematics'],
  5,
  1,
  ARRAY['Physical Education','Personal & Social Education','Religious & Moral Education'],
  'Recommended to maintain breadth across curricular areas',
  ARRAY[
    'Column-based timetabling may prevent some subject combinations',
    'Priority given to students who ranked oversubscribed subjects higher'
  ],
  true
),
(
  's4_to_s5',
  5,
  ARRAY[]::text[],
  5,
  1,
  ARRAY['Physical Education','Personal & Social Education'],
  NULL,
  ARRAY[
    'Students typically take 3-5 Highers plus any remaining N5s',
    'A/B at N5 recommended for Higher progression',
    'Crash Highers generally discouraged in S5',
    'Foundation Apprenticeships count as 1 of the 5 choices and run over 2 years',
    'N5 English or Maths timetabled for 6 periods if taken in S5'
  ],
  true
),
(
  's5_to_s6',
  4,
  ARRAY[]::text[],
  4,
  1,
  ARRAY[]::text[],
  NULL,
  ARRAY[
    'Minimum 4 subjects or 3 Advanced Highers with study periods',
    'A or B at Higher recommended for Advanced Higher',
    'Foundation Apprenticeships count as 2 choices',
    'AH Art & Design counts as 2 choices for portfolio/project',
    'College partnership courses available Tuesday/Thursday afternoons',
    'Crash Highers and new Highers commonly taken alongside Advanced Highers',
    'Scottish Baccalaureate requires 2 AH + 1 H from same discipline plus Interdisciplinary Project'
  ],
  true
);

COMMIT;
