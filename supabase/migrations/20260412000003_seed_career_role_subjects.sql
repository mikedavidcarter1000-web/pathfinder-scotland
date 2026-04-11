-- ============================================
-- Seed: career_role_subjects (role -> SQA subject links)
-- Migration: 20260412000003
--
-- Links each career role to the SQA subjects that prepare a student for
-- it, using the per-sector SQA subject lists from the research document
-- "AI and the Future of Careers: A Guide for Scottish School Leavers"
-- (April 2026).
--
-- Relevance levels (user-specified):
--   essential    = subject explicitly required for the role
--   recommended  = subject strongly associated with the role
--   useful       = broader subjects that develop relevant skills
--
-- Each INSERT resolves a (sector_name, role_title, subject_name)
-- tuple to the correct UUIDs via joins so seeding is independent of
-- generated IDs and re-runnable on a fresh database.
--
-- Skipped subjects: the research doc mentions a handful of subjects
-- that are NOT in the seeded subjects table — Accounting, Statistics,
-- Practical Electronics, Practical Craft Skills, and "Care (N4/N5)".
-- Where the doc lists these, we map to the closest available subject
-- (e.g. Accounting -> Business Management, Statistics -> Mathematics,
-- Practical Electronics -> Engineering Science, Care -> Early Learning
-- and Childcare) rather than silently dropping them.
-- ============================================

BEGIN;

-- Clear any previous seed.
DELETE FROM career_role_subjects;

-- ============================================
-- Helper macro: each block below expands VALUES tuples of
-- (sector_name, role_title, subject_name, relevance) into rows in
-- career_role_subjects. ON CONFLICT DO NOTHING guards against
-- accidental duplicates within a single block.
-- ============================================

