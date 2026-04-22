-- Healthcare & Medicine horizon ratings retrofit
-- 19 roles: ai_rating_2030_2035, ai_rating_2040_2045, robotics_rating_2030_2035,
--           robotics_rating_2040_2045, robotics_description
-- Evidence base: Anthropic Economic Index (Jan + Mar 2026); NHS Scotland AI pilots;
--               robotics deployment rubric (UK lag, humanoid 2026 commercialisation)
-- Pilot-rated rows NOT touched: Doctor / GP, Nurse, Paramedic
-- Physiotherapist confirmed NOT pilot-rated in DB; retrofitted here with rubric-derived values
-- No BEGIN/COMMIT -- transaction boundary owned by applying tool

UPDATE career_roles
SET
  ai_rating_2030_2035      = 9,
  ai_rating_2040_2045      = 10,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 1,
  robotics_description     = 'Pure AI/data analysis role with no physical component. Work happens at a screen analysing NHS Scotland clinical datasets, interpreting model outputs, and communicating findings to clinical teams. Robotics has no direct impact on the role in either horizon. The ai_rating progression reflects that this role already exists to work with AI and will become more embedded as NHS Scotland AI adoption matures.'
WHERE title = 'AI Healthcare Data Analyst'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 9,
  ai_rating_2040_2045      = 9,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 2,
  robotics_description     = 'Senior nursing leadership role governing digital and AI systems across NHS Scotland Health Boards. The role supervises AI clinical decision support, ambient documentation tools, and workforce automation programmes. Physical presence on wards remains part of the role -- robotics peripherally visible through deployment of autonomous logistics robots in NHS hospital corridors and automated pharmacy dispensing, but not the core function. Rating stays 2 across both horizons because leadership and ethical oversight are insulated from direct automation.'
WHERE title = 'Chief Nursing Information Officer (CNIO)'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 10,
  ai_rating_2040_2045      = 10,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 1,
  robotics_description     = 'AI-native role -- exists specifically because AI exists. Work involves validating clinical AI systems, auditing model performance, investigating patient safety incidents involving AI, and regulatory compliance (MHRA, NHS Digital, Qualifications Scotland training standards). No physical dimension; pure knowledge and governance work. Robotics ratings stay at 1 across both horizons.'
WHERE title = 'Clinical AI Safety Specialist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 8,
  ai_rating_2040_2045      = 9,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 2,
  robotics_description     = 'Role bridges clinical practice and health informatics, increasingly focused on deploying AI tools in NHS Scotland settings. Work is primarily cognitive and system-design focused, with periodic ward-based observation and clinical team engagement. Robotics deployment in hospital logistics and dispensing affects the environment the informatician operates in but does not displace the role. Rating stays at 2 across both horizons.'
WHERE title = 'Clinical Informatician'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 4,
  ai_rating_2040_2045      = 5,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description     = 'Dentistry combines licensed manual craft (drilling, extractions, restorations) with diagnostic work. CAD/CAM systems for crowns and veneers are already widespread in Scottish dental practices; robotic drilling pilots exist but are not mainstream. By 2030-2035 AI-generated treatment plans and robotic guidance for implants become standard in larger practices. Core chairside work -- patient communication, fine-motor dexterity in a confined oral cavity, complex case judgement -- remains human through both horizons. GDC registration and the requirement for a licensed dentist to sign off treatment anchor the robotics rating below 5 even at mid-career.'
WHERE title = 'Dentist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 5,
  ai_rating_2040_2045      = 6,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 2,
  robotics_description     = 'HCPC-registered AHP focused on nutritional assessment and intervention. AI is reshaping meal planning, macro/micronutrient analysis, and patient-facing dietary advice tools -- the dietitian role shifts toward complex clinical cases (renal, eating disorders, paediatric, oncology) where judgement and therapeutic relationship matter. Robotics has minimal direct impact: the work is consultation-based and screen-supported. Robotic kitchen systems in hospital catering affect the environment but not the dietitian''s role.'
