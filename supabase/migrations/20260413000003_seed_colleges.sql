-- ============================================
-- SEED ALL 24 SCOTTISH COLLEGES
-- Source: Scotland's Further Education Colleges
--         Comprehensive Reference Dataset
-- ============================================

-- ============================================
-- GLASGOW REGION (3)
-- ============================================

-- 1. City of Glasgow College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, has_foundation_apprenticeships, uhi_partner, schools_programme, schools_programme_details, student_count, distinctive_features, qualification_levels)
VALUES (
  'City of Glasgow College',
  'Glasgow',
  'Glasgow',
  'https://www.cityofglasgowcollege.ac.uk',
  '[{"name":"City Campus","address":"190 Cathedral Street, G4 0RF"},{"name":"Riverside Campus","address":"21 Thistle Street, G5 9XB"}]'::jsonb,
  ARRAY['Accounting','Acting & Performance','Architecture','Art & Photography','Business','Computing','Construction','Design','Engineering','Events & Hospitality','Hairdressing & Beauty','Health & Social Care','Languages','Law','Media & Marketing','Nautical & Marine','Professional Cookery','Science','Social Sciences','Sport & Fitness','TV & Podcasting'],
  true,
  'west',
  true,
  false,
  true,
  'NPAs, NQs, HNC Business, languages (Italian Higher, German Higher), NC Mechanical Engineering. Foundation Apprenticeships via Glasgow FA Partnership.',
  27000,
  'Scotland''s largest technical and professional skills college. Nautical and marine engineering qualifications unique to this college in Glasgow.',
  ARRAY['NC','NPA','HNC','HND','DipHE','Degree','SVQ','City & Guilds']
);

-- 2. Glasgow Clyde College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, has_foundation_apprenticeships, has_modern_apprenticeships, ma_frameworks, uhi_partner, distinctive_features)
VALUES (
  'Glasgow Clyde College',
  'Glasgow',
  'Glasgow',
  'https://www.glasgowclyde.ac.uk',
  '[{"name":"Anniesland Campus","postcode":"G12 0YE"},{"name":"Cardonald Campus","postcode":"G52 3AY"},{"name":"Langside Campus","postcode":"G42 9LB"}]'::jsonb,
  ARRAY['Access','Acting & Performance','Art & Design','Automotive','BSL','Business & Finance','Computing','Construction','Dance','Early Learning & Childcare','Electrical & Electronics','Engineering','ESOL','Fashion & Textiles','Hairdressing & Beauty','Health & Social Care','Horticulture','Journalism','Media & Performing Arts','Photography','Science','Social Science','Sport & Fitness','Travel & Tourism'],
  true,
  'west',
  true,
  true,
  ARRAY['Automotive Engineering','Engineering','Fashion & Textiles','Social Services','Playwork'],
  false,
  '79.5% articulation rate (above national average). 32.6% of articulating students from SIMD20. Glasgow School of Art Associate Student Scheme at Langside Campus.'
);

-- 3. Glasgow Kelvin College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'Glasgow Kelvin College',
  'Glasgow',
  'Glasgow',
  'https://www.glasgowkelvin.ac.uk',
  '[{"name":"Springburn Campus","postcode":"G21 4TD"},{"name":"East End Campus","postcode":"G31 3SR"},{"name":"Easterhouse Campus","postcode":"G34 9QF"},{"name":"30+ community learning centres"}]'::jsonb,
  ARRAY['Art & Design','Automotive','Barbering & Beauty','Business Admin','Childcare','Community Development','Computing','Construction','Engineering','ESOL','Fashion','Gaelic','Health & Social Care','Hospitality','Jewellery','Media & Communication','Music','Performing Arts','Photography','Science','Social Science','Sound Recording','Sport & Fitness','Supported Learning','SWAP'],
  true,
  'west',
  false,
  18000,
  'Hosts SWAP West. SWAP Access courses include Access to Premedical Studies & Allied Health, Access to Science, Access to Social Science. Gaelic courses and Jewellery unique in Glasgow. Easterhouse Campus in one of Glasgow''s most deprived areas. STEM Assured Status.'
);

-- ============================================
-- LANARKSHIRE REGION (2)
-- ============================================