-- ============================================
-- HEALTHCARE & MEDICINE
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Healthcare & Medicine', 'Healthcare Assistant / Care Worker', 'Biology',                       'recommended'),
  ('Healthcare & Medicine', 'Healthcare Assistant / Care Worker', 'Human Biology',                 'recommended'),
  ('Healthcare & Medicine', 'Healthcare Assistant / Care Worker', 'English',                       'useful'),
  ('Healthcare & Medicine', 'Healthcare Assistant / Care Worker', 'Psychology',                    'useful'),
  ('Healthcare & Medicine', 'Healthcare Assistant / Care Worker', 'Early Learning and Childcare',  'useful'),

  ('Healthcare & Medicine', 'Nurse', 'Biology',        'essential'),
  ('Healthcare & Medicine', 'Nurse', 'Human Biology',  'essential'),
  ('Healthcare & Medicine', 'Nurse', 'Chemistry',      'recommended'),
  ('Healthcare & Medicine', 'Nurse', 'English',        'recommended'),
  ('Healthcare & Medicine', 'Nurse', 'Mathematics',    'recommended'),
  ('Healthcare & Medicine', 'Nurse', 'Psychology',     'useful'),

  ('Healthcare & Medicine', 'Physiotherapist / Paramedic', 'Biology',             'essential'),
  ('Healthcare & Medicine', 'Physiotherapist / Paramedic', 'Human Biology',       'essential'),
  ('Healthcare & Medicine', 'Physiotherapist / Paramedic', 'Physical Education',  'recommended'),
  ('Healthcare & Medicine', 'Physiotherapist / Paramedic', 'Chemistry',           'recommended'),
  ('Healthcare & Medicine', 'Physiotherapist / Paramedic', 'Mathematics',         'useful'),

  ('Healthcare & Medicine', 'Pharmacist', 'Chemistry',     'essential'),
  ('Healthcare & Medicine', 'Pharmacist', 'Biology',       'essential'),
  ('Healthcare & Medicine', 'Pharmacist', 'Human Biology', 'recommended'),
  ('Healthcare & Medicine', 'Pharmacist', 'Mathematics',   'recommended'),
  ('Healthcare & Medicine', 'Pharmacist', 'English',       'useful'),

  ('Healthcare & Medicine', 'Radiographer', 'Physics',       'essential'),
  ('Healthcare & Medicine', 'Radiographer', 'Biology',       'essential'),
  ('Healthcare & Medicine', 'Radiographer', 'Human Biology', 'recommended'),
  ('Healthcare & Medicine', 'Radiographer', 'Chemistry',     'recommended'),
  ('Healthcare & Medicine', 'Radiographer', 'Mathematics',   'recommended'),

  ('Healthcare & Medicine', 'Doctor / GP', 'Biology',       'essential'),
  ('Healthcare & Medicine', 'Doctor / GP', 'Chemistry',     'essential'),
  ('Healthcare & Medicine', 'Doctor / GP', 'Human Biology', 'essential'),
  ('Healthcare & Medicine', 'Doctor / GP', 'Mathematics',   'recommended'),
  ('Healthcare & Medicine', 'Doctor / GP', 'English',       'recommended'),
  ('Healthcare & Medicine', 'Doctor / GP', 'Psychology',    'useful'),

  ('Healthcare & Medicine', 'Clinical Informatician', 'Biology',          'recommended'),
  ('Healthcare & Medicine', 'Clinical Informatician', 'Human Biology',    'recommended'),
  ('Healthcare & Medicine', 'Clinical Informatician', 'Computing Science','essential'),
  ('Healthcare & Medicine', 'Clinical Informatician', 'Mathematics',      'recommended'),
  ('Healthcare & Medicine', 'Clinical Informatician', 'Data Science',     'useful'),

  ('Healthcare & Medicine', 'Chief Nursing Information Officer (CNIO)', 'Biology',           'recommended'),
  ('Healthcare & Medicine', 'Chief Nursing Information Officer (CNIO)', 'Human Biology',     'recommended'),
  ('Healthcare & Medicine', 'Chief Nursing Information Officer (CNIO)', 'English',           'recommended'),
  ('Healthcare & Medicine', 'Chief Nursing Information Officer (CNIO)', 'Administration and IT','useful'),
  ('Healthcare & Medicine', 'Chief Nursing Information Officer (CNIO)', 'Psychology',        'useful'),

  ('Healthcare & Medicine', 'Digital Medicines Specialist', 'Chemistry',        'essential'),
  ('Healthcare & Medicine', 'Digital Medicines Specialist', 'Biology',          'essential'),
  ('Healthcare & Medicine', 'Digital Medicines Specialist', 'Human Biology',    'recommended'),
  ('Healthcare & Medicine', 'Digital Medicines Specialist', 'Mathematics',      'recommended'),
  ('Healthcare & Medicine', 'Digital Medicines Specialist', 'Computing Science','useful'),

  ('Healthcare & Medicine', 'Health Data Scientist', 'Mathematics',      'essential'),
  ('Healthcare & Medicine', 'Health Data Scientist', 'Computing Science','essential'),
  ('Healthcare & Medicine', 'Health Data Scientist', 'Data Science',     'recommended'),
  ('Healthcare & Medicine', 'Health Data Scientist', 'Biology',          'recommended'),
  ('Healthcare & Medicine', 'Health Data Scientist', 'Human Biology',    'useful'),

  ('Healthcare & Medicine', 'AI Healthcare Data Analyst', 'Mathematics',      'essential'),
  ('Healthcare & Medicine', 'AI Healthcare Data Analyst', 'Computing Science','essential'),
  ('Healthcare & Medicine', 'AI Healthcare Data Analyst', 'Data Science',     'recommended'),
  ('Healthcare & Medicine', 'AI Healthcare Data Analyst', 'Biology',          'recommended'),
  ('Healthcare & Medicine', 'AI Healthcare Data Analyst', 'Human Biology',    'useful'),

  ('Healthcare & Medicine', 'Clinical AI Safety Specialist', 'Biology',        'recommended'),
  ('Healthcare & Medicine', 'Clinical AI Safety Specialist', 'Human Biology',  'recommended'),
  ('Healthcare & Medicine', 'Clinical AI Safety Specialist', 'Computing Science','essential'),
  ('Healthcare & Medicine', 'Clinical AI Safety Specialist', 'Philosophy',     'useful'),
  ('Healthcare & Medicine', 'Clinical AI Safety Specialist', 'English',        'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- EDUCATION & TEACHING
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Education & Teaching', 'Nursery Practitioner / Childcare Worker', 'Early Learning and Childcare','essential'),
  ('Education & Teaching', 'Nursery Practitioner / Childcare Worker', 'English',                     'essential'),
  ('Education & Teaching', 'Nursery Practitioner / Childcare Worker', 'Psychology',                  'recommended'),
  ('Education & Teaching', 'Nursery Practitioner / Childcare Worker', 'Mathematics',                 'recommended'),
  ('Education & Teaching', 'Nursery Practitioner / Childcare Worker', 'Health and Food Technology',  'useful'),

  ('Education & Teaching', 'Teaching Assistant', 'English',                     'essential'),
  ('Education & Teaching', 'Teaching Assistant', 'Mathematics',                 'essential'),
  ('Education & Teaching', 'Teaching Assistant', 'Psychology',                  'recommended'),
  ('Education & Teaching', 'Teaching Assistant', 'Early Learning and Childcare','recommended'),
  ('Education & Teaching', 'Teaching Assistant', 'Physical Education',          'useful'),

  ('Education & Teaching', 'Teacher (Primary/Secondary)', 'English',     'essential'),
  ('Education & Teaching', 'Teacher (Primary/Secondary)', 'Mathematics', 'essential'),
  ('Education & Teaching', 'Teacher (Primary/Secondary)', 'Psychology',  'recommended'),
  ('Education & Teaching', 'Teacher (Primary/Secondary)', 'Biology',     'useful'),
  ('Education & Teaching', 'Teacher (Primary/Secondary)', 'History',     'useful'),
  ('Education & Teaching', 'Teacher (Primary/Secondary)', 'Modern Studies','useful'),

  ('Education & Teaching', 'Educational Psychologist', 'Psychology',  'essential'),
  ('Education & Teaching', 'Educational Psychologist', 'Biology',     'recommended'),
  ('Education & Teaching', 'Educational Psychologist', 'Human Biology','recommended'),
  ('Education & Teaching', 'Educational Psychologist', 'English',     'recommended'),
  ('Education & Teaching', 'Educational Psychologist', 'Sociology',   'useful'),

  ('Education & Teaching', 'Learning Technologist', 'Computing Science','essential'),
  ('Education & Teaching', 'Learning Technologist', 'English',          'recommended'),
  ('Education & Teaching', 'Learning Technologist', 'Mathematics',      'recommended'),
  ('Education & Teaching', 'Learning Technologist', 'Digital Media',    'useful'),
  ('Education & Teaching', 'Learning Technologist', 'Psychology',       'useful'),

  ('Education & Teaching', 'AI Literacy Curriculum Developer', 'Computing Science','essential'),
  ('Education & Teaching', 'AI Literacy Curriculum Developer', 'English',          'essential'),
  ('Education & Teaching', 'AI Literacy Curriculum Developer', 'Psychology',       'recommended'),
  ('Education & Teaching', 'AI Literacy Curriculum Developer', 'Mathematics',      'recommended'),
  ('Education & Teaching', 'AI Literacy Curriculum Developer', 'Philosophy',       'useful'),

  ('Education & Teaching', 'Digital Learning Designer', 'Computing Science','essential'),
  ('Education & Teaching', 'Digital Learning Designer', 'Digital Media',    'essential'),
  ('Education & Teaching', 'Digital Learning Designer', 'English',          'recommended'),
  ('Education & Teaching', 'Digital Learning Designer', 'Art and Design',   'useful'),
  ('Education & Teaching', 'Digital Learning Designer', 'Graphic Communication','useful'),

  ('Education & Teaching', 'Online / AI-Assisted Tutoring Coordinator', 'English',          'essential'),
  ('Education & Teaching', 'Online / AI-Assisted Tutoring Coordinator', 'Mathematics',      'essential'),
  ('Education & Teaching', 'Online / AI-Assisted Tutoring Coordinator', 'Computing Science','recommended'),
  ('Education & Teaching', 'Online / AI-Assisted Tutoring Coordinator', 'Psychology',       'recommended'),
  ('Education & Teaching', 'Online / AI-Assisted Tutoring Coordinator', 'Administration and IT','useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- LAW & JUSTICE
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Law & Justice', 'Legal Secretary', 'English',                'essential'),
  ('Law & Justice', 'Legal Secretary', 'Administration and IT',  'essential'),
  ('Law & Justice', 'Legal Secretary', 'Modern Studies',         'recommended'),
  ('Law & Justice', 'Legal Secretary', 'Business Management',    'useful'),

  ('Law & Justice', 'Paralegal', 'English',        'essential'),
  ('Law & Justice', 'Paralegal', 'Modern Studies', 'recommended'),
  ('Law & Justice', 'Paralegal', 'History',        'recommended'),
  ('Law & Justice', 'Paralegal', 'Politics',       'recommended'),
  ('Law & Justice', 'Paralegal', 'Administration and IT','useful'),

  ('Law & Justice', 'Court Clerk', 'English',              'essential'),
  ('Law & Justice', 'Court Clerk', 'Modern Studies',       'recommended'),
  ('Law & Justice', 'Court Clerk', 'Administration and IT','recommended'),
  ('Law & Justice', 'Court Clerk', 'Politics',             'useful'),

  ('Law & Justice', 'Solicitor (Junior/Trainee)', 'English',       'essential'),
  ('Law & Justice', 'Solicitor (Junior/Trainee)', 'Modern Studies','essential'),
  ('Law & Justice', 'Solicitor (Junior/Trainee)', 'History',       'recommended'),
  ('Law & Justice', 'Solicitor (Junior/Trainee)', 'Politics',      'recommended'),
  ('Law & Justice', 'Solicitor (Junior/Trainee)', 'Philosophy',    'recommended'),
  ('Law & Justice', 'Solicitor (Junior/Trainee)', 'Psychology',    'useful'),

  ('Law & Justice', 'Solicitor (Senior) / Partner', 'English',       'essential'),
  ('Law & Justice', 'Solicitor (Senior) / Partner', 'Modern Studies','essential'),
  ('Law & Justice', 'Solicitor (Senior) / Partner', 'History',       'recommended'),
  ('Law & Justice', 'Solicitor (Senior) / Partner', 'Politics',      'recommended'),
  ('Law & Justice', 'Solicitor (Senior) / Partner', 'Philosophy',    'useful'),
  ('Law & Justice', 'Solicitor (Senior) / Partner', 'Business Management','useful'),

  ('Law & Justice', 'Barrister', 'English',       'essential'),
  ('Law & Justice', 'Barrister', 'Modern Studies','essential'),
  ('Law & Justice', 'Barrister', 'History',       'recommended'),
  ('Law & Justice', 'Barrister', 'Philosophy',    'recommended'),
  ('Law & Justice', 'Barrister', 'Politics',      'recommended'),
  ('Law & Justice', 'Barrister', 'Drama',         'useful'),

  ('Law & Justice', 'Legal Technologist', 'Computing Science','essential'),
  ('Law & Justice', 'Legal Technologist', 'English',          'essential'),
  ('Law & Justice', 'Legal Technologist', 'Modern Studies',   'recommended'),
  ('Law & Justice', 'Legal Technologist', 'Mathematics',      'useful'),
  ('Law & Justice', 'Legal Technologist', 'Administration and IT','useful'),

  ('Law & Justice', 'Legal AI Product Manager', 'English',          'essential'),
  ('Law & Justice', 'Legal AI Product Manager', 'Modern Studies',   'recommended'),
  ('Law & Justice', 'Legal AI Product Manager', 'Business Management','recommended'),
  ('Law & Justice', 'Legal AI Product Manager', 'Computing Science','recommended'),
  ('Law & Justice', 'Legal AI Product Manager', 'Mathematics',      'useful'),

  ('Law & Justice', 'AI Compliance / Ethics Specialist', 'Philosophy',  'essential'),
  ('Law & Justice', 'AI Compliance / Ethics Specialist', 'Modern Studies','essential'),
  ('Law & Justice', 'AI Compliance / Ethics Specialist', 'English',     'recommended'),
  ('Law & Justice', 'AI Compliance / Ethics Specialist', 'Politics',    'recommended'),
  ('Law & Justice', 'AI Compliance / Ethics Specialist', 'Sociology',   'useful'),

  ('Law & Justice', 'Legal Data Analyst', 'Mathematics',      'essential'),
  ('Law & Justice', 'Legal Data Analyst', 'Computing Science','essential'),
  ('Law & Justice', 'Legal Data Analyst', 'Data Science',     'recommended'),
  ('Law & Justice', 'Legal Data Analyst', 'English',          'recommended'),
  ('Law & Justice', 'Legal Data Analyst', 'Modern Studies',   'useful'),

  ('Law & Justice', 'LawTech Consultant', 'English',          'essential'),
  ('Law & Justice', 'LawTech Consultant', 'Modern Studies',   'recommended'),
  ('Law & Justice', 'LawTech Consultant', 'Business Management','recommended'),
  ('Law & Justice', 'LawTech Consultant', 'Computing Science','recommended'),
  ('Law & Justice', 'LawTech Consultant', 'Politics',         'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- BUSINESS & FINANCE
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Business & Finance', 'Bookkeeper / Payroll Clerk', 'Mathematics',           'essential'),
  ('Business & Finance', 'Bookkeeper / Payroll Clerk', 'Business Management',   'essential'),
  ('Business & Finance', 'Bookkeeper / Payroll Clerk', 'Administration and IT', 'recommended'),
  ('Business & Finance', 'Bookkeeper / Payroll Clerk', 'English',               'useful'),

  ('Business & Finance', 'Bank Clerk / Cashier', 'Mathematics',          'essential'),
  ('Business & Finance', 'Bank Clerk / Cashier', 'English',              'essential'),
  ('Business & Finance', 'Bank Clerk / Cashier', 'Business Management',  'recommended'),
  ('Business & Finance', 'Bank Clerk / Cashier', 'Administration and IT','useful'),

  ('Business & Finance', 'Accountant (Qualified)', 'Mathematics',         'essential'),
  ('Business & Finance', 'Accountant (Qualified)', 'Business Management', 'essential'),
  ('Business & Finance', 'Accountant (Qualified)', 'Economics',           'recommended'),
  ('Business & Finance', 'Accountant (Qualified)', 'English',             'recommended'),
  ('Business & Finance', 'Accountant (Qualified)', 'Administration and IT','useful'),

  ('Business & Finance', 'Financial Adviser', 'Mathematics',         'essential'),
  ('Business & Finance', 'Financial Adviser', 'Business Management', 'essential'),
  ('Business & Finance', 'Financial Adviser', 'Economics',           'recommended'),
  ('Business & Finance', 'Financial Adviser', 'English',             'recommended'),
  ('Business & Finance', 'Financial Adviser', 'Psychology',          'useful'),

  ('Business & Finance', 'Actuary', 'Mathematics',         'essential'),
  ('Business & Finance', 'Actuary', 'Economics',           'essential'),
  ('Business & Finance', 'Actuary', 'Business Management', 'recommended'),
  ('Business & Finance', 'Actuary', 'Physics',             'useful'),
  ('Business & Finance', 'Actuary', 'Computing Science',   'useful'),

  ('Business & Finance', 'Insurance Underwriter', 'Mathematics',         'essential'),
  ('Business & Finance', 'Insurance Underwriter', 'Business Management', 'essential'),
  ('Business & Finance', 'Insurance Underwriter', 'Economics',           'recommended'),
  ('Business & Finance', 'Insurance Underwriter', 'English',             'recommended'),
  ('Business & Finance', 'Insurance Underwriter', 'Administration and IT','useful'),

  ('Business & Finance', 'AI-Savvy Financial Analyst', 'Mathematics',         'essential'),
  ('Business & Finance', 'AI-Savvy Financial Analyst', 'Computing Science',   'essential'),
  ('Business & Finance', 'AI-Savvy Financial Analyst', 'Business Management', 'recommended'),
  ('Business & Finance', 'AI-Savvy Financial Analyst', 'Economics',           'recommended'),
  ('Business & Finance', 'AI-Savvy Financial Analyst', 'Data Science',        'useful'),

  ('Business & Finance', 'Financial AI Compliance Specialist', 'Mathematics',         'essential'),
  ('Business & Finance', 'Financial AI Compliance Specialist', 'Business Management', 'essential'),
  ('Business & Finance', 'Financial AI Compliance Specialist', 'Modern Studies',      'recommended'),
  ('Business & Finance', 'Financial AI Compliance Specialist', 'Computing Science',   'recommended'),
  ('Business & Finance', 'Financial AI Compliance Specialist', 'English',             'useful'),

  ('Business & Finance', 'Data Governance Manager (Finance)', 'Mathematics',         'essential'),
  ('Business & Finance', 'Data Governance Manager (Finance)', 'Computing Science',   'essential'),
  ('Business & Finance', 'Data Governance Manager (Finance)', 'Data Science',        'recommended'),
  ('Business & Finance', 'Data Governance Manager (Finance)', 'Business Management', 'recommended'),
  ('Business & Finance', 'Data Governance Manager (Finance)', 'English',             'useful'),

  ('Business & Finance', 'FinTech Product Manager', 'Mathematics',         'essential'),
  ('Business & Finance', 'FinTech Product Manager', 'Business Management', 'essential'),
  ('Business & Finance', 'FinTech Product Manager', 'Computing Science',   'recommended'),
  ('Business & Finance', 'FinTech Product Manager', 'Economics',           'recommended'),
  ('Business & Finance', 'FinTech Product Manager', 'English',             'useful'),

  ('Business & Finance', 'Forensic AI Auditor', 'Mathematics',         'essential'),
  ('Business & Finance', 'Forensic AI Auditor', 'Business Management', 'essential'),
  ('Business & Finance', 'Forensic AI Auditor', 'Computing Science',   'recommended'),
  ('Business & Finance', 'Forensic AI Auditor', 'Data Science',        'recommended'),
  ('Business & Finance', 'Forensic AI Auditor', 'English',             'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- ENGINEERING & MANUFACTURING
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Engineering & Manufacturing', 'Maintenance Engineer', 'Physics',             'essential'),
  ('Engineering & Manufacturing', 'Maintenance Engineer', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Maintenance Engineer', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Maintenance Engineer', 'Practical Metalworking','recommended'),
  ('Engineering & Manufacturing', 'Maintenance Engineer', 'Design and Manufacture','useful'),

  ('Engineering & Manufacturing', 'Manufacturing Technician', 'Engineering Science','essential'),
  ('Engineering & Manufacturing', 'Manufacturing Technician', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Manufacturing Technician', 'Design and Manufacture','recommended'),
  ('Engineering & Manufacturing', 'Manufacturing Technician', 'Practical Metalworking','recommended'),
  ('Engineering & Manufacturing', 'Manufacturing Technician', 'Physics',             'useful'),

  ('Engineering & Manufacturing', 'Mechanical Engineer', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Mechanical Engineer', 'Physics',             'essential'),
  ('Engineering & Manufacturing', 'Mechanical Engineer', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Mechanical Engineer', 'Design and Manufacture','recommended'),
  ('Engineering & Manufacturing', 'Mechanical Engineer', 'Graphic Communication','recommended'),
  ('Engineering & Manufacturing', 'Mechanical Engineer', 'Computing Science',   'useful'),

  ('Engineering & Manufacturing', 'Electrical Engineer', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Electrical Engineer', 'Physics',             'essential'),
  ('Engineering & Manufacturing', 'Electrical Engineer', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Electrical Engineer', 'Computing Science',   'recommended'),
  ('Engineering & Manufacturing', 'Electrical Engineer', 'Graphic Communication','useful'),

  ('Engineering & Manufacturing', 'Quality Control Inspector', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Quality Control Inspector', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Quality Control Inspector', 'Physics',             'recommended'),
  ('Engineering & Manufacturing', 'Quality Control Inspector', 'Design and Manufacture','recommended'),
  ('Engineering & Manufacturing', 'Quality Control Inspector', 'Practical Metalworking','useful'),

  ('Engineering & Manufacturing', 'CNC Operator / Programmer', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'CNC Operator / Programmer', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'CNC Operator / Programmer', 'Practical Metalworking','essential'),
  ('Engineering & Manufacturing', 'CNC Operator / Programmer', 'Design and Manufacture','recommended'),
  ('Engineering & Manufacturing', 'CNC Operator / Programmer', 'Computing Science',   'recommended'),

  ('Engineering & Manufacturing', 'Robotics Technician', 'Physics',             'essential'),
  ('Engineering & Manufacturing', 'Robotics Technician', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Robotics Technician', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Robotics Technician', 'Computing Science',   'recommended'),
  ('Engineering & Manufacturing', 'Robotics Technician', 'Practical Metalworking','useful'),

  ('Engineering & Manufacturing', 'Digital Manufacturing Engineer', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Digital Manufacturing Engineer', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Digital Manufacturing Engineer', 'Computing Science',   'essential'),
  ('Engineering & Manufacturing', 'Digital Manufacturing Engineer', 'Physics',             'recommended'),
  ('Engineering & Manufacturing', 'Digital Manufacturing Engineer', 'Design and Manufacture','useful'),

  ('Engineering & Manufacturing', 'AI Quality Systems Analyst', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'AI Quality Systems Analyst', 'Computing Science',   'essential'),
  ('Engineering & Manufacturing', 'AI Quality Systems Analyst', 'Engineering Science', 'recommended'),
  ('Engineering & Manufacturing', 'AI Quality Systems Analyst', 'Data Science',        'recommended'),
  ('Engineering & Manufacturing', 'AI Quality Systems Analyst', 'Physics',             'useful'),

  ('Engineering & Manufacturing', 'Predictive Maintenance Analyst', 'Mathematics',         'essential'),
  ('Engineering & Manufacturing', 'Predictive Maintenance Analyst', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Predictive Maintenance Analyst', 'Computing Science',   'recommended'),
  ('Engineering & Manufacturing', 'Predictive Maintenance Analyst', 'Physics',             'recommended'),
  ('Engineering & Manufacturing', 'Predictive Maintenance Analyst', 'Data Science',        'useful'),

  ('Engineering & Manufacturing', 'Smart Factory Coordinator', 'Engineering Science', 'essential'),
  ('Engineering & Manufacturing', 'Smart Factory Coordinator', 'Computing Science',   'essential'),
  ('Engineering & Manufacturing', 'Smart Factory Coordinator', 'Mathematics',         'recommended'),
  ('Engineering & Manufacturing', 'Smart Factory Coordinator', 'Design and Manufacture','recommended'),
  ('Engineering & Manufacturing', 'Smart Factory Coordinator', 'Business Management', 'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- CONSTRUCTION & TRADES
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Construction & Trades', 'Bricklayer', 'Mathematics',             'essential'),
  ('Construction & Trades', 'Bricklayer', 'Practical Woodworking',   'recommended'),
  ('Construction & Trades', 'Bricklayer', 'Design and Manufacture',  'recommended'),
  ('Construction & Trades', 'Bricklayer', 'Graphic Communication',   'useful'),

  ('Construction & Trades', 'Electrician', 'Mathematics',         'essential'),
  ('Construction & Trades', 'Electrician', 'Physics',             'essential'),
  ('Construction & Trades', 'Electrician', 'Engineering Science', 'recommended'),
  ('Construction & Trades', 'Electrician', 'Practical Metalworking','recommended'),
  ('Construction & Trades', 'Electrician', 'Design and Manufacture','useful'),

  ('Construction & Trades', 'Plumber', 'Mathematics',         'essential'),
  ('Construction & Trades', 'Plumber', 'Physics',             'recommended'),
  ('Construction & Trades', 'Plumber', 'Practical Metalworking','recommended'),
  ('Construction & Trades', 'Plumber', 'Design and Manufacture','useful'),

  ('Construction & Trades', 'Joiner / Carpenter', 'Practical Woodworking', 'essential'),
  ('Construction & Trades', 'Joiner / Carpenter', 'Mathematics',           'essential'),
  ('Construction & Trades', 'Joiner / Carpenter', 'Design and Manufacture','recommended'),
  ('Construction & Trades', 'Joiner / Carpenter', 'Graphic Communication', 'recommended'),
  ('Construction & Trades', 'Joiner / Carpenter', 'Physics',               'useful'),

  ('Construction & Trades', 'Site Manager', 'Mathematics',         'essential'),
  ('Construction & Trades', 'Site Manager', 'Business Management', 'essential'),
  ('Construction & Trades', 'Site Manager', 'Graphic Communication','recommended'),
  ('Construction & Trades', 'Site Manager', 'Engineering Science', 'recommended'),
  ('Construction & Trades', 'Site Manager', 'English',             'useful'),

  ('Construction & Trades', 'Quantity Surveyor', 'Mathematics',          'essential'),
  ('Construction & Trades', 'Quantity Surveyor', 'Business Management',  'essential'),
  ('Construction & Trades', 'Quantity Surveyor', 'Graphic Communication','recommended'),
  ('Construction & Trades', 'Quantity Surveyor', 'Design and Manufacture','recommended'),
  ('Construction & Trades', 'Quantity Surveyor', 'Economics',            'useful'),

  ('Construction & Trades', 'Construction Technology Specialist', 'Computing Science',   'essential'),
  ('Construction & Trades', 'Construction Technology Specialist', 'Graphic Communication','essential'),
  ('Construction & Trades', 'Construction Technology Specialist', 'Mathematics',         'recommended'),
  ('Construction & Trades', 'Construction Technology Specialist', 'Engineering Science', 'recommended'),
  ('Construction & Trades', 'Construction Technology Specialist', 'Design and Manufacture','useful'),

  ('Construction & Trades', 'BIM / Digital Twin Manager', 'Computing Science',   'essential'),
  ('Construction & Trades', 'BIM / Digital Twin Manager', 'Graphic Communication','essential'),
  ('Construction & Trades', 'BIM / Digital Twin Manager', 'Mathematics',         'recommended'),
  ('Construction & Trades', 'BIM / Digital Twin Manager', 'Design and Manufacture','recommended'),
  ('Construction & Trades', 'BIM / Digital Twin Manager', 'Physics',             'useful'),

  ('Construction & Trades', 'Drone Survey Operator', 'Computing Science',   'essential'),
  ('Construction & Trades', 'Drone Survey Operator', 'Geography',           'recommended'),
  ('Construction & Trades', 'Drone Survey Operator', 'Mathematics',         'recommended'),
  ('Construction & Trades', 'Drone Survey Operator', 'Physics',             'recommended'),
  ('Construction & Trades', 'Drone Survey Operator', 'Engineering Science', 'useful'),

  ('Construction & Trades', 'Smart Building Technician', 'Engineering Science', 'essential'),
  ('Construction & Trades', 'Smart Building Technician', 'Physics',             'essential'),
  ('Construction & Trades', 'Smart Building Technician', 'Computing Science',   'recommended'),
  ('Construction & Trades', 'Smart Building Technician', 'Mathematics',         'recommended'),
  ('Construction & Trades', 'Smart Building Technician', 'Design and Manufacture','useful'),

  ('Construction & Trades', 'Sustainability / Energy Modelling Analyst', 'Mathematics',         'essential'),
  ('Construction & Trades', 'Sustainability / Energy Modelling Analyst', 'Physics',             'essential'),
  ('Construction & Trades', 'Sustainability / Energy Modelling Analyst', 'Environmental Science','recommended'),
  ('Construction & Trades', 'Sustainability / Energy Modelling Analyst', 'Computing Science',   'recommended'),
  ('Construction & Trades', 'Sustainability / Energy Modelling Analyst', 'Engineering Science', 'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPUTING & DIGITAL TECHNOLOGY
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Computing & Digital Technology', 'AI / ML Engineer', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'AI / ML Engineer', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'AI / ML Engineer', 'Physics',          'recommended'),
  ('Computing & Digital Technology', 'AI / ML Engineer', 'Data Science',     'recommended'),
  ('Computing & Digital Technology', 'AI / ML Engineer', 'English',          'useful'),

  ('Computing & Digital Technology', 'Cybersecurity Analyst', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'Cybersecurity Analyst', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'Cybersecurity Analyst', 'Cyber Security',   'recommended'),
  ('Computing & Digital Technology', 'Cybersecurity Analyst', 'Physics',          'useful'),
  ('Computing & Digital Technology', 'Cybersecurity Analyst', 'Modern Studies',   'useful'),

  ('Computing & Digital Technology', 'Senior Software Developer', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'Senior Software Developer', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'Senior Software Developer', 'Physics',          'recommended'),
  ('Computing & Digital Technology', 'Senior Software Developer', 'English',          'useful'),
  ('Computing & Digital Technology', 'Senior Software Developer', 'Business Management','useful'),

  ('Computing & Digital Technology', 'IT Support Technician', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'IT Support Technician', 'Administration and IT','recommended'),
  ('Computing & Digital Technology', 'IT Support Technician', 'Mathematics',      'recommended'),
  ('Computing & Digital Technology', 'IT Support Technician', 'English',          'useful'),

  ('Computing & Digital Technology', 'Data Analyst', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'Data Analyst', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'Data Analyst', 'Data Science',     'recommended'),
  ('Computing & Digital Technology', 'Data Analyst', 'Business Management','recommended'),
  ('Computing & Digital Technology', 'Data Analyst', 'Economics',        'useful'),

  ('Computing & Digital Technology', 'Junior Software Developer', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'Junior Software Developer', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'Junior Software Developer', 'Physics',          'recommended'),
  ('Computing & Digital Technology', 'Junior Software Developer', 'English',          'useful'),

  ('Computing & Digital Technology', 'Prompt Engineer', 'English',          'essential'),
  ('Computing & Digital Technology', 'Prompt Engineer', 'Computing Science','recommended'),
  ('Computing & Digital Technology', 'Prompt Engineer', 'Mathematics',      'recommended'),
  ('Computing & Digital Technology', 'Prompt Engineer', 'Philosophy',       'useful'),
  ('Computing & Digital Technology', 'Prompt Engineer', 'Psychology',       'useful'),

  ('Computing & Digital Technology', 'AI Ethics Officer', 'Philosophy',       'essential'),
  ('Computing & Digital Technology', 'AI Ethics Officer', 'Computing Science','recommended'),
  ('Computing & Digital Technology', 'AI Ethics Officer', 'English',          'recommended'),
  ('Computing & Digital Technology', 'AI Ethics Officer', 'Modern Studies',   'recommended'),
  ('Computing & Digital Technology', 'AI Ethics Officer', 'Sociology',        'useful'),

  ('Computing & Digital Technology', 'AI Product Manager', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'AI Product Manager', 'Business Management','essential'),
  ('Computing & Digital Technology', 'AI Product Manager', 'English',          'recommended'),
  ('Computing & Digital Technology', 'AI Product Manager', 'Mathematics',      'recommended'),
  ('Computing & Digital Technology', 'AI Product Manager', 'Psychology',       'useful'),

  ('Computing & Digital Technology', 'AI Solutions Engineer', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'AI Solutions Engineer', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'AI Solutions Engineer', 'English',          'recommended'),
  ('Computing & Digital Technology', 'AI Solutions Engineer', 'Business Management','recommended'),
  ('Computing & Digital Technology', 'AI Solutions Engineer', 'Physics',          'useful'),

  ('Computing & Digital Technology', 'AI Safety Researcher', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'AI Safety Researcher', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'AI Safety Researcher', 'Philosophy',       'recommended'),
  ('Computing & Digital Technology', 'AI Safety Researcher', 'Physics',          'recommended'),
  ('Computing & Digital Technology', 'AI Safety Researcher', 'English',          'useful'),

  ('Computing & Digital Technology', 'AI Operations Engineer', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'AI Operations Engineer', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'AI Operations Engineer', 'Administration and IT','recommended'),
  ('Computing & Digital Technology', 'AI Operations Engineer', 'Business Management','useful'),
  ('Computing & Digital Technology', 'AI Operations Engineer', 'Physics',          'useful'),

  ('Computing & Digital Technology', 'Data Engineer', 'Computing Science','essential'),
  ('Computing & Digital Technology', 'Data Engineer', 'Mathematics',      'essential'),
  ('Computing & Digital Technology', 'Data Engineer', 'Data Science',     'recommended'),
  ('Computing & Digital Technology', 'Data Engineer', 'Physics',          'useful'),
  ('Computing & Digital Technology', 'Data Engineer', 'Cyber Security',   'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATIVE ARTS & DESIGN
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Creative Arts & Design', 'UX Designer', 'Art and Design',       'essential'),
  ('Creative Arts & Design', 'UX Designer', 'Graphic Communication','essential'),
  ('Creative Arts & Design', 'UX Designer', 'Computing Science',   'recommended'),
  ('Creative Arts & Design', 'UX Designer', 'Psychology',          'recommended'),
  ('Creative Arts & Design', 'UX Designer', 'Design and Manufacture','useful'),

  ('Creative Arts & Design', 'Photographer', 'Photography',      'essential'),
  ('Creative Arts & Design', 'Photographer', 'Art and Design',   'recommended'),
  ('Creative Arts & Design', 'Photographer', 'English',          'useful'),
  ('Creative Arts & Design', 'Photographer', 'Media Studies',    'useful'),
  ('Creative Arts & Design', 'Photographer', 'Digital Media',    'useful'),

  ('Creative Arts & Design', 'Video Editor', 'Media Studies',    'essential'),
  ('Creative Arts & Design', 'Video Editor', 'Film and Media',   'essential'),
  ('Creative Arts & Design', 'Video Editor', 'Art and Design',   'recommended'),
  ('Creative Arts & Design', 'Video Editor', 'English',          'useful'),
  ('Creative Arts & Design', 'Video Editor', 'Music Technology', 'useful'),

  ('Creative Arts & Design', 'Graphic Designer', 'Art and Design',       'essential'),
  ('Creative Arts & Design', 'Graphic Designer', 'Graphic Communication','essential'),
  ('Creative Arts & Design', 'Graphic Designer', 'Design and Manufacture','recommended'),
  ('Creative Arts & Design', 'Graphic Designer', 'Digital Media',        'recommended'),
  ('Creative Arts & Design', 'Graphic Designer', 'English',              'useful'),

  ('Creative Arts & Design', 'Journalist / Content Writer', 'English',       'essential'),
  ('Creative Arts & Design', 'Journalist / Content Writer', 'Media Studies', 'essential'),
  ('Creative Arts & Design', 'Journalist / Content Writer', 'Modern Studies','recommended'),
  ('Creative Arts & Design', 'Journalist / Content Writer', 'History',       'useful'),
  ('Creative Arts & Design', 'Journalist / Content Writer', 'Journalism',    'recommended'),

  ('Creative Arts & Design', 'Marketing Content Creator', 'English',              'essential'),
  ('Creative Arts & Design', 'Marketing Content Creator', 'Business Management',  'essential'),
  ('Creative Arts & Design', 'Marketing Content Creator', 'Media Studies',        'recommended'),
  ('Creative Arts & Design', 'Marketing Content Creator', 'Graphic Communication','recommended'),
  ('Creative Arts & Design', 'Marketing Content Creator', 'Art and Design',       'useful'),

  ('Creative Arts & Design', 'AI Creative Director', 'Art and Design',       'essential'),
  ('Creative Arts & Design', 'AI Creative Director', 'English',              'essential'),
  ('Creative Arts & Design', 'AI Creative Director', 'Graphic Communication','recommended'),
  ('Creative Arts & Design', 'AI Creative Director', 'Business Management',  'recommended'),
  ('Creative Arts & Design', 'AI Creative Director', 'Digital Media',        'useful'),

  ('Creative Arts & Design', 'AI Content Strategist', 'English',         'essential'),
  ('Creative Arts & Design', 'AI Content Strategist', 'Media Studies',   'essential'),
  ('Creative Arts & Design', 'AI Content Strategist', 'Business Management','recommended'),
  ('Creative Arts & Design', 'AI Content Strategist', 'Computing Science','useful'),
  ('Creative Arts & Design', 'AI Content Strategist', 'Psychology',      'useful'),

  ('Creative Arts & Design', 'Prompt Artist / Designer', 'Art and Design',   'essential'),
  ('Creative Arts & Design', 'Prompt Artist / Designer', 'English',          'essential'),
  ('Creative Arts & Design', 'Prompt Artist / Designer', 'Digital Media',    'recommended'),
  ('Creative Arts & Design', 'Prompt Artist / Designer', 'Photography',      'recommended'),
  ('Creative Arts & Design', 'Prompt Artist / Designer', 'Graphic Communication','useful'),

  ('Creative Arts & Design', 'AI Ethics and Copyright Specialist', 'English',       'essential'),
  ('Creative Arts & Design', 'AI Ethics and Copyright Specialist', 'Philosophy',    'recommended'),
  ('Creative Arts & Design', 'AI Ethics and Copyright Specialist', 'Modern Studies','recommended'),
  ('Creative Arts & Design', 'AI Ethics and Copyright Specialist', 'Art and Design','useful'),
  ('Creative Arts & Design', 'AI Ethics and Copyright Specialist', 'Media Studies', 'useful'),

  ('Creative Arts & Design', 'CreaTech Specialist', 'Computing Science','essential'),
  ('Creative Arts & Design', 'CreaTech Specialist', 'Art and Design',   'essential'),
  ('Creative Arts & Design', 'CreaTech Specialist', 'Digital Media',    'recommended'),
  ('Creative Arts & Design', 'CreaTech Specialist', 'Design and Manufacture','recommended'),
  ('Creative Arts & Design', 'CreaTech Specialist', 'Music Technology', 'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- RETAIL & CUSTOMER SERVICE
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Retail & Customer Service', 'Visual Merchandiser', 'Art and Design',       'essential'),
  ('Retail & Customer Service', 'Visual Merchandiser', 'Graphic Communication','recommended'),
  ('Retail & Customer Service', 'Visual Merchandiser', 'Business Management',  'recommended'),
  ('Retail & Customer Service', 'Visual Merchandiser', 'Design and Manufacture','useful'),

  ('Retail & Customer Service', 'Retail Manager', 'Business Management', 'essential'),
  ('Retail & Customer Service', 'Retail Manager', 'English',             'essential'),
  ('Retail & Customer Service', 'Retail Manager', 'Mathematics',         'recommended'),
  ('Retail & Customer Service', 'Retail Manager', 'Economics',           'useful'),
  ('Retail & Customer Service', 'Retail Manager', 'Administration and IT','useful'),

  ('Retail & Customer Service', 'Shop Assistant / Sales Associate', 'English',              'essential'),
  ('Retail & Customer Service', 'Shop Assistant / Sales Associate', 'Mathematics',          'recommended'),
  ('Retail & Customer Service', 'Shop Assistant / Sales Associate', 'Business Management',  'recommended'),
  ('Retail & Customer Service', 'Shop Assistant / Sales Associate', 'Administration and IT','useful'),

  ('Retail & Customer Service', 'E-commerce Specialist', 'Business Management', 'essential'),
  ('Retail & Customer Service', 'E-commerce Specialist', 'Computing Science',   'essential'),
  ('Retail & Customer Service', 'E-commerce Specialist', 'English',             'recommended'),
  ('Retail & Customer Service', 'E-commerce Specialist', 'Mathematics',         'recommended'),
  ('Retail & Customer Service', 'E-commerce Specialist', 'Graphic Communication','useful'),

  ('Retail & Customer Service', 'Supply Chain Coordinator', 'Business Management', 'essential'),
  ('Retail & Customer Service', 'Supply Chain Coordinator', 'Mathematics',         'essential'),
  ('Retail & Customer Service', 'Supply Chain Coordinator', 'Geography',           'recommended'),
  ('Retail & Customer Service', 'Supply Chain Coordinator', 'Economics',           'recommended'),
  ('Retail & Customer Service', 'Supply Chain Coordinator', 'Administration and IT','useful'),

  ('Retail & Customer Service', 'Customer Service Advisor (Call Centre)', 'English',              'essential'),
  ('Retail & Customer Service', 'Customer Service Advisor (Call Centre)', 'Administration and IT','recommended'),
  ('Retail & Customer Service', 'Customer Service Advisor (Call Centre)', 'Business Management',  'recommended'),
  ('Retail & Customer Service', 'Customer Service Advisor (Call Centre)', 'Psychology',           'useful'),

  ('Retail & Customer Service', 'AI-Assisted Customer Experience Manager', 'English',              'essential'),
  ('Retail & Customer Service', 'AI-Assisted Customer Experience Manager', 'Business Management',  'essential'),
  ('Retail & Customer Service', 'AI-Assisted Customer Experience Manager', 'Psychology',           'recommended'),
  ('Retail & Customer Service', 'AI-Assisted Customer Experience Manager', 'Computing Science',    'recommended'),
  ('Retail & Customer Service', 'AI-Assisted Customer Experience Manager', 'Administration and IT','useful'),

  ('Retail & Customer Service', 'Retail Data / AI Analyst', 'Mathematics',         'essential'),
  ('Retail & Customer Service', 'Retail Data / AI Analyst', 'Computing Science',   'essential'),
  ('Retail & Customer Service', 'Retail Data / AI Analyst', 'Data Science',        'recommended'),
  ('Retail & Customer Service', 'Retail Data / AI Analyst', 'Business Management', 'recommended'),
  ('Retail & Customer Service', 'Retail Data / AI Analyst', 'Economics',           'useful'),

  ('Retail & Customer Service', 'Chatbot / AI System Trainer', 'English',          'essential'),
  ('Retail & Customer Service', 'Chatbot / AI System Trainer', 'Computing Science','essential'),
  ('Retail & Customer Service', 'Chatbot / AI System Trainer', 'Psychology',       'recommended'),
  ('Retail & Customer Service', 'Chatbot / AI System Trainer', 'Business Management','useful'),
  ('Retail & Customer Service', 'Chatbot / AI System Trainer', 'Mathematics',      'useful'),

  ('Retail & Customer Service', 'E-commerce Personalisation Specialist', 'Mathematics',         'essential'),
  ('Retail & Customer Service', 'E-commerce Personalisation Specialist', 'Computing Science',   'essential'),
  ('Retail & Customer Service', 'E-commerce Personalisation Specialist', 'Business Management', 'recommended'),
  ('Retail & Customer Service', 'E-commerce Personalisation Specialist', 'Psychology',          'recommended'),
  ('Retail & Customer Service', 'E-commerce Personalisation Specialist', 'Data Science',        'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- HOSPITALITY & TOURISM
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Hospitality & Tourism', 'Chef', 'Practical Cookery',            'essential'),
  ('Hospitality & Tourism', 'Chef', 'Health and Food Technology',   'essential'),
  ('Hospitality & Tourism', 'Chef', 'Hospitality: Practical Cake Craft','recommended'),
  ('Hospitality & Tourism', 'Chef', 'Business Management',          'useful'),
  ('Hospitality & Tourism', 'Chef', 'English',                      'useful'),

  ('Hospitality & Tourism', 'Events Coordinator', 'Business Management','essential'),
  ('Hospitality & Tourism', 'Events Coordinator', 'English',             'essential'),
  ('Hospitality & Tourism', 'Events Coordinator', 'Administration and IT','recommended'),
  ('Hospitality & Tourism', 'Events Coordinator', 'Event Organisation',  'recommended'),
  ('Hospitality & Tourism', 'Events Coordinator', 'Drama',               'useful'),

  ('Hospitality & Tourism', 'Waiter / Waitress / Bar Staff', 'English',         'essential'),
  ('Hospitality & Tourism', 'Waiter / Waitress / Bar Staff', 'Practical Cookery','recommended'),
  ('Hospitality & Tourism', 'Waiter / Waitress / Bar Staff', 'Barista Skills',  'recommended'),
  ('Hospitality & Tourism', 'Waiter / Waitress / Bar Staff', 'Mathematics',     'useful'),

  ('Hospitality & Tourism', 'Restaurant Manager', 'Business Management',  'essential'),
  ('Hospitality & Tourism', 'Restaurant Manager', 'English',              'essential'),
  ('Hospitality & Tourism', 'Restaurant Manager', 'Mathematics',          'recommended'),
  ('Hospitality & Tourism', 'Restaurant Manager', 'Practical Cookery',    'recommended'),
  ('Hospitality & Tourism', 'Restaurant Manager', 'Health and Food Technology','useful'),

  ('Hospitality & Tourism', 'Hotel Receptionist', 'English',             'essential'),
  ('Hospitality & Tourism', 'Hotel Receptionist', 'Administration and IT','essential'),
  ('Hospitality & Tourism', 'Hotel Receptionist', 'Business Management', 'recommended'),
  ('Hospitality & Tourism', 'Hotel Receptionist', 'French',              'useful'),
  ('Hospitality & Tourism', 'Hotel Receptionist', 'Spanish',             'useful'),

  ('Hospitality & Tourism', 'Hospitality Technology Manager', 'Computing Science',   'essential'),
  ('Hospitality & Tourism', 'Hospitality Technology Manager', 'Business Management', 'essential'),
  ('Hospitality & Tourism', 'Hospitality Technology Manager', 'Administration and IT','recommended'),
  ('Hospitality & Tourism', 'Hospitality Technology Manager', 'English',             'useful'),
  ('Hospitality & Tourism', 'Hospitality Technology Manager', 'Mathematics',         'useful'),

  ('Hospitality & Tourism', 'Guest Experience Designer', 'English',             'essential'),
  ('Hospitality & Tourism', 'Guest Experience Designer', 'Business Management', 'essential'),
  ('Hospitality & Tourism', 'Guest Experience Designer', 'Psychology',          'recommended'),
  ('Hospitality & Tourism', 'Guest Experience Designer', 'Art and Design',      'useful'),
  ('Hospitality & Tourism', 'Guest Experience Designer', 'Media Studies',       'useful'),

  ('Hospitality & Tourism', 'Revenue / Yield Analyst', 'Mathematics',         'essential'),
  ('Hospitality & Tourism', 'Revenue / Yield Analyst', 'Business Management', 'essential'),
  ('Hospitality & Tourism', 'Revenue / Yield Analyst', 'Economics',           'recommended'),
  ('Hospitality & Tourism', 'Revenue / Yield Analyst', 'Computing Science',   'recommended'),
  ('Hospitality & Tourism', 'Revenue / Yield Analyst', 'Data Science',        'useful'),

  ('Hospitality & Tourism', 'Digital Concierge Manager', 'English',             'essential'),
  ('Hospitality & Tourism', 'Digital Concierge Manager', 'Computing Science',   'essential'),
  ('Hospitality & Tourism', 'Digital Concierge Manager', 'Business Management', 'recommended'),
  ('Hospitality & Tourism', 'Digital Concierge Manager', 'Administration and IT','useful'),
  ('Hospitality & Tourism', 'Digital Concierge Manager', 'Psychology',          'useful'),

  ('Hospitality & Tourism', 'Sustainability / Waste Optimisation Specialist', 'Environmental Science','essential'),
  ('Hospitality & Tourism', 'Sustainability / Waste Optimisation Specialist', 'Business Management', 'recommended'),
  ('Hospitality & Tourism', 'Sustainability / Waste Optimisation Specialist', 'Health and Food Technology','recommended'),
  ('Hospitality & Tourism', 'Sustainability / Waste Optimisation Specialist', 'Chemistry',            'useful'),
  ('Hospitality & Tourism', 'Sustainability / Waste Optimisation Specialist', 'Geography',            'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- AGRICULTURE & ENVIRONMENT
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Agriculture & Environment', 'Forestry Worker', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Forestry Worker', 'Environmental Science','recommended'),
  ('Agriculture & Environment', 'Forestry Worker', 'Geography',            'recommended'),
  ('Agriculture & Environment', 'Forestry Worker', 'Physical Education',   'useful'),

  ('Agriculture & Environment', 'Landscape Manager', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Landscape Manager', 'Environmental Science','recommended'),
  ('Agriculture & Environment', 'Landscape Manager', 'Art and Design',       'recommended'),
  ('Agriculture & Environment', 'Landscape Manager', 'Geography',            'useful'),
  ('Agriculture & Environment', 'Landscape Manager', 'Business Management',  'useful'),

  ('Agriculture & Environment', 'Farm Worker', 'Biology',               'essential'),
  ('Agriculture & Environment', 'Farm Worker', 'Environmental Science', 'recommended'),
  ('Agriculture & Environment', 'Farm Worker', 'Chemistry',             'recommended'),
  ('Agriculture & Environment', 'Farm Worker', 'Mathematics',           'useful'),

  ('Agriculture & Environment', 'Agricultural Technician', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Agricultural Technician', 'Environmental Science','essential'),
  ('Agriculture & Environment', 'Agricultural Technician', 'Chemistry',            'recommended'),
  ('Agriculture & Environment', 'Agricultural Technician', 'Mathematics',          'recommended'),
  ('Agriculture & Environment', 'Agricultural Technician', 'Computing Science',    'useful'),

  ('Agriculture & Environment', 'Environmental Consultant', 'Environmental Science','essential'),
  ('Agriculture & Environment', 'Environmental Consultant', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Environmental Consultant', 'Chemistry',            'recommended'),
  ('Agriculture & Environment', 'Environmental Consultant', 'Geography',            'recommended'),
  ('Agriculture & Environment', 'Environmental Consultant', 'English',              'useful'),

  ('Agriculture & Environment', 'Ecologist', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Ecologist', 'Environmental Science','essential'),
  ('Agriculture & Environment', 'Ecologist', 'Chemistry',            'recommended'),
  ('Agriculture & Environment', 'Ecologist', 'Geography',            'recommended'),
  ('Agriculture & Environment', 'Ecologist', 'Mathematics',          'useful'),

  ('Agriculture & Environment', 'Precision Agriculture Technologist', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Precision Agriculture Technologist', 'Computing Science',    'essential'),
  ('Agriculture & Environment', 'Precision Agriculture Technologist', 'Environmental Science','recommended'),
  ('Agriculture & Environment', 'Precision Agriculture Technologist', 'Geography',            'recommended'),
  ('Agriculture & Environment', 'Precision Agriculture Technologist', 'Physics',              'useful'),

  ('Agriculture & Environment', 'Agricultural Data Analyst', 'Mathematics',          'essential'),
  ('Agriculture & Environment', 'Agricultural Data Analyst', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Agricultural Data Analyst', 'Computing Science',    'recommended'),
  ('Agriculture & Environment', 'Agricultural Data Analyst', 'Data Science',         'recommended'),
  ('Agriculture & Environment', 'Agricultural Data Analyst', 'Environmental Science','useful'),

  ('Agriculture & Environment', 'Drone Operator / Pilot', 'Computing Science','essential'),
  ('Agriculture & Environment', 'Drone Operator / Pilot', 'Geography',        'recommended'),
  ('Agriculture & Environment', 'Drone Operator / Pilot', 'Physics',          'recommended'),
  ('Agriculture & Environment', 'Drone Operator / Pilot', 'Mathematics',      'recommended'),
  ('Agriculture & Environment', 'Drone Operator / Pilot', 'Environmental Science','useful'),

  ('Agriculture & Environment', 'Carbon Footprint / Sustainability Officer', 'Environmental Science','essential'),
  ('Agriculture & Environment', 'Carbon Footprint / Sustainability Officer', 'Chemistry',            'essential'),
  ('Agriculture & Environment', 'Carbon Footprint / Sustainability Officer', 'Geography',            'recommended'),
  ('Agriculture & Environment', 'Carbon Footprint / Sustainability Officer', 'Mathematics',          'recommended'),
  ('Agriculture & Environment', 'Carbon Footprint / Sustainability Officer', 'Biology',              'useful'),

  ('Agriculture & Environment', 'Environmental Data Scientist', 'Mathematics',          'essential'),
  ('Agriculture & Environment', 'Environmental Data Scientist', 'Environmental Science','essential'),
  ('Agriculture & Environment', 'Environmental Data Scientist', 'Computing Science',    'essential'),
  ('Agriculture & Environment', 'Environmental Data Scientist', 'Biology',              'recommended'),
  ('Agriculture & Environment', 'Environmental Data Scientist', 'Data Science',         'useful'),

  ('Agriculture & Environment', 'Peatland Restoration Specialist', 'Biology',              'essential'),
  ('Agriculture & Environment', 'Peatland Restoration Specialist', 'Environmental Science','essential'),
  ('Agriculture & Environment', 'Peatland Restoration Specialist', 'Geography',            'recommended'),
  ('Agriculture & Environment', 'Peatland Restoration Specialist', 'Chemistry',            'recommended'),
  ('Agriculture & Environment', 'Peatland Restoration Specialist', 'Computing Science',    'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- PUBLIC SERVICES & GOVERNMENT
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Public Services & Government', 'Policy Analyst / Civil Servant (Fast Stream)', 'Modern Studies', 'essential'),
  ('Public Services & Government', 'Policy Analyst / Civil Servant (Fast Stream)', 'English',        'essential'),
  ('Public Services & Government', 'Policy Analyst / Civil Servant (Fast Stream)', 'History',        'recommended'),
  ('Public Services & Government', 'Policy Analyst / Civil Servant (Fast Stream)', 'Politics',       'recommended'),
  ('Public Services & Government', 'Policy Analyst / Civil Servant (Fast Stream)', 'Mathematics',    'useful'),
  ('Public Services & Government', 'Policy Analyst / Civil Servant (Fast Stream)', 'Sociology',      'useful'),

  ('Public Services & Government', 'Council Officer / Benefits Officer', 'Modern Studies',        'essential'),
  ('Public Services & Government', 'Council Officer / Benefits Officer', 'English',               'essential'),
  ('Public Services & Government', 'Council Officer / Benefits Officer', 'Administration and IT', 'recommended'),
  ('Public Services & Government', 'Council Officer / Benefits Officer', 'Mathematics',           'recommended'),
  ('Public Services & Government', 'Council Officer / Benefits Officer', 'Sociology',             'useful'),

  ('Public Services & Government', 'HR Administrator', 'English',               'essential'),
  ('Public Services & Government', 'HR Administrator', 'Business Management',   'essential'),
  ('Public Services & Government', 'HR Administrator', 'Administration and IT', 'recommended'),
  ('Public Services & Government', 'HR Administrator', 'Psychology',            'recommended'),
  ('Public Services & Government', 'HR Administrator', 'Sociology',             'useful'),

  ('Public Services & Government', 'Administrative Assistant', 'English',               'essential'),
  ('Public Services & Government', 'Administrative Assistant', 'Administration and IT', 'essential'),
  ('Public Services & Government', 'Administrative Assistant', 'Mathematics',           'recommended'),
  ('Public Services & Government', 'Administrative Assistant', 'Business Management',   'useful'),

  ('Public Services & Government', 'Government Chief AI Officer', 'Computing Science','essential'),
  ('Public Services & Government', 'Government Chief AI Officer', 'Modern Studies',   'essential'),
  ('Public Services & Government', 'Government Chief AI Officer', 'English',          'recommended'),
  ('Public Services & Government', 'Government Chief AI Officer', 'Politics',         'recommended'),
  ('Public Services & Government', 'Government Chief AI Officer', 'Philosophy',       'useful'),

  ('Public Services & Government', 'AI Policy Analyst', 'Modern Studies',   'essential'),
  ('Public Services & Government', 'AI Policy Analyst', 'English',          'essential'),
  ('Public Services & Government', 'AI Policy Analyst', 'Computing Science','recommended'),
  ('Public Services & Government', 'AI Policy Analyst', 'Philosophy',       'recommended'),
  ('Public Services & Government', 'AI Policy Analyst', 'Sociology',        'useful'),

  ('Public Services & Government', 'Public Sector AI Adoption Specialist', 'Computing Science',   'essential'),
  ('Public Services & Government', 'Public Sector AI Adoption Specialist', 'Business Management', 'essential'),
  ('Public Services & Government', 'Public Sector AI Adoption Specialist', 'Modern Studies',      'recommended'),
  ('Public Services & Government', 'Public Sector AI Adoption Specialist', 'English',             'recommended'),
  ('Public Services & Government', 'Public Sector AI Adoption Specialist', 'Administration and IT','useful'),

  ('Public Services & Government', 'Digital Transformation Manager', 'Computing Science',   'essential'),
  ('Public Services & Government', 'Digital Transformation Manager', 'Business Management', 'essential'),
  ('Public Services & Government', 'Digital Transformation Manager', 'English',             'recommended'),
  ('Public Services & Government', 'Digital Transformation Manager', 'Mathematics',         'useful'),
  ('Public Services & Government', 'Digital Transformation Manager', 'Modern Studies',      'useful'),

  ('Public Services & Government', 'TechTrack Apprentice', 'Computing Science','essential'),
  ('Public Services & Government', 'TechTrack Apprentice', 'Mathematics',      'essential'),
  ('Public Services & Government', 'TechTrack Apprentice', 'Administration and IT','recommended'),
  ('Public Services & Government', 'TechTrack Apprentice', 'English',          'useful'),

  ('Public Services & Government', 'i.AI Prototyping Specialist', 'Computing Science','essential'),
  ('Public Services & Government', 'i.AI Prototyping Specialist', 'Mathematics',      'essential'),
  ('Public Services & Government', 'i.AI Prototyping Specialist', 'Modern Studies',   'recommended'),
  ('Public Services & Government', 'i.AI Prototyping Specialist', 'English',          'recommended'),
  ('Public Services & Government', 'i.AI Prototyping Specialist', 'Data Science',     'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- SCIENCE & RESEARCH
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Science & Research', 'Bioinformatics Specialist', 'Biology',          'essential'),
  ('Science & Research', 'Bioinformatics Specialist', 'Computing Science','essential'),
  ('Science & Research', 'Bioinformatics Specialist', 'Mathematics',      'essential'),
  ('Science & Research', 'Bioinformatics Specialist', 'Chemistry',        'recommended'),
  ('Science & Research', 'Bioinformatics Specialist', 'Human Biology',    'recommended'),
  ('Science & Research', 'Bioinformatics Specialist', 'Data Science',     'useful'),

  ('Science & Research', 'Research Scientist', 'Biology',      'essential'),
  ('Science & Research', 'Research Scientist', 'Chemistry',    'essential'),
  ('Science & Research', 'Research Scientist', 'Physics',      'recommended'),
  ('Science & Research', 'Research Scientist', 'Mathematics',  'recommended'),
  ('Science & Research', 'Research Scientist', 'English',      'useful'),

  ('Science & Research', 'Environmental Scientist', 'Environmental Science','essential'),
  ('Science & Research', 'Environmental Scientist', 'Biology',              'essential'),
  ('Science & Research', 'Environmental Scientist', 'Chemistry',            'recommended'),
  ('Science & Research', 'Environmental Scientist', 'Geography',            'recommended'),
  ('Science & Research', 'Environmental Scientist', 'Mathematics',          'useful'),

  ('Science & Research', 'Clinical Researcher', 'Biology',      'essential'),
  ('Science & Research', 'Clinical Researcher', 'Human Biology','essential'),
  ('Science & Research', 'Clinical Researcher', 'Chemistry',    'recommended'),
  ('Science & Research', 'Clinical Researcher', 'Mathematics',  'recommended'),
  ('Science & Research', 'Clinical Researcher', 'English',      'useful'),

  ('Science & Research', 'Data Scientist', 'Mathematics',      'essential'),
  ('Science & Research', 'Data Scientist', 'Computing Science','essential'),
  ('Science & Research', 'Data Scientist', 'Data Science',     'recommended'),
  ('Science & Research', 'Data Scientist', 'Physics',          'recommended'),
  ('Science & Research', 'Data Scientist', 'Business Management','useful'),

  ('Science & Research', 'Lab Technician', 'Chemistry',   'essential'),
  ('Science & Research', 'Lab Technician', 'Biology',     'essential'),
  ('Science & Research', 'Lab Technician', 'Mathematics', 'recommended'),
  ('Science & Research', 'Lab Technician', 'Physics',     'recommended'),
  ('Science & Research', 'Lab Technician', 'Laboratory Science','useful'),

  ('Science & Research', 'AI Drug Discovery Scientist', 'Chemistry',        'essential'),
  ('Science & Research', 'AI Drug Discovery Scientist', 'Biology',          'essential'),
  ('Science & Research', 'AI Drug Discovery Scientist', 'Computing Science','essential'),
  ('Science & Research', 'AI Drug Discovery Scientist', 'Mathematics',      'recommended'),
  ('Science & Research', 'AI Drug Discovery Scientist', 'Human Biology',    'useful'),

  ('Science & Research', 'Computational Scientist', 'Mathematics',      'essential'),
  ('Science & Research', 'Computational Scientist', 'Computing Science','essential'),
  ('Science & Research', 'Computational Scientist', 'Physics',          'essential'),
  ('Science & Research', 'Computational Scientist', 'Chemistry',        'recommended'),
  ('Science & Research', 'Computational Scientist', 'Data Science',     'useful'),

  ('Science & Research', 'Laboratory Automation Specialist', 'Engineering Science','essential'),
  ('Science & Research', 'Laboratory Automation Specialist', 'Computing Science',  'essential'),
  ('Science & Research', 'Laboratory Automation Specialist', 'Chemistry',          'recommended'),
  ('Science & Research', 'Laboratory Automation Specialist', 'Physics',            'recommended'),
  ('Science & Research', 'Laboratory Automation Specialist', 'Mathematics',        'useful'),

  ('Science & Research', 'AI Safety Researcher (Scientific)', 'Computing Science','essential'),
  ('Science & Research', 'AI Safety Researcher (Scientific)', 'Mathematics',      'essential'),
  ('Science & Research', 'AI Safety Researcher (Scientific)', 'Philosophy',       'recommended'),
  ('Science & Research', 'AI Safety Researcher (Scientific)', 'Physics',          'recommended'),
  ('Science & Research', 'AI Safety Researcher (Scientific)', 'Biology',          'useful'),

  ('Science & Research', 'Robotics Integration Engineer', 'Physics',             'essential'),
  ('Science & Research', 'Robotics Integration Engineer', 'Mathematics',         'essential'),
  ('Science & Research', 'Robotics Integration Engineer', 'Engineering Science', 'essential'),
  ('Science & Research', 'Robotics Integration Engineer', 'Computing Science',   'recommended'),
  ('Science & Research', 'Robotics Integration Engineer', 'Design and Manufacture','useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- SPORT & FITNESS
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Sport & Fitness', 'Outdoor Activities Instructor', 'Physical Education',    'essential'),
  ('Sport & Fitness', 'Outdoor Activities Instructor', 'Biology',               'recommended'),
  ('Sport & Fitness', 'Outdoor Activities Instructor', 'Geography',             'recommended'),
  ('Sport & Fitness', 'Outdoor Activities Instructor', 'Sport and Fitness',     'recommended'),
  ('Sport & Fitness', 'Outdoor Activities Instructor', 'Duke of Edinburgh Bronze Award','useful'),

  ('Sport & Fitness', 'Sports Coach', 'Physical Education',  'essential'),
  ('Sport & Fitness', 'Sports Coach', 'Biology',             'recommended'),
  ('Sport & Fitness', 'Sports Coach', 'Human Biology',       'recommended'),
  ('Sport & Fitness', 'Sports Coach', 'Psychology',          'recommended'),
  ('Sport & Fitness', 'Sports Coach', 'Sports Leadership',   'useful'),
  ('Sport & Fitness', 'Sports Coach', 'Sport and Fitness',   'useful'),

  ('Sport & Fitness', 'Sports Therapist', 'Biology',            'essential'),
  ('Sport & Fitness', 'Sports Therapist', 'Human Biology',      'essential'),
  ('Sport & Fitness', 'Sports Therapist', 'Physical Education', 'recommended'),
  ('Sport & Fitness', 'Sports Therapist', 'Chemistry',          'recommended'),
  ('Sport & Fitness', 'Sports Therapist', 'Psychology',         'useful'),

  ('Sport & Fitness', 'PE Teacher', 'Physical Education', 'essential'),
  ('Sport & Fitness', 'PE Teacher', 'Biology',            'recommended'),
  ('Sport & Fitness', 'PE Teacher', 'Human Biology',      'recommended'),
  ('Sport & Fitness', 'PE Teacher', 'Psychology',         'recommended'),
  ('Sport & Fitness', 'PE Teacher', 'English',            'useful'),

  ('Sport & Fitness', 'Fitness Instructor / Personal Trainer', 'Physical Education',       'essential'),
  ('Sport & Fitness', 'Fitness Instructor / Personal Trainer', 'Biology',                  'recommended'),
  ('Sport & Fitness', 'Fitness Instructor / Personal Trainer', 'Human Biology',            'recommended'),
  ('Sport & Fitness', 'Fitness Instructor / Personal Trainer', 'Sport and Fitness',        'recommended'),
  ('Sport & Fitness', 'Fitness Instructor / Personal Trainer', 'Exercise and Fitness Leadership','useful'),

  ('Sport & Fitness', 'Leisure Centre Manager', 'Business Management', 'essential'),
  ('Sport & Fitness', 'Leisure Centre Manager', 'Physical Education',  'essential'),
  ('Sport & Fitness', 'Leisure Centre Manager', 'English',             'recommended'),
  ('Sport & Fitness', 'Leisure Centre Manager', 'Mathematics',         'recommended'),
  ('Sport & Fitness', 'Leisure Centre Manager', 'Sport and Fitness',   'useful'),

  ('Sport & Fitness', 'Sports Data Analyst', 'Mathematics',         'essential'),
  ('Sport & Fitness', 'Sports Data Analyst', 'Computing Science',   'essential'),
  ('Sport & Fitness', 'Sports Data Analyst', 'Physical Education',  'recommended'),
  ('Sport & Fitness', 'Sports Data Analyst', 'Data Science',        'recommended'),
  ('Sport & Fitness', 'Sports Data Analyst', 'Biology',             'useful'),

  ('Sport & Fitness', 'Digital Fitness Content Creator', 'English',             'essential'),
  ('Sport & Fitness', 'Digital Fitness Content Creator', 'Physical Education',  'essential'),
  ('Sport & Fitness', 'Digital Fitness Content Creator', 'Digital Media',       'recommended'),
  ('Sport & Fitness', 'Digital Fitness Content Creator', 'Sport and Fitness',   'recommended'),
  ('Sport & Fitness', 'Digital Fitness Content Creator', 'Media Studies',       'useful'),

  ('Sport & Fitness', 'Wearable Technology Specialist', 'Physics',             'essential'),
  ('Sport & Fitness', 'Wearable Technology Specialist', 'Computing Science',   'essential'),
  ('Sport & Fitness', 'Wearable Technology Specialist', 'Human Biology',       'recommended'),
  ('Sport & Fitness', 'Wearable Technology Specialist', 'Mathematics',         'recommended'),
  ('Sport & Fitness', 'Wearable Technology Specialist', 'Physical Education',  'useful'),

  ('Sport & Fitness', 'AI-Enhanced Performance Coach', 'Physical Education',  'essential'),
  ('Sport & Fitness', 'AI-Enhanced Performance Coach', 'Human Biology',       'essential'),
  ('Sport & Fitness', 'AI-Enhanced Performance Coach', 'Computing Science',   'recommended'),
  ('Sport & Fitness', 'AI-Enhanced Performance Coach', 'Psychology',          'recommended'),
  ('Sport & Fitness', 'AI-Enhanced Performance Coach', 'Sport and Fitness',   'useful'),

  ('Sport & Fitness', 'E-sports / Gaming Coach', 'Computing Science',       'essential'),
  ('Sport & Fitness', 'E-sports / Gaming Coach', 'Computer Games Development','essential'),
  ('Sport & Fitness', 'E-sports / Gaming Coach', 'Psychology',              'recommended'),
  ('Sport & Fitness', 'E-sports / Gaming Coach', 'Physical Education',      'useful'),
  ('Sport & Fitness', 'E-sports / Gaming Coach', 'English',                 'useful')
) AS v(sector_name, role_title, subject_name, relevance)
JOIN career_sectors cs ON cs.name = v.sector_name
JOIN career_roles  r  ON r.title  = v.role_title AND r.career_sector_id = cs.id
JOIN subjects      s  ON s.name   = v.subject_name
ON CONFLICT DO NOTHING;

-- ============================================
-- TRANSPORT & LOGISTICS
-- ============================================
INSERT INTO career_role_subjects (career_role_id, subject_id, relevance)
SELECT r.id, s.id, v.relevance
FROM (VALUES
  ('Transport & Logistics', 'Train Driver', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'Train Driver', 'Physics',              'recommended'),
  ('Transport & Logistics', 'Train Driver', 'Engineering Science',  'recommended'),
  ('Transport & Logistics', 'Train Driver', 'English',              'useful'),

  ('Transport & Logistics', 'HGV Driver', 'Mathematics',            'essential'),
  ('Transport & Logistics', 'HGV Driver', 'Geography',              'recommended'),
  ('Transport & Logistics', 'HGV Driver', 'English',                'useful'),
  ('Transport & Logistics', 'HGV Driver', 'Applications of Mathematics','useful'),

  ('Transport & Logistics', 'Delivery Driver', 'Mathematics',        'essential'),
  ('Transport & Logistics', 'Delivery Driver', 'Geography',          'recommended'),
  ('Transport & Logistics', 'Delivery Driver', 'English',            'recommended'),
  ('Transport & Logistics', 'Delivery Driver', 'Administration and IT','useful'),

  ('Transport & Logistics', 'Traffic Planner', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'Traffic Planner', 'Geography',            'essential'),
  ('Transport & Logistics', 'Traffic Planner', 'Physics',              'recommended'),
  ('Transport & Logistics', 'Traffic Planner', 'Modern Studies',       'recommended'),
  ('Transport & Logistics', 'Traffic Planner', 'Computing Science',    'useful'),

  ('Transport & Logistics', 'Logistics Coordinator', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'Logistics Coordinator', 'Business Management',  'essential'),
  ('Transport & Logistics', 'Logistics Coordinator', 'Geography',            'recommended'),
  ('Transport & Logistics', 'Logistics Coordinator', 'Administration and IT','recommended'),
  ('Transport & Logistics', 'Logistics Coordinator', 'Economics',            'useful'),

  ('Transport & Logistics', 'Warehouse Operative', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'Warehouse Operative', 'English',              'recommended'),
  ('Transport & Logistics', 'Warehouse Operative', 'Administration and IT','useful'),
  ('Transport & Logistics', 'Warehouse Operative', 'Business Management',  'useful'),

  ('Transport & Logistics', 'AV Fleet Operations Manager', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'AV Fleet Operations Manager', 'Business Management',  'essential'),
  ('Transport & Logistics', 'AV Fleet Operations Manager', 'Computing Science',    'recommended'),
  ('Transport & Logistics', 'AV Fleet Operations Manager', 'Engineering Science',  'recommended'),
  ('Transport & Logistics', 'AV Fleet Operations Manager', 'Geography',            'useful'),

  ('Transport & Logistics', 'Remote Vehicle Operator', 'Computing Science','essential'),
  ('Transport & Logistics', 'Remote Vehicle Operator', 'Mathematics',      'essential'),
  ('Transport & Logistics', 'Remote Vehicle Operator', 'Physics',          'recommended'),
  ('Transport & Logistics', 'Remote Vehicle Operator', 'Engineering Science','recommended'),
  ('Transport & Logistics', 'Remote Vehicle Operator', 'English',          'useful'),

  ('Transport & Logistics', 'Warehouse Automation / Robotics Engineer', 'Engineering Science','essential'),
  ('Transport & Logistics', 'Warehouse Automation / Robotics Engineer', 'Physics',            'essential'),
  ('Transport & Logistics', 'Warehouse Automation / Robotics Engineer', 'Mathematics',        'essential'),
  ('Transport & Logistics', 'Warehouse Automation / Robotics Engineer', 'Computing Science',  'recommended'),
  ('Transport & Logistics', 'Warehouse Automation / Robotics Engineer', 'Practical Metalworking','useful'),

  ('Transport & Logistics', 'AI Logistics Analyst', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'AI Logistics Analyst', 'Computing Science',    'essential'),
  ('Transport & Logistics', 'AI Logistics Analyst', 'Business Management',  'recommended'),
  ('Transport & Logistics', 'AI Logistics Analyst', 'Geography',            'recommended'),
  ('Transport & Logistics', 'AI Logistics Analyst', 'Data Science',         'useful'),

  ('Transport & Logistics', 'Drone Delivery Operator', 'Computing Science','essential'),
  ('Transport & Logistics', 'Drone Delivery Operator', 'Geography',        'recommended'),
  ('Transport & Logistics', 'Drone Delivery Operator', 'Physics',          'recommended'),
  ('Transport & Logistics', 'Drone Delivery Operator', 'Mathematics',      'recommended'),
  ('Transport & Logistics', 'Drone Delivery Operator', 'Engineering Science','useful'),

  ('Transport & Logistics', 'EV / AV Maintenance Technician', 'Physics',             'essential'),
  ('Transport & Logistics', 'EV / AV Maintenance Technician', 'Engineering Science', 'essential'),
  ('Transport & Logistics', 'EV / AV Maintenance Technician', 'Mathematics',         'recommended'),
  ('Transport & Logistics', 'EV / AV Maintenance Technician', 'Computing Science',   'recommended'),
  ('Transport & Logistics', 'EV / AV Maintenance Technician', 'Practical Metalworking','useful'),

  ('Transport & Logistics', 'Digital Supply Chain Manager', 'Mathematics',          'essential'),
  ('Transport & Logistics', 'Digital Supply Chain Manager', 'Business Management',  'essential'),
  ('Transport & Logistics', 'Digital Supply Chain Manager', 'Computing Science',    'recommended'),
  ('Transport & Logistics', 'Digital Supply Chain Manager', 'Geography',            'recommended'),
  ('Transport & Logistics', 'Digital Supply Chain Manager', 'Economics',            'useful')
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
  total_links   INT;
  roles_under_3 INT;
  roles_missing INT;
BEGIN
  SELECT COUNT(*) INTO total_links FROM career_role_subjects;

  -- Roles with fewer than 3 linked subjects
  SELECT COUNT(*) INTO roles_under_3
    FROM (
      SELECT r.id FROM career_roles r
      LEFT JOIN career_role_subjects crs ON crs.career_role_id = r.id
      GROUP BY r.id
      HAVING COUNT(crs.subject_id) < 3
    ) t;

  -- Roles with zero linked subjects
  SELECT COUNT(*) INTO roles_missing
    FROM career_roles r
    WHERE NOT EXISTS (
      SELECT 1 FROM career_role_subjects crs WHERE crs.career_role_id = r.id
    );

  RAISE NOTICE 'career_role_subjects total: %', total_links;
  RAISE NOTICE 'roles with fewer than 3 linked subjects: %', roles_under_3;
  RAISE NOTICE 'roles with zero linked subjects: %', roles_missing;

  IF total_links < 500 THEN
    RAISE EXCEPTION 'Expected at least 500 role-subject links; got %', total_links;
  END IF;
  IF roles_under_3 > 0 THEN
    RAISE EXCEPTION 'Some roles have fewer than 3 linked subjects (count: %)', roles_under_3;
  END IF;
END $$;

COMMIT;
