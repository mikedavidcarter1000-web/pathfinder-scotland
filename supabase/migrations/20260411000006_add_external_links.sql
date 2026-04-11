-- ============================================
-- External links across universities & career_sectors
-- Migration: 20260411000006
-- Adds URL columns to universities (website_url, widening_access_url,
-- scholarships_url, undergraduate_url) and a JSONB external_links column
-- to career_sectors. Populates data for all 15 Scottish universities and
-- seeds relevant professional body links per career sector.
-- ============================================

-- 1. Universities: URL columns
ALTER TABLE universities ADD COLUMN IF NOT EXISTS website_url          TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS widening_access_url  TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS scholarships_url     TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS undergraduate_url    TEXT;

-- 2. Populate universities (by slug)
UPDATE universities SET
  website_url         = 'https://www.st-andrews.ac.uk',
  widening_access_url = 'https://www.st-andrews.ac.uk/study/access/',
  scholarships_url    = 'https://www.st-andrews.ac.uk/study/ug/money/',
  undergraduate_url   = 'https://www.st-andrews.ac.uk/subjects/'
WHERE slug = 'st-andrews';

UPDATE universities SET
  website_url         = 'https://www.gla.ac.uk',
  widening_access_url = 'https://www.gla.ac.uk/study/wp/',
  scholarships_url    = 'https://www.gla.ac.uk/scholarships/wideningparticipation/',
  undergraduate_url   = 'https://www.gla.ac.uk/undergraduate/'
WHERE slug = 'glasgow';

UPDATE universities SET
  website_url         = 'https://www.abdn.ac.uk',
  widening_access_url = 'https://www.abdn.ac.uk/study/undergraduate/widening-access/reach/',
  scholarships_url    = 'https://www.abdn.ac.uk/study/funding/',
  undergraduate_url   = 'https://www.abdn.ac.uk/study/undergraduate/'
WHERE slug = 'aberdeen';

UPDATE universities SET
  website_url         = 'https://www.ed.ac.uk',
  widening_access_url = 'https://wpguides.ed.ac.uk/',
  scholarships_url    = 'https://registryservices.ed.ac.uk/student-funding/undergraduate',
  undergraduate_url   = 'https://study.ed.ac.uk/undergraduate'
WHERE slug = 'edinburgh';

UPDATE universities SET
  website_url         = 'https://www.dundee.ac.uk',
  widening_access_url = 'https://www.dundee.ac.uk/widening-access',
  scholarships_url    = 'https://www.dundee.ac.uk/scholarships',
  undergraduate_url   = 'https://www.dundee.ac.uk/undergraduate'
WHERE slug = 'dundee';

UPDATE universities SET
  website_url         = 'https://www.strath.ac.uk',
  widening_access_url = 'https://www.strath.ac.uk/studywithus/widerecruitmentandaccess/',
  scholarships_url    = 'https://www.strath.ac.uk/studywithus/scholarships/',
  undergraduate_url   = 'https://www.strath.ac.uk/studywithus/undergraduate/'
WHERE slug = 'strathclyde';

UPDATE universities SET
  website_url         = 'https://www.hw.ac.uk',
  widening_access_url = 'https://www.hw.ac.uk/study/fees-and-funding/scholarships-and-bursaries/heriot-watt-widening-access-bursary-scotland',
  scholarships_url    = 'https://www.hw.ac.uk/study/fees-and-funding/scholarships-and-bursaries',
  undergraduate_url   = 'https://www.hw.ac.uk/study/undergraduate'
WHERE slug = 'heriot-watt';

UPDATE universities SET
  website_url         = 'https://www.stir.ac.uk',
  widening_access_url = 'https://www.stir.ac.uk/study/undergraduate/widening-participation/',
  scholarships_url    = 'https://www.stir.ac.uk/scholarships/',
  undergraduate_url   = 'https://www.stir.ac.uk/study/undergraduate/'
WHERE slug = 'stirling';

UPDATE universities SET
  website_url         = 'https://www.gcu.ac.uk',
  widening_access_url = 'https://www.gcu.ac.uk/aboutgcu/commongood/foundation/ourpriorities/wideningaccess',
  scholarships_url    = 'https://www.gcu.ac.uk/study/scholarships/undergraduate',
  undergraduate_url   = 'https://www.gcu.ac.uk/study/undergraduate'
