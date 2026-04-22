-- ============================================
-- Seed: per-role AI impact ratings (career_roles)
-- Migration: 20260412000002
--
-- Seeds 165 career roles across 15 sectors with 1-10 AI impact ratings
-- drawn directly from the research document "AI and the Future of
-- Careers: A Guide for Scottish School Leavers" (April 2026).
-- Each row carries the exact ai_rating and the "What changes" text
-- from the sector tables in the document. Salary bands mirror the
-- sector-level ranges on career_sectors.
--
-- is_new_ai_role = true flags roles listed under "New AI roles emerging"
-- in the research document. These are growth/emerging roles and are
-- rated 1 (near the safe end of the 1-10 scale) unless the document
-- gave them a specific rating elsewhere.
--
-- Note on totals: the research doc lists some emerging roles (e.g.
-- "Learning Technologist", "AI/ML Engineer") that also appear as
-- existing rows in the same sector's main table. Because
-- career_roles.(career_sector_id, title) is UNIQUE we keep one row per
-- title and mark is_new_ai_role = true on the overlap rows. This yields
-- 165 unique rows, slightly below the naive 167 in the research doc.
-- ============================================

BEGIN;

-- Helper: delete any prior seed rows so re-running this migration is safe.
DELETE FROM career_role_subjects;
DELETE FROM career_roles;

-- ============================================
-- HEALTHCARE & MEDICINE (6 existing + 6 new AI = 12)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Healthcare Assistant / Care Worker', 2,
 'AI automates care notes and monitoring alerts, but washing, feeding, mobility support, and companionship are irreplaceable. Strong demand growth due to ageing population.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', false,
 'Strong demand growth due to ageing population'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Nurse', 3,
 'AI handles admin (scheduling, notes, bed management) and supports clinical decisions. Patient advocacy, complex care, and emotional support remain human. Nursing projected to grow 45%+ by 2032.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', false,
 'Projected to grow 45%+ by 2032'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Physiotherapist / Paramedic', 2,
 'Primarily hands-on roles in unpredictable environments. AI may assist with exercise programme design and outcome tracking. Very low automation risk.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', false,
 'Very low automation risk — stable demand'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Pharmacist', 4,
 'Dispensing checks and drug interaction screening are automated. Role shifts toward clinical pharmacy, medication reviews, and patient counselling. Digital medicines roles emerging.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', false,
 'Shifting toward clinical pharmacy and digital medicines'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Radiographer', 5,
 'Most AI-impacted clinical role — algorithms already analyse mammograms and CT scans. But radiographers still operate equipment, position patients, and make judgment calls. Role evolves toward AI-assisted interpretation.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', false,
 'Role evolving toward AI-assisted interpretation'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Doctor / GP', 4,
 'AI-powered triage handles initial contact; clinical decision support aids diagnosis; admin automation saves time. Complex multi-morbidity, ethical decisions, and patient relationships remain human.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', false,
 'Stable demand with AI augmentation'),

-- New AI roles (healthcare)
((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Clinical Informatician', 1,
 'Specialist translating clinical practice into digital systems and AI tools. Emerging role in NHS digital transformation, combining clinical knowledge with informatics.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', true,
 'Emerging growth role in NHS digital transformation'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Chief Nursing Information Officer (CNIO)', 1,
 'Senior nursing leader directing the integration of AI and digital technology in patient care. A new leadership position appearing across NHS trusts.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', true,
 'New senior leadership role in NHS digital transformation'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Digital Medicines Specialist', 1,
 'Pharmacy professional overseeing AI-enabled prescribing, digital therapeutics, and medication management systems. Growth role in NHS pharmacy.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', true,
 'Emerging in NHS pharmacy services'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Health Data Scientist', 1,
 'Analyses patient and population data to inform clinical decisions and health policy. High demand in NHS Scotland and the Scottish life sciences sector.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', true,
 'High demand across NHS Scotland and life sciences'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'AI Healthcare Data Analyst', 1,
 'Develops, validates, and monitors AI models used in diagnostics and health analytics. Combines clinical knowledge with data science skills.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', true,
 'Emerging as AI diagnostics expand'),

((SELECT id FROM career_sectors WHERE name='Healthcare & Medicine'),
 'Clinical AI Safety Specialist', 1,
 'Ensures AI tools used in healthcare are safe, accurate, and clinically validated. New regulatory-adjacent role appearing as AI adoption accelerates.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 90,000+', true,
 'New regulatory-adjacent role');

-- ============================================
-- EDUCATION & TEACHING (5 existing + 3 new AI = 8; Learning Technologist flagged as emerging)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Nursery Practitioner / Childcare Worker', 1,
 'Almost entirely physical and interpersonal work with young children. AI may assist with record-keeping apps. One of the most automation-resistant roles in the entire economy. Growing demand.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', false,
 'Growing demand — highly automation-resistant'),

