-- ============================================
-- SEED COLLEGE ARTICULATION ROUTES
-- 86 routes linking Scottish colleges to universities
-- Source: Scotland's Further Education Colleges
--         Comprehensive Reference Dataset
-- ============================================

DO $$
DECLARE
  -- College IDs
  v_cogc UUID;    -- City of Glasgow College
  v_gcc UUID;     -- Glasgow Clyde College
  v_gkc UUID;     -- Glasgow Kelvin College
  v_ncl UUID;     -- New College Lanarkshire
  v_slc UUID;     -- South Lanarkshire College
  v_ac UUID;      -- Ayrshire College
  v_ec UUID;      -- Edinburgh College
  v_wlc UUID;     -- West Lothian College
  v_bc UUID;      -- Borders College
  v_fc UUID;      -- Fife College
  v_fvc UUID;     -- Forth Valley College
  v_wcs UUID;     -- West College Scotland
  v_dac UUID;     -- Dundee and Angus College
  v_nescol UUID;  -- North East Scotland College
  v_uhi_inv UUID; -- UHI Inverness
  v_uhi_per UUID; -- UHI Perth
  v_uhi_mor UUID; -- UHI Moray
  v_uhi_arg UUID; -- UHI Argyll
  v_uhi_nwh UUID; -- UHI North, West and Hebrides
  v_uhi_ork UUID; -- UHI Orkney
  v_uhi_she UUID; -- UHI Shetland
  v_smo UUID;     -- Sabhal Mor Ostaig UHI
  v_dgc UUID;     -- Dumfries and Galloway College

  -- University IDs
  v_glasgow UUID;
  v_rgu UUID;
  v_abertay UUID;
  v_dundee UUID;
  v_hw UUID;         -- Heriot-Watt
  v_napier UUID;
  v_uws UUID;
  v_uhi UUID;
  v_gcu UUID;
  v_strathclyde UUID;
  v_gsa UUID;
  v_qmu UUID;
  v_stirling UUID;
  v_aberdeen UUID;