WHERE title = 'Dietitian'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 8,
  ai_rating_2040_2045      = 9,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description     = 'AI-heavy pharmacy role focused on digital prescribing systems, medicines optimisation, and clinical decision support across NHS Scotland. By 2030-2035 robotic pharmacy dispensing is the NHS Scotland standard in acute settings and automated community pharmacy assembly is widespread. The human specialist focuses on complex medication reviews, clinical problem-solving, and governance of the automated systems themselves. Rating reflects increasing deployment of physical dispensing automation in the environment the role operates in.'
WHERE title = 'Digital Medicines Specialist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 8,
  ai_rating_2040_2045      = 9,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 1,
  robotics_description     = 'Pure data and analytics role with no physical component. Work occurs at a screen across NHS Scotland data assets, public health datasets (Public Health Scotland), and academic-industry collaborations (e.g. University of Edinburgh, Usher Institute). AI becomes increasingly central to the role (hence rising ai_rating); robotics has no direct impact across either horizon.'
WHERE title = 'Health Data Scientist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 3,
  ai_rating_2040_2045      = 3,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 5,
  robotics_description     = 'Frontline care work is deeply physical and relational -- helping with personal care, mobilising patients, feeding, communication. AI pressure is low: the work defies automation at a task level. Robotics exposure is more significant. By 2030-2035 lifting aids, automated monitoring, and robotic logistics reduce some physical burden without displacing the worker. By 2040-2045 humanoid robots begin deployment in care home settings for routine tasks (lifting, transport, some social engagement) -- this is the sector Scottish demographic pressures (ageing population, rural labour shortages) will likely accelerate adoption. Rating reflects meaningful task-level displacement at mid-career, though the relational core of care work resists full automation.'
WHERE title = 'Healthcare Assistant / Care Worker'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 4,
  ai_rating_2040_2045      = 5,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description     = 'NMC-registered specialist nursing role centred on therapeutic relationship and crisis intervention. AI supports risk assessment, documentation, and remote monitoring but the core therapeutic relationship resists automation. Robotics exposure is low and growing -- some ward-based automation (logistics, medication dispensing) affects the environment. Scotland faces significant and sustained mental health workforce shortages; the role is in strong demand and projected growth offsets any automation concerns through both horizons.'
WHERE title = 'Mental Health Nurse'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 3,
  ai_rating_2040_2045      = 4,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description     = 'Midwifery is a licensed, relational profession centred on supporting women through pregnancy, labour, and postnatal care. AI pressure is low -- clinical decision support and documentation automation augment rather than displace. Robotics exposure grows slowly: automated monitoring during labour and robotic logistics in maternity wards become standard, but the hands-on clinical work, continuous support during labour, and complex decision-making under pressure remain human. NMC registration and statutory midwifery lead requirements under Scottish Government policy anchor the ratings low across both horizons.'
WHERE title = 'Midwife'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 4,
  ai_rating_2040_2045      = 5,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description     = 'HCPC-registered AHP focused on enabling activities of daily living through assessment and intervention. AI augments assessment tools, outcome tracking, and assistive technology recommendations. Robotics impact is low and growing -- home automation, robotic mobility aids, and smart home systems are the hardware tools the OT prescribes and trains clients to use. The therapeutic relationship, home visit work, and complex case formulation resist automation. NHS Scotland community OT roles remain in demand given Scotland''s ageing population.'
WHERE title = 'Occupational Therapist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 5,
  ai_rating_2040_2045      = 6,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description     = 'AI retinal image analysis is already embedded in Scottish optometry -- the NeurEYE project from Edinburgh uses retinal scans to detect early-stage dementia and is being rolled out across NHS Scotland General Ophthalmic Services. By 2030-2035 AI-first analysis with optometrist verification is routine. Robotic automated phoropters and OCT imaging systems continue to streamline the examination. Clinical judgement, patient communication, referral decisions, and independent prescribing under NHS Scotland GOS retain the human element. GOC registration and the legal accountability of the eye examination anchor the role.'