-- 4. New College Lanarkshire
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'New College Lanarkshire',
  'Lanarkshire',
  'Motherwell',
  'https://www.nclanarkshire.ac.uk',
  '[{"name":"Motherwell"},{"name":"Coatbridge"},{"name":"Cumbernauld"},{"name":"Kirkintilloch"},{"name":"Broadwood"},{"name":"Hamilton"}]'::jsonb,
  ARRAY['Accounting','Animal Care','Art & Animation','Automotive','Beauty Therapy','Business','CAD','Computing','Construction','Counselling','Dental Nursing','Early Learning & Childcare','Engineering','Film & Photography','Hairdressing','Health & Social Care','Hospitality','Housing','Humanities','Languages','Law & Criminology','Make-up Artistry','Music','Performing Arts','Science','Sport','Supported Learning','SWAP','Travel & Tourism'],
  true,
  'west',
  false,
  17000,
  'Scotland''s College of the Year 2025. NCL & UWS Undergraduate School delivers UWS degrees on campus: BSc Dental Nursing, BSc Collaborative Health and Social Care, BEng Cyber Security, BAcc Accounting, BA Business Enterprise and Marketing.'
);

-- 5. South Lanarkshire College
INSERT INTO colleges (name, region, city, postcode, website_url, campuses, course_areas, uhi_partner, schools_programme, schools_programme_details, distinctive_features)
VALUES (
  'South Lanarkshire College',
  'Lanarkshire',
  'East Kilbride',
  'G75 0NE',
  'https://www.slc.ac.uk',
  '[{"name":"East Kilbride Campus","postcode":"G75 0NE"}]'::jsonb,
  ARRAY['Accounting','Administration & IT','Beauty Therapy','Construction Trades','Business','Childcare','Civil Engineering','Construction Management','Counselling','ESOL','Hairdressing','Health & Social Care','Horticulture','Hospitality','Languages & Maths','Legal Services','Make-Up Artistry','Photography & Digital Media','Plumbing','Police Studies','Professional Cookery','Quantity Surveying','Science','Social Science'],
  false,
  true,
  'Senior Phase Programme (S4-S6, 3-9 hours/week). Gradu8 Programme (S5/deferred S4, 3 days/week in Business, Construction, or Care). Foundation Apprenticeships.',
  'BAcc Accounting with UWS on campus. Over 40 courses have direct university routes.'
);

-- ============================================
-- AYRSHIRE (1)
-- ============================================

-- 6. Ayrshire College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'Ayrshire College',
  'Ayrshire',
  'Ayr',
  'https://www1.ayrshire.ac.uk',
  '[{"name":"Ayr Campus"},{"name":"Kilmarnock Campus"},{"name":"Kilwinning Campus"},{"name":"Willie Mackie Skills Hub, Kilwinning"}]'::jsonb,
  ARRAY['Aeronautical','Art & Design','Business','Computing','Construction','Counselling','Early Years','Engineering','ESOL & Languages','Hair & Beauty','Health & Social Care','Horticulture','Hospitality','Motor Vehicle','Music','Performing Arts','Photography & Media','Renewables','Science','Social Science','Sport & Fitness','Supported Learning'],
  true,
  'west',
  false,
  10000,
  'Aeronautical/aerospace engineering aligned with Prestwick Spaceport. Willie Mackie Skills Hub for sustainable/SMART technologies. Educational partner of Glasgow Science Centre. STEM Assured Status.'
);

-- ============================================
-- EDINBURGH AND LOTHIANS (2)
-- ============================================

-- 7. Edinburgh College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, schools_programme, schools_programme_details, distinctive_features)
VALUES (
  'Edinburgh College',
  'Edinburgh and Lothians',
  'Edinburgh',
  'https://www.edinburghcollege.ac.uk',
  '[{"name":"Granton Campus"},{"name":"Sighthill Campus"},{"name":"Milton Road Campus"},{"name":"Midlothian Campus"}]'::jsonb,
  ARRAY['Art & Design','Automotive','Business','Computing','Construction Trades','Early Childhood Practice','Electrical Engineering','Engineering','Hairdressing & Beauty','Health & Social Services','Hospitality & Events','Media','Music & Sound Production','Performing Arts','Photography','Professional Cookery','Science','Social Science','Sport & Fitness','Travel & Tourism'],
  true,
  'east',
  false,
  true,
  '40+ courses for S5/S6 pupils on Tuesday and Thursday afternoons. NPAs, Highers, Foundation Apprenticeships.',
  'Associate Student Degree Programme with guaranteed Year 3 place at partner university. Breakfast clubs, community fridges, Swap Shops. Part of ELRAH articulation hub.'
);