WHERE slug = 'gcu';

UPDATE universities SET
  website_url         = 'https://www.napier.ac.uk',
  widening_access_url = 'https://www.napier.ac.uk/study-with-us/bursaries',
  scholarships_url    = 'https://www.napier.ac.uk/study-with-us/bursaries',
  undergraduate_url   = 'https://www.napier.ac.uk/courses/undergraduate-courses'
WHERE slug = 'napier';

UPDATE universities SET
  website_url         = 'https://www.rgu.ac.uk',
  widening_access_url = 'https://www.rgu.ac.uk/study/apply/access-rgu',
  scholarships_url    = 'https://www.rgu.ac.uk/study/apply/access-rgu/access-rgu-scholarships',
  undergraduate_url   = 'https://www.rgu.ac.uk/study/courses/undergraduate-degrees'
WHERE slug = 'rgu';

UPDATE universities SET
  website_url         = 'https://www.uws.ac.uk',
  widening_access_url = 'https://www.uws.ac.uk/university-life/student-support-wellbeing/widening-access-at-uws/',
  scholarships_url    = 'https://www.uws.ac.uk/money-fees-funding/scholarships/west-scholarship-programme/',
  undergraduate_url   = 'https://www.uws.ac.uk/study/undergraduate/'
WHERE slug = 'uws';

UPDATE universities SET
  website_url         = 'https://www.qmu.ac.uk',
  widening_access_url = 'https://www.qmu.ac.uk/study-here/access-to-higher-education/',
  scholarships_url    = 'https://www.qmu.ac.uk/study-here/fees-and-funding/scholarships-for-new-students',
  undergraduate_url   = 'https://www.qmu.ac.uk/study-here/undergraduate-study/'
WHERE slug = 'qmu';

UPDATE universities SET
  website_url         = 'https://www.uhi.ac.uk',
  widening_access_url = 'https://www.uhi.ac.uk/en/students/support/inclusive/widening-access/',
  scholarships_url    = 'https://www.uhi.ac.uk/en/studying-at-uhi/first-steps/financial-aid/',
  undergraduate_url   = 'https://www.uhi.ac.uk/en/courses/'
WHERE slug = 'uhi';

UPDATE universities SET
  website_url         = 'https://www.rcs.ac.uk',
  widening_access_url = 'https://www.rcs.ac.uk/learning-engagement/outreach/',
  scholarships_url    = 'https://www.rcs.ac.uk/finance/',
  undergraduate_url   = 'https://www.rcs.ac.uk/study/'
WHERE slug = 'rcs';

-- 3. Career sectors: external_links JSONB column
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb;

-- 4. Populate career_sectors.external_links with professional body links
UPDATE career_sectors SET external_links = '[
  {"name":"NHS Scotland Careers","url":"https://careers.nhs.scot","description":"Healthcare careers across NHS Scotland"},
  {"name":"NHS Education for Scotland","url":"https://www.nes.scot.nhs.uk","description":"Training and education for NHS staff"},
  {"name":"General Medical Council","url":"https://www.gmc-uk.org","description":"UK body regulating medical education and practice"},
  {"name":"Nursing & Midwifery Council","url":"https://www.nmc.org.uk","description":"UK regulator for nurses and midwives"}
]'::jsonb WHERE name = 'Healthcare & Medicine';

UPDATE career_sectors SET external_links = '[
  {"name":"Engineering UK","url":"https://www.engineeringuk.com","description":"Promoting engineering careers across the UK"},
  {"name":"Institution of Civil Engineers","url":"https://www.ice.org.uk","description":"Professional body for civil engineers"},
  {"name":"IMechE","url":"https://www.imeche.org","description":"Institution of Mechanical Engineers"},
  {"name":"IET","url":"https://www.theiet.org","description":"Institution of Engineering and Technology"}
]'::jsonb WHERE name = 'Engineering & Manufacturing';

UPDATE career_sectors SET external_links = '[
  {"name":"ScotlandIS","url":"https://www.scotlandis.com","description":"Scotland''s digital technologies trade body"},
  {"name":"BCS (The Chartered Institute for IT)","url":"https://www.bcs.org","description":"UK''s chartered institute for IT professionals"},
  {"name":"CodeClan","url":"https://codeclan.com","description":"Scotland''s digital skills academy"},
  {"name":"Tech Nation","url":"https://technation.io","description":"Network for the UK''s tech industry"}
]'::jsonb WHERE name = 'Computing & Digital Technology';