BEGIN
  -- ============================================
  -- LOOK UP COLLEGE IDs
  -- ============================================
  SELECT id INTO STRICT v_cogc FROM colleges WHERE name = 'City of Glasgow College';
  SELECT id INTO STRICT v_gcc FROM colleges WHERE name = 'Glasgow Clyde College';
  SELECT id INTO STRICT v_gkc FROM colleges WHERE name = 'Glasgow Kelvin College';
  SELECT id INTO STRICT v_ncl FROM colleges WHERE name = 'New College Lanarkshire';
  SELECT id INTO STRICT v_slc FROM colleges WHERE name = 'South Lanarkshire College';
  SELECT id INTO STRICT v_ac FROM colleges WHERE name = 'Ayrshire College';
  SELECT id INTO STRICT v_ec FROM colleges WHERE name = 'Edinburgh College';
  SELECT id INTO STRICT v_wlc FROM colleges WHERE name = 'West Lothian College';
  SELECT id INTO STRICT v_bc FROM colleges WHERE name = 'Borders College';
  SELECT id INTO STRICT v_fc FROM colleges WHERE name = 'Fife College';
  SELECT id INTO STRICT v_fvc FROM colleges WHERE name = 'Forth Valley College';
  SELECT id INTO STRICT v_wcs FROM colleges WHERE name = 'West College Scotland';
  SELECT id INTO STRICT v_dac FROM colleges WHERE name = 'Dundee and Angus College';
  SELECT id INTO STRICT v_nescol FROM colleges WHERE name = 'North East Scotland College';
  SELECT id INTO STRICT v_uhi_inv FROM colleges WHERE name = 'UHI Inverness';
  SELECT id INTO STRICT v_uhi_per FROM colleges WHERE name = 'UHI Perth';
  SELECT id INTO STRICT v_uhi_mor FROM colleges WHERE name = 'UHI Moray';
  SELECT id INTO STRICT v_uhi_arg FROM colleges WHERE name = 'UHI Argyll';
  SELECT id INTO STRICT v_uhi_nwh FROM colleges WHERE name = 'UHI North, West and Hebrides';
  SELECT id INTO STRICT v_uhi_ork FROM colleges WHERE name = 'UHI Orkney';
  SELECT id INTO STRICT v_uhi_she FROM colleges WHERE name = 'UHI Shetland';
  SELECT id INTO STRICT v_smo FROM colleges WHERE name = 'Sabhal Mor Ostaig UHI';
  SELECT id INTO STRICT v_dgc FROM colleges WHERE name = 'Dumfries and Galloway College';

  -- ============================================
  -- LOOK UP UNIVERSITY IDs
  -- ============================================
  SELECT id INTO STRICT v_glasgow FROM universities WHERE slug = 'glasgow';
  SELECT id INTO STRICT v_rgu FROM universities WHERE slug = 'rgu';
  SELECT id INTO STRICT v_abertay FROM universities WHERE slug = 'abertay';
  SELECT id INTO STRICT v_dundee FROM universities WHERE slug = 'dundee';
  SELECT id INTO STRICT v_hw FROM universities WHERE slug = 'heriot-watt';
  SELECT id INTO STRICT v_napier FROM universities WHERE slug = 'napier';
  SELECT id INTO STRICT v_uws FROM universities WHERE slug = 'uws';
  SELECT id INTO STRICT v_uhi FROM universities WHERE slug = 'uhi';
  SELECT id INTO STRICT v_gcu FROM universities WHERE slug = 'gcu';
  SELECT id INTO STRICT v_strathclyde FROM universities WHERE slug = 'strathclyde';
  SELECT id INTO STRICT v_gsa FROM universities WHERE slug = 'gsa';
  SELECT id INTO STRICT v_qmu FROM universities WHERE slug = 'qmu';
  SELECT id INTO STRICT v_stirling FROM universities WHERE slug = 'stirling';
  SELECT id INTO STRICT v_aberdeen FROM universities WHERE slug = 'aberdeen';

  -- ============================================
  -- GROUP 1: UNIVERSITY OF GLASGOW
  -- Widening Participation pathways (SIMD 1-4)
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, is_widening_participation, wp_eligibility, notes)
  VALUES
    (v_gcc, v_glasgow, 'HNC Applied Science', 7, 'BSc Life Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_gcc, v_glasgow, 'HNC Social Science', 7, 'MA Social Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_gkc, v_glasgow, 'HNC Applied Science', 7, 'BSc Life Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_gkc, v_glasgow, 'HNC Mechanical Engineering', 7, 'BEng Mechanical Engineering', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_gkc, v_glasgow, 'HNC Social Science', 7, 'MA Social Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_slc, v_glasgow, 'HNC Applied Science', 7, 'BSc Life Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_slc, v_glasgow, 'HNC Social Sciences', 7, 'MA Social Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_ac, v_glasgow, 'HNC Applied Sciences', 7, 'BSc Life Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_ac, v_glasgow, 'HNC Mechanical Engineering', 7, 'BEng Mechanical Engineering', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway'),
    (v_wcs, v_glasgow, 'HNC Social Sciences', 7, 'MA Social Sciences', 2, true, 'SIMD deciles 1-4', 'University of Glasgow widening participation pathway');

  -- ============================================
  -- GROUP 2: ROBERT GORDON UNIVERSITY
  -- NESCol primary articulation partner
  -- 80+ pathways, 400+ students per year
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_nescol, v_rgu, 'HND Accounting', 8, 'BA Accounting & Finance', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Applied Sciences', 8, 'BSc Applied Bioscience', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Business', 8, 'BA Business & Management', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Cyber Security', 8, 'BSc Cyber Security', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Electrical Engineering', 8, 'BEng Electronic & Electrical Engineering', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Mechanical Engineering', 8, 'BEng Mechanical Engineering', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Photography', 8, 'BA Photography', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Social Sciences', 8, 'BA Applied Social Sciences', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Software Development', 8, 'BSc Computer Science', 3, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HNC Healthcare Practice', 7, 'BSc Nursing', 2, 'NESCol-RGU articulation partnership'),
    (v_nescol, v_rgu, 'HND Media & Communication', 8, 'BA Journalism', 3, 'NESCol-RGU articulation partnership');

  -- ============================================
  -- GROUP 3: ABERTAY UNIVERSITY
  -- Dundee and Angus College primary partner
  -- ~1/3 of Abertay intake from D&A
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_dac, v_abertay, 'HND Computing', 8, 'BSc Computing', 3, 'D&A College primary articulation partner — approx. one-third of Abertay intake'),
    (v_dac, v_abertay, 'HND Business', 8, 'BA Business Management', 3, 'D&A College primary articulation partner'),
    (v_dac, v_abertay, 'HND Art & Design', 8, 'BA Art & Design', 3, 'D&A College primary articulation partner'),
    (v_dac, v_abertay, 'HND Social Sciences', 8, 'BA Social Sciences', 3, 'D&A College primary articulation partner'),
    (v_dac, v_abertay, 'HND Sport & Fitness', 8, 'BSc Sport & Exercise', 3, 'D&A College primary articulation partner');

  -- ============================================
  -- GROUP 4: UNIVERSITY OF DUNDEE
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_dac, v_dundee, 'HNC Social Sciences', 7, 'MA Humanities', 2, NULL),
    (v_dac, v_dundee, 'HNC Art & Design', 7, 'BA Art & Design', 2, NULL);

  -- ============================================
  -- GROUP 5: HERIOT-WATT UNIVERSITY
  -- Edinburgh College Associate Student Programme
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_ec, v_hw, 'HNC Computer Science', 7, 'BSc Computer Science', 2, 'Edinburgh College Associate Student Programme'),
    (v_ec, v_hw, 'HND Electrical Engineering', 8, 'BEng Electrical Engineering', 3, 'Edinburgh College Associate Student Programme'),
    (v_bc, v_hw, 'HND Engineering', 8, 'BEng Engineering', 3, 'ELRAH articulation hub'),
    (v_fvc, v_hw, 'HND Engineering', 8, 'BEng Engineering', 3, 'Forth Valley College partnership degree');

  -- ============================================
  -- GROUP 6: EDINBURGH NAPIER UNIVERSITY
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_ec, v_napier, 'HND Business', 8, 'BA Business Management', 3, 'Edinburgh College Associate Student Programme'),
    (v_ec, v_napier, 'HND Computing', 8, 'BSc Computing', 3, 'Edinburgh College Associate Student Programme'),
    (v_ec, v_napier, 'HND Social Sciences', 8, 'BA Social Sciences', 3, 'Edinburgh College articulation route'),
    (v_wlc, v_napier, 'HND Business', 8, 'BA Business Management', 3, 'Delivered on West Lothian College campus'),
    (v_bc, v_napier, 'HND Business', 8, 'BA Business Management', 3, 'ELRAH articulation hub');

  -- ============================================
  -- GROUP 7: ABERTAY - FIFE COLLEGE
  -- Franchise degrees on Fife College campus
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_fc, v_abertay, 'HND Accounting', 8, 'BA Accounting with Finance', 3, 'Franchise degree delivered on Fife College campus'),
    (v_fc, v_abertay, 'HND Business', 8, 'BA Business Management', 3, 'Franchise degree delivered on Fife College campus'),
    (v_fc, v_abertay, 'HND Computing', 8, 'BSc Computing', 3, 'Franchise degree delivered on Fife College campus');

  -- ============================================
  -- GROUP 8: QUEEN MARGARET UNIVERSITY
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_ec, v_qmu, 'HND Events', 8, 'BA Events Management', 3, 'Edinburgh College articulation route'),
    (v_fc, v_qmu, 'HND Events', 8, 'BA Events Management', 3, 'Fife College articulation route');

  -- ============================================
  -- GROUP 9: UWS - NEW COLLEGE LANARKSHIRE
  -- NCL & UWS Undergraduate School (on campus)
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_ncl, v_uws, 'HND Dental Nursing', 8, 'BSc Dental Nursing', 2, 'NCL & UWS Undergraduate School — delivered on NCL campus'),
    (v_ncl, v_uws, 'HND Cyber Security', 8, 'BEng Cyber Security', 2, 'NCL & UWS Undergraduate School — delivered on NCL campus'),
    (v_ncl, v_uws, 'HND Accounting', 8, 'BAcc Accounting', 3, 'NCL & UWS Undergraduate School — delivered on NCL campus'),
    (v_ncl, v_uws, 'HND Business', 8, 'BA Business Enterprise', 3, 'NCL & UWS Undergraduate School — delivered on NCL campus');

  -- ============================================
  -- GROUP 10: UWS - WEST COLLEGE SCOTLAND
  -- Strategic Partnership Agreement
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_wcs, v_uws, 'HND Business', 8, 'BA Business', 3, 'UWS Strategic Partnership Agreement'),
    (v_wcs, v_uws, 'HND Computing', 8, 'BSc Computing', 3, 'UWS Strategic Partnership Agreement'),
    (v_wcs, v_uws, 'HND Engineering', 8, 'BEng Engineering', 3, 'UWS Strategic Partnership Agreement'),
    (v_wcs, v_uws, 'HND Social Sciences', 8, 'BA Social Sciences', 3, 'UWS Strategic Partnership Agreement'),
    (v_wcs, v_uws, 'HND Art & Design', 8, 'BA Art & Design', 3, 'UWS Strategic Partnership Agreement');

  -- ============================================
  -- GROUP 11: UWS - SOUTH LANARKSHIRE
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_slc, v_uws, 'HND Accounting', 8, 'BAcc Accounting', 3, 'BAcc Accounting delivered on SLC campus');

  -- ============================================
  -- GROUP 12: UWS - AYRSHIRE COLLEGE
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_ac, v_uws, 'HND Business', 8, 'BA Business', 3, NULL),
    (v_ac, v_uws, 'HND Computing', 8, 'BSc Computing', 3, NULL),
    (v_ac, v_uws, 'HND Engineering', 8, 'BEng Engineering', 3, NULL);

  -- ============================================
  -- GROUP 13: UWS - DUMFRIES & GALLOWAY
  -- Shares Crichton Estate campus with UWS
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_dgc, v_uws, 'HND Business', 8, 'BA Business', 3, 'Crichton Estate campus shared with UWS'),
    (v_dgc, v_uws, 'HND Computing', 8, 'BSc Computing', 3, 'Crichton Estate campus shared with UWS');

  -- ============================================
  -- GROUP 14: GLASGOW CALEDONIAN UNIVERSITY
  -- Glasgow region college articulation
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_gcc, v_gcu, 'HND Business', 8, 'BA Business', 3, NULL),
    (v_gcc, v_gcu, 'HND Computing', 8, 'BSc Computing', 3, NULL),
    (v_gcc, v_gcu, 'HND Art & Design', 8, 'BA Art & Design', 3, NULL),
    (v_gkc, v_gcu, 'HND Business', 8, 'BA Business', 3, NULL),
    (v_gkc, v_gcu, 'HND Computing', 8, 'BSc Computing', 3, NULL),
    (v_cogc, v_gcu, 'HND Business', 8, 'BA Business', 3, NULL),
    (v_cogc, v_gcu, 'HND Computing', 8, 'BSc Computing', 3, NULL),
    (v_cogc, v_gcu, 'HND Health & Social Care', 8, 'BSc Health Studies', 3, NULL);

  -- ============================================
  -- GROUP 15: UNIVERSITY OF STRATHCLYDE
  -- City of Glasgow College articulation
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_cogc, v_strathclyde, 'HND Engineering', 8, 'BEng Engineering', 3, NULL),
    (v_cogc, v_strathclyde, 'HND Business', 8, 'BA Business', 3, NULL);

  -- ============================================
  -- GROUP 16: GLASGOW SCHOOL OF ART
  -- Associate Student Scheme
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_gcc, v_gsa, 'HND Art & Design', 8, 'BA Fine Art', 3, 'Glasgow School of Art Associate Student Scheme at Langside Campus');

  -- ============================================
  -- GROUP 17: UNIVERSITY OF STIRLING
  -- Forth Valley College partnership
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_fvc, v_stirling, 'HND Business', 8, 'BA Business Studies', 3, 'Forth Valley College partnership degree'),
    (v_fvc, v_stirling, 'HND Computing', 8, 'BSc Computing', 3, 'Forth Valley College partnership degree'),
    (v_fvc, v_stirling, 'HND Social Sciences', 8, 'BA Social Sciences', 3, 'Forth Valley College partnership degree');

  -- ============================================
  -- GROUP 18: UNIVERSITY OF ABERDEEN
  -- NESCol articulation routes
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    (v_nescol, v_aberdeen, 'HND Engineering', 8, 'BEng Engineering', 3, NULL),
    (v_nescol, v_aberdeen, 'HND Science', 8, 'BSc Science', 3, NULL);

  -- ============================================
  -- GROUP 19: UHI INTERNAL PROGRESSION
  -- Seamless HNC/HND → UHI degree pathways
  -- All UHI partner colleges
  -- ============================================
  INSERT INTO college_articulation (college_id, university_id, college_qualification, college_scqf_level, university_degree, entry_year, notes)
  VALUES
    -- UHI Inverness
    (v_uhi_inv, v_uhi, 'HNC Forestry', 7, 'BSc Forest Management', 2, 'UHI internal progression — Scottish School of Forestry'),
    (v_uhi_inv, v_uhi, 'HND Computing', 8, 'BSc Computing', 3, 'UHI internal progression'),

    -- UHI Perth
    (v_uhi_per, v_uhi, 'HNC Sport & Fitness', 7, 'BSc Sport & Fitness', 2, 'UHI internal progression — Academy of Sport and Wellbeing'),
    (v_uhi_per, v_uhi, 'HND Business', 8, 'BA Business', 3, 'UHI internal progression'),

    -- UHI Moray
    (v_uhi_mor, v_uhi, 'HNC Art', 7, 'BA Fine Art', 2, 'UHI internal progression — Moray School of Art'),
    (v_uhi_mor, v_uhi, 'HND Social Sciences', 8, 'BA Social Sciences', 3, 'UHI internal progression'),

    -- UHI Argyll
    (v_uhi_arg, v_uhi, 'HNC Social Sciences', 7, 'BA Health & Social Studies', 2, 'UHI internal progression'),
    (v_uhi_arg, v_uhi, 'HND Business', 8, 'BA Business', 3, 'UHI internal progression'),

    -- UHI North, West and Hebrides
    (v_uhi_nwh, v_uhi, 'HNC Adventure Tourism', 7, 'BA Adventure Tourism', 2, 'UHI internal progression — School of Adventure Studies, Fort William'),
    (v_uhi_nwh, v_uhi, 'HND Computing', 8, 'BSc Computing', 3, 'UHI internal progression'),

    -- UHI Orkney
    (v_uhi_ork, v_uhi, 'HNC Archaeology', 7, 'BA Archaeology', 2, 'UHI internal progression — UHI Archaeology Institute'),
    (v_uhi_ork, v_uhi, 'HND Social Sciences', 8, 'BA Social Sciences', 3, 'UHI internal progression'),

    -- UHI Shetland
    (v_uhi_she, v_uhi, 'HNC Marine Science', 7, 'BSc Marine Science', 2, 'UHI internal progression — Scalloway campus'),
    (v_uhi_she, v_uhi, 'HND Engineering', 8, 'BEng Engineering', 3, 'UHI internal progression'),

    -- Sabhal Mor Ostaig UHI
    (v_smo, v_uhi, 'HNC Gaelic', 7, 'BA Gaelic', 2, 'UHI internal progression — Scotland''s National Centre for Gaelic'),
    (v_smo, v_uhi, 'HND Gaelic & Media', 8, 'BA Gaelic & Media Studies', 3, 'UHI internal progression');

END $$;