-- 8. West Lothian College
INSERT INTO colleges (name, region, city, postcode, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, distinctive_features)
VALUES (
  'West Lothian College',
  'Edinburgh and Lothians',
  'Livingston',
  'EH54 7EP',
  'https://www.west-lothian.ac.uk',
  '[{"name":"Livingston Campus","postcode":"EH54 7EP"}]'::jsonb,
  ARRAY['Engineering','Computing','Childhood Practice','Business','Sport & Fitness','Hairdressing & Barbering','Creative Industries','Health & Social Care','Motor Vehicle','Professional Cookery','Construction & Electrical','Nursing','Green Skills','ESOL','SWAP'],
  true,
  'east',
  false,
  'Disability Confident Leader. Carer Positive. Faculty of Access, Employability and Schools with specialist transition support for trauma-experienced learners. SWAP programmes achieve 97% progression to university. BA Business Management Year 3 with Edinburgh Napier on campus.'
);

-- ============================================
-- SCOTTISH BORDERS (1)
-- ============================================

-- 9. Borders College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, schools_programme, schools_programme_details, distinctive_features)
VALUES (
  'Borders College',
  'Scottish Borders',
  'Galashiels',
  'https://www.borderscollege.ac.uk',
  '[{"name":"Galashiels (main)"},{"name":"Newtown St Boswells"},{"name":"Tweedbank"},{"name":"Outreach in Hawick, Kelso, Peebles, Duns"}]'::jsonb,
  ARRAY['Art & Design','Beauty & Hairdressing','Business & Computing','Care & Education','Childcare','Catering & Hospitality','Construction','Engineering & Motor Vehicle','Landbased Industries','Green Skills','Sports & Exercise','Science','Music','Management','Health & Social Care','Horticulture'],
  true,
  'east',
  false,
  true,
  'Schools Academy for S4-S6 (primarily Fridays).',
  '98% student satisfaction. Strong landbased industries offering — Agriculture, Gamekeeping, Animal Care, Horticulture. BA Business Management delivered on site. Part of ELRAH articulation hub.'
);

-- ============================================
-- FIFE (1)
-- ============================================

-- 10. Fife College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, distinctive_features)
VALUES (
  'Fife College',
  'Fife',
  'Kirkcaldy',
  'https://www.fife.ac.uk',
  '[{"name":"Kirkcaldy"},{"name":"Glenrothes"},{"name":"Dunfermline"},{"name":"Rosyth"},{"name":"Levenmouth"}]'::jsonb,
  ARRAY['Accounting & Legal','Art & Design','Built Environment','Business','Childcare','Computing','Construction','Culinary Arts','Data Science','Engineering & Energy','ESOL','Hair & Beauty','Healthcare','Media','Performing Arts','Photography','Science & Maths','Social Sciences','Space Industry','Sport & Fitness','Travel & Tourism'],
  true,
  'east',
  false,
  'Over 600 articulation routes. Franchise degrees with Abertay University and Queen Margaret University on campus. First Chances Fife partnership with University of St Andrews for SIMD20 students.'
);

-- ============================================
-- FORTH VALLEY (1)
-- ============================================

-- 11. Forth Valley College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'Forth Valley College',
  'Forth Valley',
  'Falkirk',
  'https://www.forthvalley.ac.uk',
  '[{"name":"Falkirk (HQ)"},{"name":"Stirling"},{"name":"Alloa"}]'::jsonb,
  ARRAY['Access','Art & Design','Bakery','Business','Care','Childcare','Computing','Construction','Engineering','ESOL','Events','Media & Film','Hair & Beauty','Hospitality & Cookery','Languages','Management','Nursing','Photography','Plumbing','Renewables','Science','Sound Production','Sport','Supported Learning','Teacher Training','Tourism'],
  true,
  'east',
  false,
  14500,
  '97% progression rate. Partnership degrees with 6 university partners. Free breakfast and lunch for all students. Strong petrochemical/chemical industry links. CompEx hazardous area training.'
);

-- ============================================
-- WEST OF SCOTLAND (1)
-- ============================================