UPDATE career_sectors SET external_links = '[
  {"name":"Royal Society of Biology","url":"https://www.rsb.org.uk","description":"UK body representing biologists"},
  {"name":"Royal Society of Chemistry","url":"https://www.rsc.org","description":"UK body for chemistry careers and education"},
  {"name":"Institute of Physics","url":"https://www.iop.org","description":"UK professional body for physicists"},
  {"name":"Scottish Science Advisory Council","url":"https://www.scottishscience.org.uk","description":"Independent science advice for Scotland"}
]'::jsonb WHERE name = 'Science & Research';

UPDATE career_sectors SET external_links = '[
  {"name":"Law Society of Scotland","url":"https://www.lawscot.org.uk","description":"Professional body for Scottish solicitors"},
  {"name":"Faculty of Advocates","url":"https://www.advocates.org.uk","description":"Professional body for Scottish advocates"},
  {"name":"Police Scotland Careers","url":"https://www.scotland.police.uk/recruitment/","description":"Police officer and staff careers"},
  {"name":"Scottish Courts & Tribunals Service","url":"https://www.scotcourts.gov.uk","description":"Careers in Scotland''s court system"}
]'::jsonb WHERE name = 'Law & Justice';

UPDATE career_sectors SET external_links = '[
  {"name":"Teach in Scotland","url":"https://teachinscotland.scot","description":"Official route into teaching in Scotland"},
  {"name":"General Teaching Council for Scotland","url":"https://www.gtcs.org.uk","description":"Regulator for Scottish teachers"},
  {"name":"Education Scotland","url":"https://education.gov.scot","description":"National body for curriculum and school improvement"},
  {"name":"Scottish Qualifications Authority","url":"https://www.sqa.org.uk","description":"Scotland''s qualifications authority"}
]'::jsonb WHERE name = 'Education & Teaching';

UPDATE career_sectors SET external_links = '[
  {"name":"ICAS","url":"https://www.icas.com","description":"Institute of Chartered Accountants of Scotland"},
  {"name":"Scottish Financial Enterprise","url":"https://www.sfe.org.uk","description":"Representative body for Scotland''s financial services industry"},
  {"name":"Chartered Banker Institute","url":"https://www.charteredbanker.com","description":"Professional body for bankers — based in Edinburgh"},
  {"name":"Institute and Faculty of Actuaries","url":"https://www.actuaries.org.uk","description":"UK professional body for actuaries"}
]'::jsonb WHERE name = 'Business & Finance';

UPDATE career_sectors SET external_links = '[
  {"name":"Creative Scotland","url":"https://www.creativescotland.com","description":"Scotland''s national arts development body"},
  {"name":"Royal Incorporation of Architects in Scotland","url":"https://www.rias.org.uk","description":"Professional body for Scottish architects"},
  {"name":"Design Council","url":"https://www.designcouncil.org.uk","description":"UK''s strategic advisor on design"},
  {"name":"Scottish Contemporary Art Network","url":"https://www.sca-net.org","description":"Network for contemporary visual arts in Scotland"}
]'::jsonb WHERE name = 'Creative Arts & Design';

UPDATE career_sectors SET external_links = '[
  {"name":"BBC Careers","url":"https://www.bbc.co.uk/careers","description":"Careers across the BBC including BBC Scotland"},
  {"name":"Screen Scotland","url":"https://www.screen.scot","description":"Scotland''s national screen agency"},
  {"name":"Chartered Institute of Public Relations","url":"https://www.cipr.co.uk","description":"UK professional body for PR"},
  {"name":"Chartered Institute of Marketing","url":"https://www.cim.co.uk","description":"UK professional body for marketing"}
]'::jsonb WHERE name = 'Media & Communications';

UPDATE career_sectors SET external_links = '[
  {"name":"Scottish Social Services Council","url":"https://www.sssc.uk.com","description":"Regulator for Scotland''s social service workers"},
  {"name":"SCVO","url":"https://scvo.scot","description":"Scottish Council for Voluntary Organisations"},
  {"name":"British Association of Social Workers","url":"https://www.basw.co.uk","description":"Professional association for UK social workers"},
  {"name":"Youth Scotland","url":"https://www.youthscotland.org.uk","description":"National agency for community-based youth work"}
]'::jsonb WHERE name = 'Social Work & Community';