((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Teaching Assistant', 2,
 'AI tools may help create differentiated learning materials. Supporting individual pupils, managing behaviour, and providing emotional support are fundamentally human.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', false,
 'Stable — human support roles protected'),

((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Teacher (Primary/Secondary)', 3,
 'AI drafts lesson plans, automates some marking, generates resources, and personalises learning pathways. Mentoring, inspiring, and adapting to classroom dynamics remain irreplaceable. Teaching has a ~19% automation risk — among the lowest of any profession.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', false,
 'Growing — Scotland faces teacher shortages, especially in STEM'),

((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Educational Psychologist', 2,
 'Assessment, therapeutic intervention, and multi-agency work with children require deep human expertise. AI may assist with data analysis for screenings.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', false,
 'Stable — deep human expertise required'),

((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Learning Technologist', 2,
 'A growing role — schools increasingly need staff who evaluate, implement, and train colleagues on AI tools. This career pathway is expanding, not contracting.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', true,
 'Growing — direct response to AI adoption in schools'),

-- New AI roles (education)
((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'AI Literacy Curriculum Developer', 1,
 'Designs curricula and teaching materials that build AI literacy in pupils and staff. Emerging role as schools respond to AI in daily learning.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', true,
 'Emerging role in curriculum design'),

((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Digital Learning Designer', 1,
 'Creates digital and AI-augmented learning experiences for schools, colleges, and universities. Blends pedagogy with technology.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', true,
 'Growing demand as online and hybrid learning expand'),

((SELECT id FROM career_sectors WHERE name='Education & Teaching'),
 'Online / AI-Assisted Tutoring Coordinator', 1,
 'Coordinates online and AI-assisted tutoring programmes, ensuring quality and supporting learners through the tools. An emerging support role in Scottish education.',
 'GBP 23,000 - GBP 28,000 (probationer teacher GBP 32,000)', 'GBP 40,000 - GBP 55,000', true,
 'Emerging role as AI tutoring expands');

-- ============================================
-- LAW & JUSTICE (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Legal Secretary', 7,
 'Diary management, correspondence, transcription, and document formatting are highly automatable. Role likely to shrink significantly or merge with legal technology coordinator functions over 5-10 years.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', false,
 'Shrinking — significant automation expected over 5-10 years'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Paralegal', 7,
 'Document review, basic research, and routine drafting will be heavily automated. Oxford research gave paralegals a 94% task computerisation probability. Role evolves toward AI tool operation, quality assurance, and more analytical work.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', false,
 'Transforming — role evolving toward AI oversight and analysis'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Court Clerk', 4,
 'Administrative aspects are automatable but the in-court procedural role requires human judgment and presence. Moderate pressure.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', false,
 'Stable — in-court presence protected'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Solicitor (Junior/Trainee)', 6,
 'Entry-level tasks (document review, research, basic drafting) are exactly what AI handles well. Some firms may hire fewer juniors. Counter-argument: juniors will do more substantive work faster. Career still viable but the entry pathway is changing.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', false,
 'Changing entry pathway — fewer routine roles'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Solicitor (Senior) / Partner', 4,
 'High-level advisory, client relationships, strategy, and complex advocacy remain irreplaceable. AI dramatically increases productivity. Partners who refuse to adopt AI may become uncompetitive.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', false,
 'Stable — AI boosts productivity for partners'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Barrister', 3,
 'Courtroom advocacy, cross-examination, and oral argumentation are deeply human. AI speeds case preparation but barristers must rigorously verify AI outputs (hallucinated case citations are a known danger).',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', false,
 'Stable — core courtroom work remains human'),

-- New AI roles (law)
((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Legal Technologist', 1,
 'Designs, deploys, and manages legal technology and AI tools within law firms. Combines legal knowledge with software and data skills.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', true,
 'Emerging role — high demand from law firms'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Legal AI Product Manager', 1,
 'Leads the development of AI-powered legal products and services, coordinating lawyers, engineers, and clients. A growing legal-tech role.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', true,
 'Growing legal-tech product management role'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'AI Compliance / Ethics Specialist', 1,
 'Advises law firms and clients on AI compliance, risk, and ethical questions. Emerging as AI regulation expands.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', true,
 'Emerging — regulatory growth role'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'Legal Data Analyst', 1,
 'Uses AI and data analysis to extract insight from legal documents, case histories, and regulatory data. Growth role in large law firms.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', true,
 'Growing legal-data role'),

((SELECT id FROM career_sectors WHERE name='Law & Justice'),
 'LawTech Consultant', 1,
 'Advises law firms on AI and digital transformation strategy, helping them select and implement the right tools.',
 'GBP 22,000 - GBP 28,000', 'GBP 40,000 - GBP 80,000+', true,
 'Emerging legal-tech consulting role');

-- ============================================
-- BUSINESS & FINANCE (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Bookkeeper / Payroll Clerk', 8,
 'Among the fastest-declining occupations globally. AI automates data entry, reconciliation, invoicing, and standard payroll. Remaining roles shift to exceptions management.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', false,
 'Declining — fastest-falling occupation globally'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Bank Clerk / Cashier', 8,
 'Digital banking, AI-driven kiosks, and app-based transactions are replacing many in-branch roles. Branch networks continue to shrink across Scotland.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', false,
 'Declining — branch networks shrinking in Scotland'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Accountant (Qualified)', 5,
 'Routine compliance, reconciliation, and reporting will be automated. Role transforms into "business coach" — advisory services, strategic planning, and interpreting AI-generated insights. 78% of accountants view this shift positively.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', false,
 'Transforming — advisory/strategy work in high demand'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Financial Adviser', 3,
 'Robo-advisors handle simple portfolio rebalancing, but complex financial planning, life event navigation, and trust-building require human expertise. Emotional intelligence valued over technical skills by 72% of hiring managers.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', false,
 'Stable — emotional intelligence increasingly valued'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Actuary', 4,
 'AI accelerates data modelling and risk calculations. Value lies in interpreting models, understanding assumptions, and communicating complex risk. Demand stable.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', false,
 'Stable demand — interpretation and communication valued'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Insurance Underwriter', 6,
 'AI automates risk assessment and pricing for standard products. Complex and novel risks still require human judgment. Entry-level positions expected to reduce.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', false,
 'Shrinking entry level, stable at senior level'),

-- New AI roles (finance)
((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'AI-Savvy Financial Analyst', 1,
 'Combines traditional financial analysis with AI tools for modelling, scenario analysis, and forecasting. A growth role commanding premium salaries.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', true,
 'Growth role — premium salaries for AI-skilled analysts'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Financial AI Compliance Specialist', 1,
 'Ensures AI tools used in finance comply with regulation and ethical standards. Emerging as UK financial regulation catches up with AI.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', true,
 'Emerging — FCA and wider regulatory focus'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Data Governance Manager (Finance)', 1,
 'Oversees how financial data is collected, stored, and used by AI systems. Ensures accuracy, privacy, and regulatory compliance.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', true,
 'Growing — data governance demands rising fast'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'FinTech Product Manager', 1,
 'Leads product development for AI-driven financial technology products. Combines finance, UX, and data skills.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', true,
 'Strong growth — Edinburgh fintech cluster expanding'),

((SELECT id FROM career_sectors WHERE name='Business & Finance'),
 'Forensic AI Auditor', 1,
 'Audits AI systems used in finance to detect fraud, bias, and errors. A new specialist career combining accounting and data science.',
 'GBP 22,000 - GBP 30,000', 'GBP 40,000 - GBP 75,000', true,
 'Emerging — high demand as AI finance auditing matures');

-- ============================================
-- ENGINEERING & MANUFACTURING (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Maintenance Engineer', 2,
 'AI enables predictive maintenance through sensor data analysis, but physical repair, in-situ diagnosis, and emergency response remain firmly human. Growing demand due to ageing workforce.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', false,
 'Growing — ageing workforce pushing demand up'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Manufacturing Technician', 3,
 'Physical nature of work limits automation. Role evolving to include digital literacy and AI tool operation. Critical shortage of workers in this category.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', false,
 'Critical shortage — high demand'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Mechanical Engineer', 3,
 'AI assists with documentation and simulations, but core design work, hands-on problem-solving, and on-site oversight remain human. Employment projected to grow.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', false,
 'Growing employment projected'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Electrical Engineer', 3,
 'AI helps with circuit simulation and compliance checking. Field work, custom system design, and safety-critical decisions need human expertise. Projected 9% employment growth through 2033.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', false,
 'Projected 9% employment growth through 2033'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Quality Control Inspector', 5,
 'Automated sensors and ML systems detect anomalies faster than humans. Role shifting from manual inspection to overseeing automated QC systems and handling complex cases.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', false,
 'Shifting toward automated QC oversight'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'CNC Operator / Programmer', 5,
 'AI already assists with toolpath optimisation and programming (AI applicability score of 0.44). Machine setup, troubleshooting, and quality judgment remain human. Role evolving to "CNC technician + AI operator".',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', false,
 'Evolving — CNC + AI operator hybrid'),

-- New AI roles (engineering)
((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Robotics Technician', 1,
 'Installs, maintains, and repairs robotic systems in manufacturing and construction. A direct growth role from the National Robotarium at Heriot-Watt.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', true,
 'Growing — Scotland investing heavily in robotics'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Digital Manufacturing Engineer', 1,
 'Designs and operates smart factory systems integrating AI, IoT, and robotics. A rapidly expanding hybrid role.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', true,
 'Expanding — smart factories growing'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'AI Quality Systems Analyst', 1,
 'Develops and maintains AI-driven quality control and anomaly detection systems for manufacturing lines.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', true,
 'Emerging — direct response to automated QC'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Predictive Maintenance Analyst', 1,
 'Uses AI and sensor data to predict equipment failure before it happens. A growth specialism across industries with physical assets.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', true,
 'Growing — predictive maintenance a key AI application'),

((SELECT id FROM career_sectors WHERE name='Engineering & Manufacturing'),
 'Smart Factory Coordinator', 1,
 'Coordinates digital and physical workflows inside smart factories, linking robotics, AI systems, and human operators.',
 'GBP 24,000 - GBP 30,000', 'GBP 38,000 - GBP 65,000', true,
 'Emerging — smart factories require orchestration');

-- ============================================
-- CONSTRUCTION & TRADES (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Bricklayer', 1,
 'Highly physical, site-specific work. Robotic bricklaying exists but is limited to simple, repetitive walls. Custom work, renovations, and non-standard builds require human skill. Ongoing skills shortage.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', false,
 'Strong — ongoing skills shortage'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Electrician', 2,
 'Requires fine manual dexterity, problem-solving in unique environments, and safety-critical judgment. 71% already use AI for business admin. Core trade work is essentially automation-proof. High demand.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', false,
 'High demand — automation-proof core work'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Plumber', 2,
 'Complex physical work in tight, variable spaces with strong customer relationships. AI handles admin paperwork. Core work is unautomatable with current or near-term technology.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', false,
 'High demand — automation-proof core work'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Joiner / Carpenter', 2,
 'Bespoke, customised work requiring adaptive thinking and craftsmanship. Each project is unique. AI may assist with design software, but hands-on work is safe.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', false,
 'Strong — craftsmanship remains human'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Site Manager', 3,
 'AI assists with scheduling, risk assessment, and documentation. Leadership, site-specific decision-making, and people management are irreplaceable. Growing role.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', false,
 'Growing — AI augments site management'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Quantity Surveyor', 5,
 'Significant portions of work involve calculations, cost estimation, and documentation that AI can assist with. Negotiation, client relationships, and judgment on complex projects remain human.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', false,
 'Stable — routine work automated, judgment remains human'),

-- New AI roles (construction)
((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Construction Technology Specialist', 1,
 'Implements BIM, digital twins, drones, and AI systems on construction projects. A growth role across major UK infrastructure programmes.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', true,
 'Growing — major UK infrastructure programmes'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'BIM / Digital Twin Manager', 1,
 'Leads Building Information Modelling and digital-twin workflows on large-scale construction and infrastructure projects.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', true,
 'Growing specialism on large projects'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Drone Survey Operator', 1,
 'Uses drones to survey sites, monitor progress, and inspect structures. A growth role combining technology with site work.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', true,
 'Growing — drone surveying mainstream in major projects'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Smart Building Technician', 1,
 'Installs and maintains smart-building systems including AI-driven HVAC, lighting, and energy management.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', true,
 'Growing — smart buildings mainstream in new construction'),

((SELECT id FROM career_sectors WHERE name='Construction & Trades'),
 'Sustainability / Energy Modelling Analyst', 1,
 'Uses AI and simulation tools to model building energy, carbon, and sustainability performance. A net-zero growth role.',
 'GBP 20,000 - GBP 26,000', 'GBP 32,000 - GBP 50,000+', true,
 'Growing — Scotland net-zero targets drive demand');

-- ============================================
-- COMPUTING & DIGITAL TECHNOLOGY (6 existing + 7 new unique AI = 13; AI/ML Engineer flagged as emerging)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'AI / ML Engineer', 1,
 'One of the fastest-growing roles globally — 42% yearly growth in demand. Designing, training, and deploying AI models. This *is* the growth sector. High salaries.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 '42% yearly growth in demand — fastest-growing role globally'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'Cybersecurity Analyst', 3,
 'AI helps detect threats faster, but human judgment is essential for incident response, threat hunting, and policy. Demand growing strongly due to increasing cyber threats. Relatively safe.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', false,
 'Growing strongly — cyber threats rising'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'Senior Software Developer', 4,
 'AI augments productivity (55% faster task completion). Architects and senior engineers become "editors" who shape and verify AI-generated code. Demand stable or growing.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', false,
 'Stable to growing — senior engineers become AI editors'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'IT Support Technician', 5,
 'First-line support (password resets, common issues) increasingly automated by AI chatbots. Complex troubleshooting, physical hardware support, and user relations remain human.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', false,
 'Shrinking at first-line, stable at complex level'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'Data Analyst', 6,
 'AI automates routine data processing and basic analysis. Role evolving toward strategic insight, storytelling, and domain expertise. Those combining data skills with AI literacy thrive.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', false,
 'Evolving — strategic/storytelling analysts thrive'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'Junior Software Developer', 7,
 'The most impacted role in tech. Entry-level hiring down significantly. AI handles boilerplate code, simple bugs, and standard implementations. Remaining juniors need AI orchestration skills from day one. Career is still viable but the entry point has moved.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', false,
 'Declining — entry-level hiring at major tech firms down 25% from 2023'),

-- New AI roles (computing) — AI/ML Engineer already above
((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'Prompt Engineer', 1,
 'Designs and refines prompts for large language models to produce reliable, task-specific outputs. A new career specialism that did not exist before 2022.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'New specialism — strong demand since 2023'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'AI Ethics Officer', 1,
 'Advises organisations on responsible AI use, bias, fairness, and governance. Emerging senior role as AI regulation tightens.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'Emerging — regulation-driven growth'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'AI Product Manager', 1,
 'Leads AI-powered product development, translating user needs into AI features and coordinating engineering, data, and design teams.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'High demand across tech and scale-ups'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'AI Solutions Engineer', 1,
 'Client-facing engineer who helps customers implement AI tools and systems. Blends deep technical knowledge with communication skills.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'Growing — strong hiring from AI platform companies'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'AI Safety Researcher', 1,
 'Researches how to make AI systems safe, aligned, and reliable. The UK AI Security Institute is hiring across Scottish cities.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'High demand — UK AISI hiring in Scottish cities'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'AI Operations Engineer', 1,
 'Runs and maintains production AI systems, monitoring performance, cost, and reliability. A fast-growing ops discipline.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'Fast-growing — LLMOps and MLOps demand'),

((SELECT id FROM career_sectors WHERE name='Computing & Digital Technology'),
 'Data Engineer', 1,
 'Designs data pipelines that feed AI and analytics systems. Demand for AI fluency in data engineering has grown sevenfold in two years.',
 'GBP 25,000 - GBP 32,000', 'GBP 40,000 - GBP 75,000', true,
 'Very strong — 7x demand growth in 2 years');

-- ============================================
-- CREATIVE ARTS & DESIGN (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'UX Designer', 3,
 'Requires deep user empathy, research methodology, and understanding of human behaviour. AI assists with wireframing and prototyping, but core UX research and strategic design remain human. Growing demand.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', false,
 'Growing demand — human-centred roles valued'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'Photographer', 4,
 'AI-generated images threaten stock photography. Event, portrait, editorial, and commercial photography requiring human presence and creative judgment are safe. New opportunities in AI-assisted editing workflows.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', false,
 'Polarising — stock photo shrinking, bespoke photo stable'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'Video Editor', 4,
 'AI automates basic cuts, colour grading, and transcription. Narrative editing, creative storytelling, and complex post-production remain human. 70% of animators and video producers say AI does not threaten their job security.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', false,
 'Stable — complex editing protected'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'Graphic Designer', 6,
 'Routine work (social media templates, banner ads) is most threatened. Canva plus AI enables non-designers to create professional content. But bespoke brand design, art direction, and creative strategy remain human. Career evolving toward multi-disciplinary roles.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', false,
 'Shrinking routine roles, growing strategic/creative-direction roles'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'Journalist / Content Writer', 6,
 'AI produces basic news reports, SEO content, and summaries. Investigative journalism, interviews, editorial judgment, and local reporting are human. Entry-level writing roles face highest pressure.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', false,
 'Entry-level declining, investigative journalism stable'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'Marketing Content Creator', 6,
 'Routine content (social posts, email marketing, basic copy) increasingly AI-generated. Strategy, brand voice, audience understanding, and creative campaigns need humans. Role evolving to "AI-enhanced content strategist".',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', false,
 'Evolving toward AI-enhanced content strategy'),

-- New AI roles (creative)
((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'AI Creative Director', 1,
 'Senior creative who uses AI as a tool to drive concepts, campaigns, and brand strategy. An emerging senior role in agencies.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', true,
 'Emerging senior creative role'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'AI Content Strategist', 1,
 'Plans and executes AI-assisted content strategies across channels, balancing automation with human-authored work.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', true,
 'Growing — direct replacement for routine content roles'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'Prompt Artist / Designer', 1,
 'Specialises in generating and refining AI-produced visuals through skilled prompting and post-editing. A new creative career.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', true,
 'New creative specialism'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'AI Ethics and Copyright Specialist', 1,
 'Advises creative agencies and publishers on copyright, attribution, and ethical use of AI-generated content. A fast-emerging specialism.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', true,
 'Fast-emerging — copyright questions driving demand'),

((SELECT id FROM career_sectors WHERE name='Creative Arts & Design'),
 'CreaTech Specialist', 1,
 'Bridges creative disciplines and technology, building AI-augmented tools for creative studios.',
 'GBP 18,000 - GBP 24,000', 'GBP 30,000 - GBP 50,000', true,
 'Emerging — creative-tech hybrid role');

-- ============================================
-- RETAIL & CUSTOMER SERVICE (6 existing + 4 new AI = 10)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Visual Merchandiser', 3,
 'AI aids store layout optimisation and analytics, but creative spatial design, brand storytelling, and physical implementation remain human. Role augmented rather than replaced.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — creative spatial work protected'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Retail Manager', 4,
 'AI-powered scheduling, inventory management, and analytics reduce admin burden. Leadership, team management, and customer experience oversight remain human. Role evolves to focus more on people and less on data.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Evolving — more people focus, less admin'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Shop Assistant / Sales Associate', 5,
 'Self-checkouts and AI shelf analytics reduce some transactional roles. In-person customer service, physical merchandising, and store ambiance remain human. Gradual shift toward advisory and experience-focused roles.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Shrinking transactional, growing advisory'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'E-commerce Specialist', 6,
 '32% of marketing and e-commerce tasks already AI-exposed. AI excels at personalisation, analytics, and product discovery. Strategic thinking and creative campaigns remain human. Hybrid roles emerging.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Transforming — hybrid strategy roles emerging'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Supply Chain Coordinator', 6,
 'AI-driven demand forecasting, route optimisation, and inventory orchestration. Back-office automation yielding roughly 30% efficiency gains. Role shifting toward strategic oversight and exception handling.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Shifting toward strategic/exception roles'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Customer Service Advisor (Call Centre)', 7,
 'AI chatbots handle up to 80% of routine queries. Significant restructuring expected through 2028. Human agents retained for complex, emotional, or escalated issues. Entry-level call centre roles face highest pressure.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Declining — 80% of routine queries AI-handled by 2029'),

-- New AI roles (retail)
((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'AI-Assisted Customer Experience Manager', 1,
 'Designs and runs customer experience programmes that use AI for personalisation and service, while preserving the human touchpoints customers value most.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — retailers investing in CX leadership'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Retail Data / AI Analyst', 1,
 'Analyses retail data for pricing, stock, demand, and customer insight using AI and machine learning tools.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — retail data roles expanding'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'Chatbot / AI System Trainer', 1,
 'Trains, tunes, and monitors customer-service AI systems. A new role created by the shift to AI-first contact centres.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'New role — growing with chatbot adoption'),

((SELECT id FROM career_sectors WHERE name='Retail & Customer Service'),
 'E-commerce Personalisation Specialist', 1,
 'Uses AI recommendation systems and personalisation tools to improve e-commerce conversion and customer loyalty.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — personalisation a retail priority');

-- ============================================
-- HOSPITALITY & TOURISM (5 existing + 5 new AI = 10)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Chef', 2,
 'Creative cooking, taste judgment, menu development, and kitchen leadership are deeply human. AI assists with inventory ordering, nutritional analysis, and menu planning. Core skills remain in strong demand.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Strong demand — core skills remain human'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Events Coordinator', 3,
 'Complex human logistics, creative planning, and relationship management. AI assists with scheduling, vendor matching, and budget tracking. Core role well protected.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — core role protected'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Waiter / Waitress / Bar Staff', 3,
 'Service warmth, reading tables, and social interaction remain essential. Some ordering automation (tablet menus, QR codes) in casual dining. Human service especially valued in mid-to-high end venues.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — service warmth valued at quality venues'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Restaurant Manager', 4,
 'AI handles scheduling, analytics, waste reduction, and demand forecasting. Leadership, staff management, and guest relationships remain human. Role increasingly AI-augmented.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — AI augments management'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Hotel Receptionist', 6,
 'Self-check-in kiosks expanding; chatbots handling routine queries; overnight receptionist roles among first to be automated. Personalised welcome and complex problem-solving remain human. Significant reduction in routine reception roles expected by 2028-2030.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', false,
 'Shrinking — significant routine reduction by 2028-2030'),

-- New AI roles (hospitality)
((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Hospitality Technology Manager', 1,
 'Oversees property management, booking, and AI systems across hospitality venues. A growing operational role as hotels digitise.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — hotels digitising at pace'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Guest Experience Designer', 1,
 'Designs end-to-end guest journeys, blending AI personalisation with human touchpoints. Emerging at premium venues.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Emerging — premium venues leading adoption'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Revenue / Yield Analyst', 1,
 'Uses AI pricing and forecasting tools to maximise revenue for hotels and venues. A fast-growing analytical role.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Fast-growing — AI pricing adoption'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Digital Concierge Manager', 1,
 'Manages AI-powered concierge services including chatbots, voice assistants, and mobile guest apps.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Emerging — digital concierge going mainstream'),

((SELECT id FROM career_sectors WHERE name='Hospitality & Tourism'),
 'Sustainability / Waste Optimisation Specialist', 1,
 'Uses AI-driven analytics to cut food waste, energy, and carbon impact across hospitality operations.',
 'GBP 18,000 - GBP 22,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — sustainability a core priority');

-- ============================================
-- AGRICULTURE & ENVIRONMENT (6 existing + 6 new AI = 12)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Forestry Worker', 2,
 'Physical outdoor work in complex, unpredictable terrain. Drone monitoring assists but does not replace physical management. Very low automation risk.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', false,
 'Very low automation risk'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Landscape Manager', 2,
 'Creative design, physical work, and client relationships. AI assists with planning and visualisation tools. Minimal direct automation risk.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', false,
 'Minimal automation risk'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Farm Worker', 3,
 'Physical outdoor work in complex environments resists automation. Autonomous tractors and robotic harvesters are advancing but not replacing most workers. Labour shortages mean demand is rising, not falling.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', false,
 'Rising demand due to labour shortages'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Agricultural Technician', 3,
 'A role that is expanding and evolving rather than contracting. Growing demand for technicians who can operate precision agriculture equipment, drones, and sensors. Upskilling essential.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', false,
 'Expanding — precision agriculture demand'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Environmental Consultant', 3,
 'AI aids data analysis, modelling, and reporting. Fieldwork, regulatory knowledge, and stakeholder engagement remain human. Sector growing due to climate policy and Scotland''s renewable energy investment.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', false,
 'Growing — Scotland renewable energy and climate policy'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Ecologist', 3,
 'AI assists with species identification, habitat mapping, and data analysis. Fieldwork, ecological judgment, and research design remain human. Growing demand due to biodiversity policy.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', false,
 'Growing — biodiversity policy driving demand'),

-- New AI roles (agriculture)
((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Precision Agriculture Technologist', 1,
 'Operates and maintains precision agriculture systems including GPS, drones, smart livestock collars, and satellite crop analysis.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', true,
 'Growing — precision ag mainstream'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Agricultural Data Analyst', 1,
 'Turns farm sensor data into operational decisions for yield, livestock, and sustainability outcomes.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', true,
 'Growing — data-driven farming'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Drone Operator / Pilot', 1,
 'Operates drones for crop monitoring, livestock tracking, and environmental surveys. A growth specialism across rural Scotland.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', true,
 'Growing — drone monitoring standard practice'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Carbon Footprint / Sustainability Officer', 1,
 'Measures and reports carbon and sustainability metrics for farms, food producers, and environmental schemes.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', true,
 'Strong growth — net-zero reporting drives demand'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Environmental Data Scientist', 1,
 'Applies AI and machine learning to environmental data, from satellite imagery to biodiversity monitoring.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', true,
 'Growing — climate policy expands demand'),

((SELECT id FROM career_sectors WHERE name='Agriculture & Environment'),
 'Peatland Restoration Specialist', 1,
 'Plans and delivers peatland restoration projects, often using AI-aided mapping and monitoring. A direct response to Scotland''s net-zero targets.',
 'GBP 20,000 - GBP 26,000', 'GBP 30,000 - GBP 50,000', true,
 'Growing — Scotland peatland restoration programmes');

-- ============================================
-- PUBLIC SERVICES & GOVERNMENT (4 existing + 6 new AI = 10)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'Policy Analyst / Civil Servant (Fast Stream)', 4,
 'AI tools assist with policy research, data analysis, document summarisation, and drafting. Political judgment, stakeholder management, and strategic thinking remain human. Growing demand specifically for AI Policy Analyst roles.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Stable to growing — AI tools augment policy work'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'Council Officer / Benefits Officer', 5,
 'AI-powered chatbots handle routine citizen queries; automated systems process standard claims. Complex cases still require human judgment. Role shifts toward casework, exception handling, and digital inclusion support.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Shifting toward casework and exception handling'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'HR Administrator', 6,
 'Routine HR processing (payroll, absence tracking, basic recruitment screening) is being automated. Human aspects of HR — employee relations, complex grievances, workforce strategy — remain important, but fewer admin-focused roles needed.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Shrinking — fewer admin-focused roles needed'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'Administrative Assistant', 7,
 'Consistently identified as among the most at-risk roles across all major studies. Data entry, filing, correspondence, and diary management are highly automatable. IPPR and DSIT projections show Administrative and Secretarial jobs declining through 2035. Young people and women disproportionately affected.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Declining through 2035 per IPPR/DSIT'),

-- New AI roles (public services)
((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'Government Chief AI Officer', 1,
 'A newly created senior public-sector role leading AI adoption and policy within a government department or agency.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'New senior role across UK public sector'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'AI Policy Analyst', 1,
 'Researches and advises on AI policy, regulation, and governance. Actively recruited into the UK civil service.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Actively recruited into UK civil service'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'Public Sector AI Adoption Specialist', 1,
 'Helps councils and central government adopt AI tools responsibly and effectively.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Growing — public sector AI adoption accelerating'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'Digital Transformation Manager', 1,
 'Leads digital and AI transformation programmes in the public sector, combining technology, change management, and policy knowledge.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Strong growth — public sector priority'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'TechTrack Apprentice', 1,
 'New 2,000-place UK public-sector tech apprenticeship programme designed to bring digital and AI skills into government.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'New — 2,000 UK apprenticeship places'),

((SELECT id FROM career_sectors WHERE name='Public Services & Government'),
 'i.AI Prototyping Specialist', 1,
 'Works in central government''s i.AI team prototyping AI tools for public services.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Emerging — central government prototyping teams');

-- ============================================
-- SCIENCE & RESEARCH (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Bioinformatics Specialist', 1,
 'An emerging role combining biology and computing, essential for AI-driven drug discovery. High demand, premium salaries. Requires interdisciplinary skills. A growth career.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'High demand — premium salaries'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Research Scientist', 3,
 'AI accelerates data analysis, literature review, and simulation. Cannot replace hypothesis generation, experimental design, or scientific creativity. Demand growing.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Growing demand'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Environmental Scientist', 3,
 'AI aids climate modelling and environmental monitoring. Field judgment, policy interpretation, and stakeholder engagement remain human. Growing demand due to Scotland''s renewable energy sector.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Growing — Scotland renewables'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Clinical Researcher', 3,
 'AI streamlines trial data analysis and patient matching. Human oversight, ethical judgment, patient interaction, and regulatory compliance remain essential.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Stable — AI augments trial work'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Data Scientist', 3,
 'Paradoxically, AI automates some routine analysis while creating massive demand for those who build, deploy, and validate AI models. One of the top in-demand roles with salary premiums for AI skills.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Top in-demand role — salary premiums for AI skills'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Lab Technician', 5,
 'Routine testing, sample preparation, and data collection increasingly automated by robotics and AI. Role shifting toward overseeing automated systems. Entry-level positions face most pressure, but complex lab work remains human.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', false,
 'Shifting toward automated-system oversight'),

-- New AI roles (science)
((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'AI Drug Discovery Scientist', 1,
 'Uses AI models to accelerate drug discovery, target identification, and molecule design. A direct growth role from the $20bn AI drug discovery market.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Strong growth — $20bn market by 2030'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Computational Scientist', 1,
 'Applies high-performance computing and AI to scientific problems, often working with supercomputers like ARCHER2.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Growing — Scotland ARCHER2 and UK Supercomputing Centre'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Laboratory Automation Specialist', 1,
 'Designs and maintains automated lab workflows combining robotics, AI, and data systems. Replaces some routine technician work while creating skilled roles.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Growing — lab automation expansion'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'AI Safety Researcher (Scientific)', 1,
 'Researches safety and reliability of AI systems in scientific and clinical contexts. The UK AI Security Institute is hiring across Scottish cities.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Strong demand — UK AISI hiring'),

((SELECT id FROM career_sectors WHERE name='Science & Research'),
 'Robotics Integration Engineer', 1,
 'Integrates robotic hardware with AI control systems in research labs and industrial settings.',
 'GBP 22,000 - GBP 28,000', 'GBP 35,000 - GBP 60,000', true,
 'Growing — research and industrial robotics expansion');

-- ============================================
-- SPORT & FITNESS (6 existing + 5 new AI = 11)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Outdoor Activities Instructor', 1,
 'Physical presence, safety judgment, group dynamics, and outdoor environment management cannot be replicated remotely or by AI. Growing demand for outdoor and wellbeing experiences.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', false,
 'Growing — outdoor and wellbeing demand'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Sports Coach', 2,
 'AI aids performance analysis, video review, and tactical planning. Coaching relationships, motivation, and real-time adaptive decisions remain deeply human. Demand growing.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', false,
 'Demand growing'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Sports Therapist', 2,
 'Hands-on treatment, clinical judgment, and patient rapport. AI aids with diagnosis support and treatment planning. Core role well protected.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — hands-on role protected'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'PE Teacher', 2,
 'Teaching, safeguarding, relationship-building, and physical demonstration. AI aids lesson planning and student tracking. Protected by regulation and the human-centric nature of education.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — protected by regulation'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Fitness Instructor / Personal Trainer', 3,
 'AI apps offer cheap workout plans, but accountability, form correction, motivation, and human connection are irreplaceable. Trainers who adopt AI tools will thrive. Market may polarise between budget AI solutions and premium human coaching.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', false,
 'Polarising — premium human coaching valued'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Leisure Centre Manager', 4,
 'AI assists with scheduling, membership analytics, energy management, and marketing. People management and facility oversight remain human. Administrative burden reduces.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', false,
 'Stable — admin burden reducing'),

-- New AI roles (sport)
((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Sports Data Analyst', 1,
 'Uses AI and data tools to analyse performance, tactics, and injury risk for teams and athletes. A fast-growing specialism in professional sport.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', true,
 'Fast-growing — professional sport embraces analytics'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Digital Fitness Content Creator', 1,
 'Creates fitness content for digital platforms, often combining AI-assisted programming with personal coaching.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — digital fitness market expanding'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'Wearable Technology Specialist', 1,
 'Advises athletes, clubs, and consumers on AI-enabled wearables for performance and health tracking.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — wearables mainstream in sport'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'AI-Enhanced Performance Coach', 1,
 'Combines traditional coaching expertise with AI tools for performance analysis and personalised training plans.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', true,
 'Growing — AI-skilled coaches outperform peers'),

((SELECT id FROM career_sectors WHERE name='Sport & Fitness'),
 'E-sports / Gaming Coach', 1,
 'Coaches players and teams in professional gaming, including tactical review and mental performance work. A new growth field.',
 'GBP 18,000 - GBP 24,000', 'GBP 28,000 - GBP 45,000', true,
 'New growth field — professional gaming expansion');

-- ============================================
-- TRANSPORT & LOGISTICS (6 existing + 7 new AI = 13)
-- ============================================
INSERT INTO career_roles (career_sector_id, title, ai_rating, ai_description, salary_entry, salary_experienced, is_new_ai_role, growth_outlook) VALUES
((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Train Driver', 2,
 'Heavily regulated, safety-critical, and unionised profession. Autonomous trains exist in closed systems (e.g. DLR) but open-network autonomy is far off. Protected for 15+ years.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', false,
 'Protected for 15+ years'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'HGV Driver', 3,
 'Massive current shortage means demand far exceeds supply. Autonomous HGV technology unlikely to be mainstream on UK roads before 2050. AI used for safety assistance (fatigue alerts, route optimisation). Average salary rising to GBP 44,000 due to shortages. Safe career choice for 15-20+ years.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', false,
 'Very strong — shortage of 40,000-60,000 drivers; average salary ~GBP 44,000'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Delivery Driver', 4,
 'Autonomous small-delivery robots tested in some UK areas; drone delivery limited. Last-mile delivery in complex environments resists full automation. Customer interaction at doorstep remains important. Some disruption possible in 7-10 years for simple routes.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', false,
 'Some disruption possible in 7-10 years'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Traffic Planner', 4,
 'AI transforms traffic modelling, congestion prediction, and infrastructure planning. Policy decisions, stakeholder engagement, and complex urban planning remain human. Increasingly AI-augmented.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', false,
 'Increasingly AI-augmented'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Logistics Coordinator', 6,
 'AI excels at route optimisation, demand forecasting, and supply chain management. Complex decision-making, supplier relationships, and crisis management remain human. Substantial augmentation happening now.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', false,
 'Transforming — substantial AI augmentation now'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Warehouse Operative', 7,
 'The fastest-changing role in transport and logistics. Goods-to-person robotics, autonomous mobile robots, and automated picking are accelerating rapidly. Roles shifting from manual picking and sorting to supervisory and maintenance functions. Significant transformation expected by 2030.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', false,
 'Significant transformation expected by 2030'),

-- New AI roles (transport)
((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'AV Fleet Operations Manager', 1,
 'Manages fleets of autonomous and semi-autonomous vehicles, covering dispatch, safety, maintenance, and regulatory compliance.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'Emerging — UK AV Act 2024 legal framework'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Remote Vehicle Operator', 1,
 'Remotely supervises or controls autonomous vehicles when human intervention is required. A new profession created by AV deployment.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'New profession — created by AV deployment'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Warehouse Automation / Robotics Engineer', 1,
 'Designs, installs, and maintains robotic warehouse systems. A direct growth role from the 9.5% annual warehouse automation expansion.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'Strong growth — warehouse automation expanding 9.5% annually'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'AI Logistics Analyst', 1,
 'Uses AI tools to optimise routing, scheduling, and supply chain decisions across logistics networks.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'Growing — AI core to modern logistics'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Drone Delivery Operator', 1,
 'Operates drone delivery services for small packages in urban and rural settings where pilots are permitted.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'Emerging — drone delivery trials expanding'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'EV / AV Maintenance Technician', 1,
 'Maintains and repairs electric and autonomous vehicles, requiring new training in batteries, sensors, and onboard AI systems.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'Growing — EV uptake and AV pilots expanding'),

((SELECT id FROM career_sectors WHERE name='Transport & Logistics'),
 'Digital Supply Chain Manager', 1,
 'Runs AI-enabled supply chains end to end, from supplier data to last-mile visibility.',
 'GBP 22,000 - GBP 32,000', 'GBP 35,000 - GBP 55,000', true,
 'Growing — supply-chain digitalisation accelerating');

-- ============================================
-- Verify totals
-- ============================================
DO $$
DECLARE
  total_roles  INT;
  new_roles    INT;
  min_per_sec  INT;
  max_per_sec  INT;
  below_min    INT;
BEGIN
  SELECT COUNT(*) INTO total_roles FROM career_roles;
  SELECT COUNT(*) INTO new_roles   FROM career_roles WHERE is_new_ai_role;

  SELECT MIN(c), MAX(c)
    INTO min_per_sec, max_per_sec
    FROM (
      SELECT COUNT(*) AS c
      FROM career_roles
      GROUP BY career_sector_id
    ) t;

  -- Count sectors that both have at least one role AND have fewer than 8
  -- (sectors with zero roles — Media, Social Work, Performing Arts — are
  -- expected and excluded from this check).
  SELECT COUNT(*) INTO below_min
    FROM (
      SELECT career_sector_id, COUNT(*) AS c
      FROM career_roles
      GROUP BY career_sector_id
      HAVING COUNT(*) < 8
    ) t;

  RAISE NOTICE 'career_roles total: %', total_roles;
  RAISE NOTICE 'career_roles flagged as new AI roles: %', new_roles;
  RAISE NOTICE 'min/max roles per seeded sector: % / %', min_per_sec, max_per_sec;

  IF total_roles < 150 THEN
    RAISE EXCEPTION 'Expected at least 150 roles; got %', total_roles;
  END IF;
  IF below_min > 0 THEN
    RAISE EXCEPTION 'Some seeded sectors have fewer than 8 roles (count: %)', below_min;
  END IF;
END $$;

COMMIT;