-- 12. West College Scotland
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'West College Scotland',
  'West of Scotland',
  'Paisley',
  'https://www.westcollegescotland.ac.uk',
  '[{"name":"Paisley"},{"name":"Greenock (Finnart Street)"},{"name":"Greenock (Waterfront)"},{"name":"Clydebank"}]'::jsonb,
  ARRAY['Acting & Theatre','Art & Design','Beauty','Business & Accounting','Childcare','Computing & Games','Construction','Dance','Engineering','ESOL & Languages','Hairdressing','Health & Social Care','Hospitality & Cookery','Interior Architecture','Make Up Artistry','Media & TV','Motor Vehicle','Music','Nursing','Photography','Science','Social Sciences','Sound Production','Sport & Fitness'],
  true,
  'west',
  false,
  30000,
  'One of Scotland''s largest colleges. BA(Hons) Drama on Paisley campus. Strategic Partnership Agreement with UWS. HNC Social Sciences with University of Glasgow guaranteed Year 2 entry.'
);

-- ============================================
-- TAYSIDE (1)
-- ============================================

-- 13. Dundee and Angus College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, has_modern_apprenticeships, uhi_partner, student_count, distinctive_features)
VALUES (
  'Dundee and Angus College',
  'Tayside',
  'Dundee',
  'https://dundeeandangus.ac.uk',
  '[{"name":"Kingsway Campus, Dundee"},{"name":"Gardyne Campus, Dundee"},{"name":"Arbroath Campus"}]'::jsonb,
  ARRAY['Access','Accounting','Animals & Environment','Art & Design','BSL','Built Environment','Business','Children & Young People','Computing & Creative Media','Construction','Engineering','Events & Tourism','Fashion Business','Hair & Beauty','Health & Social Care','Hospitality','Housing','ESOL','Performing Arts','Science','Social Science','Sport & Fitness','Supported Education','TEFL/TESOL'],
  true,
  'east',
  true,
  false,
  20000,
  'Scottish School of Contemporary Dance. College farm at Arbroath. 380 Foundation Apprenticeships and 346 Modern Apprenticeships. Esports Studios. College of Sanctuary status. Approximately one-third of Abertay University intake articulates from this college.'
);

-- ============================================
-- ABERDEEN AND ABERDEENSHIRE (1)
-- ============================================

-- 14. North East Scotland College (NESCol)
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'North East Scotland College',
  'Aberdeen and Aberdeenshire',
  'Aberdeen',
  'https://www.nescol.ac.uk',
  '[{"name":"Aberdeen City Campus"},{"name":"Aberdeen Altens Campus"},{"name":"Fraserburgh Campus"},{"name":"Scottish Maritime Academy, Peterhead"},{"name":"Learning Centres in Ellon, Inverurie"}]'::jsonb,
  ARRAY['Art & Photography','Business & Management','Care','Computing','Construction','Engineering','Hair & Beauty','Hospitality & Cookery','Sport & Fitness','Media & Communication','Science','Social Sciences','Maritime','Supported Learning','Languages'],
  true,
  'east',
  false,
  21000,
  'Scotland''s strongest college articulation partnership with RGU — 80+ pathways, 400+ students gain advanced entry annually. Scottish Maritime Academy in Peterhead. Explicitly states you don''t always need specific qualifications.'
);

-- ============================================
-- HIGHLANDS AND ISLANDS - UHI PARTNERS (8)
-- ============================================

-- 15. UHI Inverness
INSERT INTO colleges (name, region, city, website_url, uhi_partner, student_count, distinctive_features)
VALUES (
  'UHI Inverness',
  'Highlands and Islands',
  'Inverness',
  'https://www.inverness.uhi.ac.uk',
  true,
  1700,
  'Largest UHI partner. Scotland''s only forestry training provider (Scottish School of Forestry). Graduate Apprenticeships delivered directly.'
);

-- 16. UHI Perth
INSERT INTO colleges (name, region, city, website_url, uhi_partner, distinctive_features)
VALUES (
  'UHI Perth',
  'Highlands and Islands',
  'Perth',
  'https://www.perth.uhi.ac.uk',
  true,
  'Academy of Sport and Wellbeing. Centre for Mountain Studies. BSc Aircraft Maintenance Engineering (status uncertain following AST administration April 2025).'
);

-- 17. UHI Moray
INSERT INTO colleges (name, region, city, website_url, uhi_partner, distinctive_features)
VALUES (
  'UHI Moray',
  'Highlands and Islands',
  'Elgin',
  'https://www.moray.uhi.ac.uk',
  true,
  'Scotland''s 5th art school (only non-urban). Spirit Operations MA aligned with whisky industry — unique to Moray.'
);

-- 18. UHI Argyll
INSERT INTO colleges (name, region, city, website_url, uhi_partner, distinctive_features)
VALUES (
  'UHI Argyll',
  'Highlands and Islands',
  'Oban',
  'https://www.argyll.uhi.ac.uk',
  true,
  'No single campus — 9+ learning centres across Argyll and Bute. Covers one of Scotland''s most geographically fragmented areas. Aquaculture Management SVQ. Gaelic courses.'
);