UPDATE career_sectors SET external_links = '[
  {"name":"sportscotland","url":"https://sportscotland.org.uk","description":"National agency for sport in Scotland"},
  {"name":"UK Coaching","url":"https://www.ukcoaching.org","description":"Professional body for sports coaches"},
  {"name":"CIMSPA","url":"https://www.cimspa.co.uk","description":"Chartered Institute for the Management of Sport and Physical Activity"},
  {"name":"British Association of Sport & Exercise Sciences","url":"https://www.bases.org.uk","description":"Professional body for sport and exercise science"}
]'::jsonb WHERE name = 'Sport & Fitness';

UPDATE career_sectors SET external_links = '[
  {"name":"VisitScotland","url":"https://www.visitscotland.org","description":"Scotland''s national tourism organisation"},
  {"name":"UKHospitality","url":"https://www.ukhospitality.org.uk","description":"Trade association for UK hospitality"},
  {"name":"Institute of Hospitality","url":"https://www.instituteofhospitality.org","description":"Professional body for hospitality managers"},
  {"name":"Scottish Tourism Alliance","url":"https://scottishtourismalliance.co.uk","description":"Voice of Scotland''s tourism industry"}
]'::jsonb WHERE name = 'Hospitality & Tourism';

UPDATE career_sectors SET external_links = '[
  {"name":"Construction Industry Training Board","url":"https://www.citb.co.uk","description":"UK-wide construction training body"},
  {"name":"Built Environment — Skills Development Scotland","url":"https://www.skillsdevelopmentscotland.co.uk","description":"Apprenticeships across construction and trades"},
  {"name":"SELECT","url":"https://www.select.org.uk","description":"Trade association for Scottish electricians"},
  {"name":"Scottish Building Federation","url":"https://www.scottish-building.co.uk","description":"Trade body for Scottish building contractors"}
]'::jsonb WHERE name = 'Construction & Trades';

UPDATE career_sectors SET external_links = '[
  {"name":"Scottish Government Careers","url":"https://work-for-scotgov.org","description":"Careers across the Scottish Government"},
  {"name":"Civil Service Jobs","url":"https://www.civilservicejobs.service.gov.uk","description":"UK-wide Civil Service opportunities"},
  {"name":"COSLA","url":"https://www.cosla.gov.uk","description":"Convention of Scottish Local Authorities"},
  {"name":"Scottish Fire and Rescue Service","url":"https://www.firescotland.gov.uk","description":"Firefighter recruitment across Scotland"}
]'::jsonb WHERE name = 'Public Services & Government';

UPDATE career_sectors SET external_links = '[
  {"name":"NatureScot","url":"https://www.nature.scot","description":"Scotland''s nature agency"},
  {"name":"Lantra Scotland","url":"https://www.lantra.co.uk/scotland","description":"Skills body for land-based, aquaculture and environmental sectors"},
  {"name":"Scottish Countryside Rangers Association","url":"https://www.scra.co.uk","description":"Professional body for countryside rangers"},
  {"name":"Royal Society for the Protection of Birds Scotland","url":"https://www.rspb.org.uk/about-us/our-work/rspb-scotland/","description":"Conservation careers across Scotland"}
]'::jsonb WHERE name = 'Agriculture & Environment';

UPDATE career_sectors SET external_links = '[
  {"name":"Federation of Scottish Theatre","url":"https://www.scottishtheatre.org","description":"Scotland''s theatre, dance and opera industry body"},
  {"name":"Equity","url":"https://www.equity.org.uk","description":"UK trade union for performers and creative practitioners"},
  {"name":"Royal Conservatoire of Scotland","url":"https://www.rcs.ac.uk","description":"Scotland''s national conservatoire"},
  {"name":"Musicians'' Union","url":"https://musiciansunion.org.uk","description":"UK trade union for professional musicians"}
]'::jsonb WHERE name = 'Performing Arts & Entertainment';

-- 5. Indexes aren''t needed — small table, rarely filtered on URL columns
