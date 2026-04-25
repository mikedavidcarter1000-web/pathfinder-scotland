-- Align career_sectors.example_jobs with exact career_roles.title values.
-- The sector detail page uses a 5-pass fuzzy matcher; ~103/190 example jobs
-- previously failed to match any role in their sector, so those cards had no
-- image and were not clickable.  Each array below uses exact career_roles.title
-- strings that are guaranteed to match on pass 1 (exact).
-- Where a sector has more than 10 roles the 10 most representative are chosen.
-- Where a sector has fewer than 10 roles all available roles are included.
--
-- ROLES TO ADD IN A FUTURE CONTENT SESSION (title exists in example_jobs but
-- no matching career_roles row exists anywhere in the database):
--
--   Agriculture & Environment  : Gamekeeper, Conservation Officer, Agricultural Scientist
--   Business & Finance         : Auditor (standalone), Bank Manager, Investment Analyst
--   Computing & Digital Tech   : Web Developer, Network Engineer, Database Administrator
--   Construction & Trades      : Building Inspector
--   Creative Arts & Design     : Interior Designer, Product Designer, Jewellery Designer, Textile Designer
--   Education & Teaching       : Music Teacher
--   Healthcare & Medicine      : Clinical Psychologist
--   Hospitality & Tourism      : Hotel Manager, Tour Guide, Travel Agent, Barista, Sommelier,
--                                Visitor Attraction Manager, Conference Organiser
--   Law & Justice              : Probation Officer, Legal Executive, Immigration Adviser,
--                                Victims Support Worker
--   Media & Communications     : Content Creator
--   Performing Arts            : Arts Administrator
--   Public Services            : Diplomat, Town Planner, Environmental Health Officer,
--                                Trading Standards Officer, Benefits Adviser (standalone)
--   Retail & Customer Service  : Buyer, Store Planner, Personal Shopper
--   Science & Research         : Biomedical Scientist, Marine Biologist, Geologist,
--                                Forensic Scientist, Food Scientist, Meteorologist,
--                                Conservation Scientist
--   Social Work & Community    : Refugee Support Worker, Advocacy Officer
--   Sport & Fitness            : Sports Scientist, Sports Development Officer, Nutritionist,
--                                Sports Journalist
--   Transport & Logistics      : Rail Signaller, Transport Planner, Supply Chain Analyst (standalone)

-- Agriculture & Environment (14 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Farm Worker',
  'Forestry Worker',
  'Ecologist',
  'Environmental Consultant',
  'Agricultural Technician',
  'Animal Care Worker',
  'Gardener / Landscape Gardener',
  'Carbon Footprint / Sustainability Officer',
  'Peatland Restoration Specialist',
  'Precision Agriculture Technologist'
]
WHERE name = 'Agriculture & Environment';

-- Armed Forces (15 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Army Officer',
  'Army Soldier -- Infantry',
  'Royal Navy Officer',
  'Royal Navy Rating',
  'RAF Officer',
  'RAF Airman / Airwoman',
  'Royal Marines Commando',
  'Army Engineer (Royal Engineers)',
  'Submarine Warfare Specialist',
  'Naval Engineer (Marine / Weapons)'
]
WHERE name = 'Armed Forces';

-- Business & Finance (30 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Accountant (Qualified)',
  'Financial Adviser',
  'Business Analyst',
  'Actuary',
  'Insurance Underwriter',
  'Tax Adviser',
  'Management Consultant',
  'Investment Banker',
  'Economist',
  'HR Manager / Recruitment Consultant'
]
WHERE name = 'Business & Finance';

-- Computing & Digital Technology (13 roles available -- 10 selected)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Junior Software Developer',
  'Senior Software Developer',
  'Data Analyst',
  'Cybersecurity Analyst',
  'AI / ML Engineer',
  'Data Engineer',
  'IT Support Technician',
  'AI Safety Researcher',
  'AI Ethics Officer',
  'AI Product Manager'
]
WHERE name = 'Computing & Digital Technology';

-- Construction & Trades (20 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Electrician',
  'Plumber',
  'Joiner / Carpenter',
  'Bricklayer',
  'Painter and Decorator',
  'Roofer / Slater',
  'Plasterer',
  'Site Manager',
  'Quantity Surveyor',
  'Architect'
]
WHERE name = 'Construction & Trades';

-- Creative Arts & Design (16 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Graphic Designer',
  'Animator',
  'Illustrator',
  'Fashion Designer',
  'Photographer',
  'UX Designer',
  'Video Editor',
  'Games Artist',
  'Hairdresser / Barber',
  'Beautician / Beauty Therapist'
]
WHERE name = 'Creative Arts & Design';

-- Education & Teaching (17 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Primary Teacher',
  'Secondary Teacher',
  'Nursery Practitioner / Childcare Worker',
  'Educational Psychologist',
  'Additional Support Needs Teacher',
  'Teaching Assistant',
  'Higher Education Lecturer',
  'School Librarian',
  'Early Years Teacher',
  'Vocational Trainer / Instructor'
]
WHERE name = 'Education & Teaching';