WHERE title = 'Optometrist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 5,
  ai_rating_2040_2045      = 6,
  robotics_rating_2030_2035 = 4,
  robotics_rating_2040_2045 = 5,
  robotics_description     = 'Pharmacy is unusual in the Healthcare sector for having significant robotics exposure. Robotic dispensing systems are already standard in NHS Scotland hospital pharmacies, and community pharmacy automation (robotic prescription assembly, automated stock management) accelerates through 2030-2035. By mid-career the majority of dispensing tasks are automated; the human pharmacist focuses on clinical medication review, complex polypharmacy cases, and independent prescribing under the NHS Scotland community pharmacy contract. GPhC registration and legal accountability for dispensing decisions cap the role from full automation.'
WHERE title = 'Pharmacist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 4,
  ai_rating_2040_2045      = 5,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description     = 'HCPC-registered AHP with a 4-year degree route in Scotland. Core work -- manual therapy, exercise prescription, movement rehabilitation, and patient education -- is physical and relational, with low AI displacement. Robotics exposure is moderate and growing: robotic rehabilitation platforms (exoskeletons, assisted treadmill systems, automated resistance training) are deployed in NHS Scotland inpatient rehabilitation units and expanding into community settings. By 2030-2035, physiotherapists increasingly prescribe, calibrate, and supervise robotic rehab devices as part of standard NHS rehabilitation pathways. Mid-career rating reflects wider deployment of robotic-assisted rehabilitation across stroke, orthopaedic, and neurological services. Manual therapy and complex assessment remain human throughout both horizons.'
WHERE title = 'Physiotherapist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 6,
  ai_rating_2040_2045      = 7,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description     = 'Radiography is the most AI-exposed clinical role because image interpretation is directly in AI''s capability zone. NHS Scotland has been piloting AI-assisted reporting for chest X-rays and screening programmes; by 2030-2035 AI-first reporting with radiographer verification is routine. Robotic patient positioning and automated imaging systems reduce some hands-on burden. The human radiographer role shifts toward complex imaging, interventional radiography, quality assurance, and patient communication. HCPC registration and clinical accountability for safety-critical imaging decisions anchor the role at mid-career despite high AI capability.'
WHERE title = 'Radiographer'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 5,
  ai_rating_2040_2045      = 6,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description     = 'HCPC-registered AHP. AI-powered speech analysis, personalised communication aid generation, and automated therapy delivery via apps/devices expand through both horizons. The therapeutic relationship and complex case formulation (stroke rehabilitation, paediatric developmental disorders, autism-related communication) remain human. Robotics exposure rises modestly as augmentative and alternative communication (AAC) devices become more capable -- the SLT role increasingly involves prescribing, training, and supporting use of AI-powered communication technology.'
WHERE title = 'Speech and Language Therapist'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 3,
  ai_rating_2040_2045      = 4,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description     = 'RCVS-registered support profession. Work is heavily physical -- animal handling, assisting in surgery, monitoring anaesthesia, patient care. AI affects practice management and some imaging workflow but not the hands-on care. Robotics exposure grows slowly: automated drug dispensing, patient monitoring, and theatre logistics become more common by 2030-2035. Mid-career rating reflects wider deployment of automation in larger veterinary practices; rural mixed practice and smaller clinics retain manual work longer.'
WHERE title = 'Veterinary Nurse'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');

UPDATE career_roles
SET
  ai_rating_2030_2035      = 4,
  ai_rating_2040_2045      = 5,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description     = 'RCVS-registered profession combining clinical consultation, surgery, and diagnostic work. AI imaging interpretation (radiology, pathology) and diagnostic decision support are already deployed in larger Scottish veterinary practices; by 2030-2035 AI-first diagnosis is routine. Surgical work retains manual dexterity and case-by-case judgement; patient handling is inherently physical. Robotic surgical platforms are emerging in veterinary medicine (mirroring human surgical robotics) but remain specialist and expensive through both horizons. Mixed and large-animal practice in rural Scotland retains lowest robotics exposure.'
WHERE title = 'Veterinary Surgeon'
  AND career_sector_id = (SELECT id FROM career_sectors WHERE name = 'Healthcare & Medicine');