-- 19. UHI North, West and Hebrides
INSERT INTO colleges (name, region, city, website_url, campuses, uhi_partner, student_count, distinctive_features)
VALUES (
  'UHI North, West and Hebrides',
  'Highlands and Islands',
  'Thurso',
  'https://www.nwh.uhi.ac.uk',
  '[{"name":"19 campuses/centres across North and West Highlands, Skye, and Outer Hebrides including Thurso, Stornoway, Fort William, Alness, Portree, Broadford, Dornoch, Ullapool, Gairloch, Mallaig, Barra, Benbecula, North Uist"}]'::jsonb,
  true,
  9000,
  'Formed September 2023 from merger of UHI North Highland, UHI Outer Hebrides, and UHI West Highland. School of Adventure Studies at Fort William (unique BA Adventure Tourism). Environmental Research Institute at Thurso.'
);

-- 20. UHI Orkney
INSERT INTO colleges (name, region, city, website_url, uhi_partner, distinctive_features)
VALUES (
  'UHI Orkney',
  'Highlands and Islands',
  'Kirkwall',
  'https://www.orkney.uhi.ac.uk',
  true,
  'Major strength in Archaeology (UHI Archaeology Institute based here). Agriculture/Agronomy Institute. Best in Scotland for postgrad student satisfaction.'
);

-- 21. UHI Shetland
INSERT INTO colleges (name, region, city, website_url, uhi_partner, distinctive_features)
VALUES (
  'UHI Shetland',
  'Highlands and Islands',
  'Lerwick',
  'https://www.shetland.uhi.ac.uk',
  true,
  'Marine Sciences and Maritime at Scalloway campus. Creative Industries at Mareel waterfront. Aquaculture pathway from SVQ Level 5 to SVQ Level 9. Deck Officer certification.'
);

-- 22. Sabhal Mor Ostaig UHI
INSERT INTO colleges (name, region, city, website_url, uhi_partner, distinctive_features)
VALUES (
  'Sabhal Mor Ostaig UHI',
  'Highlands and Islands',
  'Sleat, Isle of Skye',
  'https://www.smo.uhi.ac.uk',
  true,
  'Scotland''s National Centre for Gaelic Language and Culture. The ONLY centre in the world providing learning entirely through Scottish Gaelic. All courses taught through Gaelic.'
);

-- ============================================
-- DUMFRIES AND GALLOWAY (1)
-- ============================================

-- 23. Dumfries and Galloway College
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, has_swap, swap_hub, uhi_partner, student_count, distinctive_features)
VALUES (
  'Dumfries and Galloway College',
  'Dumfries and Galloway',
  'Dumfries',
  'https://www.dumgal.ac.uk',
  '[{"name":"Dumfries Campus (Crichton Estate)"},{"name":"Stranraer Campus"}]'::jsonb,
  ARRAY['Business & Management','Computing','Construction','Creative Industries','Early Education','Engineering','Hair & Beauty','Health & Social Studies','Hospitality','Motor Vehicle','Sport & Fitness','Life Skills & Employability'],
  true,
  'west',
  false,
  9000,
  'Shares Crichton Estate campus with UWS, UofG, OU, and SRUC. Green energy skills focus.'
);

-- ============================================
-- SPECIALIST (1)
-- ============================================

-- 24. SRUC (Scotland's Rural College)
-- Cross-reference: SRUC also exists in universities table as a specialist institution
INSERT INTO colleges (name, region, city, website_url, campuses, course_areas, uhi_partner, distinctive_features)
VALUES (
  'SRUC (Scotland''s Rural College)',
  'Scotland-wide',
  'Edinburgh',
  'https://www.sruc.ac.uk',
  '[{"name":"Edinburgh (King''s Buildings)"},{"name":"Aberdeen (Craibstone)"},{"name":"Ayr"},{"name":"Barony (Dumfries)"},{"name":"Oatridge (West Lothian)"}]'::jsonb,
  ARRAY['Agriculture','Animal Science','Countryside Management','Environmental Management','Equine Studies','Garden Design','Horticulture','Rural Business','Veterinary Nursing','Wildlife Management'],
  false,
  'Scotland''s specialist land-based college and university. Holds degree-awarding powers since October 2024. Also listed in the universities table as a specialist institution. Campuses across Scotland.'
);