-- Engineering & Manufacturing (26 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Mechanical Engineer',
  'Electrical Engineer',
  'Chemical Engineer',
  'Structural Engineer',
  'Aerospace Engineer',
  'Renewable Energy Engineer',
  'Robotics Technician',
  'Nuclear Engineer',
  'Process Engineer',
  'Wind Turbine Engineer / Technician'
]
WHERE name = 'Engineering & Manufacturing';

-- Healthcare & Medicine (24 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Doctor / GP',
  'Nurse',
  'Dentist',
  'Pharmacist',
  'Paramedic',
  'Physiotherapist',
  'Radiographer',
  'Occupational Therapist',
  'Midwife',
  'Veterinary Surgeon'
]
WHERE name = 'Healthcare & Medicine';

-- Hospitality & Tourism (14 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Chef (Professional Kitchen)',
  'Restaurant Manager',
  'Events Coordinator',
  'Hotel Receptionist',
  'Bar Staff',
  'Kitchen / Catering Assistant',
  'Waiter / Waitress / Bar Staff',
  'Digital Concierge Manager',
  'Guest Experience Designer',
  'Revenue / Yield Analyst'
]
WHERE name = 'Hospitality & Tourism';

-- Law & Justice (14 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Solicitor (Junior/Trainee)',
  'Solicitor (Senior) / Partner',
  'Advocate',
  'Legal Secretary',
  'Police Officer',
  'Prison Officer',
  'Paralegal',
  'Procurator Fiscal Depute',
  'Court Clerk',
  'Legal Technologist'
]
WHERE name = 'Law & Justice';

-- Media & Communications (10 roles available -- all 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Broadcast Journalist',
  'TV / Film Producer',
  'Public Relations Officer',
  'Social Media Manager',
  'Copywriter',
  'Communications Officer',
  'Publishing Editor',
  'Broadcast Technician',
  'AI News Verification Specialist',
  'Automated Media Monitoring Analyst'
]
WHERE name = 'Media & Communications';

-- Performing Arts & Entertainment (11 roles available -- 10 selected)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Actor',
  'Musician (Live Performer)',
  'Dancer',
  'Theatre Director',
  'Sound Technician',
  'Lighting Designer',
  'Stage Manager',
  'Choreographer',
  'Music Producer',
  'Virtual Production Technician'
]
WHERE name = 'Performing Arts & Entertainment';

-- Public Services & Government (16 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Firefighter',
  'Policy Analyst / Civil Servant (Fast Stream)',
  'Council Officer / Benefits Officer',
  'Administrative Assistant',
  'Government Administrative Officer',
  'Digital Transformation Manager',
  'AI Policy Analyst',
  'Records Clerk',
  'HR Administrator',
  'Security Guard / Door Supervisor'
]
WHERE name = 'Public Services & Government';

-- Retail & Customer Service (15 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Retail Manager',
  'Visual Merchandiser',
  'Shop Assistant / Sales Associate',
  'E-commerce Specialist',
  'Customer Service Advisor (Call Centre)',
  'Supply Chain Coordinator',
  'Sales Supervisor / Team Leader',
  'Retail Cashier / Checkout Operator',
  'Customer Service Manager',
  'Shopkeeper / Retail Proprietor'
]
WHERE name = 'Retail & Customer Service';

-- Science & Research (11 roles available -- 10 selected)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Research Scientist',
  'Lab Technician',
  'Environmental Scientist',
  'Data Scientist',
  'Bioinformatics Specialist',
  'Clinical Researcher',
  'Computational Scientist',
  'AI Drug Discovery Scientist',
  'AI Safety Researcher (Scientific)',
  'Laboratory Automation Specialist'
]
WHERE name = 'Science & Research';

-- Social Work & Community (15 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'Social Worker',
  'Child Protection Social Worker',
  'Community Development Worker',
  'Youth Worker',
  'Charity Manager',
  'Family Support Worker',
  'Mental Health Support Worker',
  'Addiction Counsellor',
  'Homelessness Support Worker',
  'Counsellor'
]
WHERE name = 'Social Work & Community';

-- Sport & Fitness (12 roles available -- 10 selected)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'PE Teacher',
  'Sports Coach',
  'Fitness Instructor / Personal Trainer',
  'Leisure Centre Manager',
  'Outdoor Activities Instructor',
  'Sports Therapist',
  'Sports Data Analyst',
  'AI-Enhanced Performance Coach',
  'E-sports / Gaming Coach',
  'Wearable Technology Specialist'
]
WHERE name = 'Sport & Fitness';

-- Transport & Logistics (18 roles available -- best 10)
UPDATE career_sectors
SET example_jobs = ARRAY[
  'HGV Driver',
  'Train Driver',
  'Delivery Driver',
  'Warehouse Operative',
  'Logistics Coordinator',
  'Traffic Planner',
  'Airline Pilot',
  'Bus / Coach Driver',
  'Drone Delivery Operator',
  'AI Logistics Analyst'
]
WHERE name = 'Transport & Logistics';
