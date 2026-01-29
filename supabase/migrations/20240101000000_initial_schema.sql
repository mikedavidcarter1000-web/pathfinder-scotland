-- Pathfinder Scotland Database Schema
-- Initial migration

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE school_stage AS ENUM ('s3', 's4', 's5', 's6', 'college', 'mature');
CREATE TYPE university_type AS ENUM ('ancient', 'traditional', 'modern', 'specialist');
CREATE TYPE degree_type AS ENUM ('bsc', 'ba', 'ma', 'beng', 'meng', 'llb', 'mbchb', 'bds', 'bvm', 'bmus', 'bed', 'bnurs');
CREATE TYPE qualification_type AS ENUM ('higher', 'advanced_higher', 'national_5', 'a_level', 'btec');

-- ============================================
-- TABLES
-- ============================================

-- Students table (linked to Supabase Auth)
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    school_stage school_stage,
    school_name TEXT,
    postcode TEXT,
    simd_decile INTEGER CHECK (simd_decile >= 1 AND simd_decile <= 10),
    care_experienced BOOLEAN DEFAULT FALSE,
    is_carer BOOLEAN DEFAULT FALSE,
    first_generation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type university_type,
    city TEXT,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    founded_year INTEGER,
    russell_group BOOLEAN DEFAULT FALSE,
    widening_access_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    ucas_code TEXT,
    degree_type degree_type,
    subject_area TEXT,
    description TEXT,
    duration_years INTEGER DEFAULT 4,
    entry_requirements JSONB DEFAULT '{}',
    widening_access_requirements JSONB DEFAULT '{}',
    course_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(university_id, slug)
);

-- SIMD Postcodes lookup table
CREATE TABLE simd_postcodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postcode TEXT NOT NULL UNIQUE,
    simd_decile INTEGER NOT NULL CHECK (simd_decile >= 1 AND simd_decile <= 10),
    datazone TEXT,
    council_area TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved courses (student's shortlist)
CREATE TABLE saved_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    priority INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Student grades
CREATE TABLE student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    qualification_type qualification_type NOT NULL,
    year INTEGER,
    predicted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject, qualification_type)
);

-- ============================================
-- INDEXES
-- ============================================

-- Students
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_simd_decile ON students(simd_decile);
CREATE INDEX idx_students_school_stage ON students(school_stage);

-- Universities
CREATE INDEX idx_universities_slug ON universities(slug);
CREATE INDEX idx_universities_type ON universities(type);
CREATE INDEX idx_universities_city ON universities(city);

-- Courses
CREATE INDEX idx_courses_university_id ON courses(university_id);
CREATE INDEX idx_courses_subject_area ON courses(subject_area);
CREATE INDEX idx_courses_degree_type ON courses(degree_type);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_slug ON courses(slug);

-- Full-text search on courses
CREATE INDEX idx_courses_name_search ON courses USING GIN (to_tsvector('english', name));

-- SIMD Postcodes
CREATE INDEX idx_simd_postcodes_postcode ON simd_postcodes(postcode);
CREATE INDEX idx_simd_postcodes_decile ON simd_postcodes(simd_decile);

-- Saved Courses
CREATE INDEX idx_saved_courses_student_id ON saved_courses(student_id);
CREATE INDEX idx_saved_courses_course_id ON saved_courses(course_id);

-- Student Grades
CREATE INDEX idx_student_grades_student_id ON student_grades(student_id);
CREATE INDEX idx_student_grades_qualification_type ON student_grades(qualification_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE simd_postcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;

-- Students: Users can only access their own data
CREATE POLICY "Users can view own student profile"
    ON students FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own student profile"
    ON students FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own student profile"
    ON students FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can delete own student profile"
    ON students FOR DELETE
    USING (auth.uid() = id);

-- Universities: Public read access
CREATE POLICY "Universities are viewable by everyone"
    ON universities FOR SELECT
    TO authenticated, anon
    USING (true);

-- Courses: Public read access
CREATE POLICY "Courses are viewable by everyone"
    ON courses FOR SELECT
    TO authenticated, anon
    USING (true);

-- SIMD Postcodes: Public read access
CREATE POLICY "SIMD postcodes are viewable by everyone"
    ON simd_postcodes FOR SELECT
    TO authenticated, anon
    USING (true);

-- Saved Courses: Users can only access their own
CREATE POLICY "Users can view own saved courses"
    ON saved_courses FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own saved courses"
    ON saved_courses FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own saved courses"
    ON saved_courses FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Users can delete own saved courses"
    ON saved_courses FOR DELETE
    USING (auth.uid() = student_id);

-- Student Grades: Users can only access their own
CREATE POLICY "Users can view own grades"
    ON student_grades FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own grades"
    ON student_grades FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own grades"
    ON student_grades FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Users can delete own grades"
    ON student_grades FOR DELETE
    USING (auth.uid() = student_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_grades_updated_at
    BEFORE UPDATE ON student_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-lookup SIMD from postcode when student updates postcode
CREATE OR REPLACE FUNCTION lookup_simd_for_student()
RETURNS TRIGGER AS $$
DECLARE
    simd_record simd_postcodes%ROWTYPE;
    normalised_postcode TEXT;
BEGIN
    IF NEW.postcode IS NOT NULL AND NEW.postcode != '' THEN
        -- Normalise postcode (remove spaces, uppercase)
        normalised_postcode := UPPER(REPLACE(NEW.postcode, ' ', ''));

        -- Look up SIMD decile
        SELECT * INTO simd_record
        FROM simd_postcodes
        WHERE postcode = normalised_postcode;

        IF FOUND THEN
            NEW.simd_decile := simd_record.simd_decile;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_lookup_simd
    BEFORE INSERT OR UPDATE OF postcode ON students
    FOR EACH ROW
    EXECUTE FUNCTION lookup_simd_for_student();

-- ============================================
-- SEED DATA: Scottish Universities
-- ============================================

INSERT INTO universities (name, slug, type, city, website, founded_year, russell_group, description, widening_access_info) VALUES
-- Ancient Universities
('University of St Andrews', 'st-andrews', 'ancient', 'St Andrews', 'https://www.st-andrews.ac.uk', 1413, FALSE,
 'Scotland''s first university and the third oldest in the English-speaking world. Known for academic excellence and historic traditions.',
 '{"programs": ["REACH St Andrews", "Gateway to St Andrews"], "eligibility_criteria": ["SIMD20", "Care Experienced", "First Generation"]}'::jsonb),

('University of Glasgow', 'glasgow', 'ancient', 'Glasgow', 'https://www.gla.ac.uk', 1451, TRUE,
 'A world-leading, research-intensive university and member of the Russell Group. Located in the vibrant West End of Glasgow.',
 '{"programs": ["Top-Up Programme", "Talent & Ability Programme"], "eligibility_criteria": ["SIMD40", "Care Experienced", "Young Carer"]}'::jsonb),

('University of Aberdeen', 'aberdeen', 'ancient', 'Aberdeen', 'https://www.abdn.ac.uk', 1495, FALSE,
 'One of Scotland''s ancient universities, offering world-class teaching and research in the heart of the North East.',
 '{"programs": ["Access Aberdeen", "Aspire North"], "eligibility_criteria": ["SIMD20", "Care Experienced", "First Generation"]}'::jsonb),

('University of Edinburgh', 'edinburgh', 'ancient', 'Edinburgh', 'https://www.ed.ac.uk', 1582, TRUE,
 'A world-renowned university and Russell Group member, located in Scotland''s capital city.',
 '{"programs": ["REACH Edinburgh", "LEAPS"], "eligibility_criteria": ["SIMD20", "Care Experienced", "Young Carer", "First Generation"]}'::jsonb),

-- Traditional Universities
('University of Dundee', 'dundee', 'traditional', 'Dundee', 'https://www.dundee.ac.uk', 1881, FALSE,
 'A leading university known for life sciences, art & design, and its student experience.',
 '{"programs": ["Access to a Degree"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('University of Strathclyde', 'strathclyde', 'traditional', 'Glasgow', 'https://www.strath.ac.uk', 1796, FALSE,
 'Scotland''s third largest university, known for business, engineering, and strong industry links.',
 '{"programs": ["FOCUS West", "Strathclyde Access Programme"], "eligibility_criteria": ["SIMD40", "Care Experienced", "Young Carer"]}'::jsonb),

('Heriot-Watt University', 'heriot-watt', 'traditional', 'Edinburgh', 'https://www.hw.ac.uk', 1821, FALSE,
 'A global university with Scottish roots, known for engineering, science, and business programmes.',
 '{"programs": ["LEAPS", "Access to Industry"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('University of Stirling', 'stirling', 'traditional', 'Stirling', 'https://www.stir.ac.uk', 1967, FALSE,
 'A campus university in the heart of Scotland, known for sport, health sciences, and sustainability.',
 '{"programs": ["Stirling Access Programme"], "eligibility_criteria": ["SIMD40", "Care Experienced", "First Generation"]}'::jsonb),

-- Modern Universities
('Glasgow Caledonian University', 'gcu', 'modern', 'Glasgow', 'https://www.gcu.ac.uk', 1993, FALSE,
 'The University for the Common Good, known for health, business, and engineering programmes.',
 '{"programs": ["Caledonian Club", "FOCUS West"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('Edinburgh Napier University', 'napier', 'modern', 'Edinburgh', 'https://www.napier.ac.uk', 1992, FALSE,
 'A modern university known for computing, business, and creative industries programmes.',
 '{"programs": ["LEAPS", "Reach Programme"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('Robert Gordon University', 'rgu', 'modern', 'Aberdeen', 'https://www.rgu.ac.uk', 1992, FALSE,
 'A career-focused university with strong links to the energy, health, and creative industries.',
 '{"programs": ["Aspire North", "RGU Access"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('University of the West of Scotland', 'uws', 'modern', 'Paisley', 'https://www.uws.ac.uk', 1992, FALSE,
 'A multi-campus university serving communities across the West of Scotland.',
 '{"programs": ["FOCUS West", "UWS Access"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('Queen Margaret University', 'qmu', 'modern', 'Edinburgh', 'https://www.qmu.ac.uk', 2007, FALSE,
 'A specialist university known for health sciences, media, and hospitality programmes.',
 '{"programs": ["LEAPS", "QMU Access"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb),

('University of the Highlands and Islands', 'uhi', 'modern', 'Inverness', 'https://www.uhi.ac.uk', 2011, FALSE,
 'A unique partnership of colleges and research centres across the Highlands and Islands.',
 '{"programs": ["UHI Access"], "eligibility_criteria": ["SIMD40", "Care Experienced", "Rural"]}'::jsonb),

-- Specialist Institution
('Royal Conservatoire of Scotland', 'rcs', 'specialist', 'Glasgow', 'https://www.rcs.ac.uk', 1847, FALSE,
 'Scotland''s national conservatoire for music, drama, dance, production, and film education.',
 '{"programs": ["RCS Access", "Transitions Programme"], "eligibility_criteria": ["SIMD40", "Care Experienced"]}'::jsonb);

-- ============================================
-- SEED DATA: Sample Courses
-- ============================================

-- Get university IDs for inserting courses
DO $$
DECLARE
    edinburgh_id UUID;
    glasgow_id UUID;
    standrews_id UUID;
    strathclyde_id UUID;
    dundee_id UUID;
    aberdeen_id UUID;
BEGIN
    SELECT id INTO edinburgh_id FROM universities WHERE slug = 'edinburgh';
    SELECT id INTO glasgow_id FROM universities WHERE slug = 'glasgow';
    SELECT id INTO standrews_id FROM universities WHERE slug = 'st-andrews';
    SELECT id INTO strathclyde_id FROM universities WHERE slug = 'strathclyde';
    SELECT id INTO dundee_id FROM universities WHERE slug = 'dundee';
    SELECT id INTO aberdeen_id FROM universities WHERE slug = 'aberdeen';

    -- University of Edinburgh Courses
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (edinburgh_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AAAA", "advanced_highers": "AA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB", "care_experienced_offer": "AABB"}'::jsonb,
     'Learn to design, build, and analyse software systems. Covers algorithms, AI, cybersecurity, and software engineering.'),

    (edinburgh_id, 'Medicine', 'medicine', 'A100', 'mbchb', 'Medicine', 6,
     '{"highers": "AAAAA", "advanced_highers": "AA", "ucas_points": 176, "required_subjects": ["Chemistry", "Biology", "Mathematics or Physics"]}'::jsonb,
     '{"simd20_offer": "AAAAB", "care_experienced_offer": "AAAAB"}'::jsonb,
     'A comprehensive medical degree preparing you for a career as a doctor in the NHS or globally.'),

    (edinburgh_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "AAAA", "ucas_points": 152}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study Scots law, legal theory, and gain the foundations for a career in the legal profession.'),

    (edinburgh_id, 'History', 'history', 'V100', 'ma', 'History', 4,
     '{"highers": "AAAB", "ucas_points": 144}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Explore the past from ancient civilisations to modern times with world-leading historians.');

    -- University of Glasgow Courses
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (glasgow_id, 'Computing Science', 'computing-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'A comprehensive computing degree covering programming, algorithms, AI, and software development.'),

    (glasgow_id, 'Engineering', 'engineering', 'H100', 'beng', 'Engineering', 4,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'A broad-based engineering programme with options to specialise in mechanical, electrical, or civil engineering.'),

    (glasgow_id, 'Psychology', 'psychology', 'C800', 'bsc', 'Psychology', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Study the science of mind and behaviour with opportunities for research and practical experience.'),

    (glasgow_id, 'Veterinary Medicine', 'veterinary-medicine', 'D100', 'bvm', 'Veterinary Medicine', 5,
     '{"highers": "AAAAA", "ucas_points": 176, "required_subjects": ["Chemistry", "Biology"]}'::jsonb,
     '{"simd20_offer": "AAAAB", "care_experienced_offer": "AAAAB"}'::jsonb,
     'Train to become a veterinary surgeon with hands-on clinical experience from year one.');

    -- University of St Andrews Courses
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (standrews_id, 'Computer Science', 'computer-science', 'G400', 'bsc', 'Computer Science', 4,
     '{"highers": "AAAA", "ucas_points": 152, "required_subjects": ["Mathematics"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Study computing in one of the UK''s top computer science departments.'),

    (standrews_id, 'International Relations', 'international-relations', 'L250', 'ma', 'Politics', 4,
     '{"highers": "AAAA", "ucas_points": 152}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Analyse global politics, diplomacy, and international organisations.'),

    (standrews_id, 'Medicine', 'medicine', 'A100', 'mbchb', 'Medicine', 6,
     '{"highers": "AAAAA", "ucas_points": 176, "required_subjects": ["Chemistry", "Biology or Mathematics"]}'::jsonb,
     '{"simd20_offer": "AAAAB", "care_experienced_offer": "AAAAB"}'::jsonb,
     'A ScotGEM programme in partnership with the University of Dundee.');

    -- University of Strathclyde Courses
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (strathclyde_id, 'Business', 'business', 'N100', 'ba', 'Business & Management', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'A triple-accredited business degree from one of Europe''s leading business schools.'),

    (strathclyde_id, 'Electronic and Electrical Engineering', 'eee', 'H600', 'beng', 'Engineering', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics", "Physics"]}'::jsonb,
     '{"simd20_offer": "BBBB", "simd40_offer": "ABBB"}'::jsonb,
     'Design the electronic systems that power modern technology.'),

    (strathclyde_id, 'Pharmacy', 'pharmacy', 'B230', 'bsc', 'Pharmacy', 5,
     '{"highers": "AAAB", "ucas_points": 144, "required_subjects": ["Chemistry"]}'::jsonb,
     '{"simd20_offer": "AABB", "simd40_offer": "AAAB"}'::jsonb,
     'Train to become a pharmacist with integrated clinical placements.');

    -- University of Dundee Courses
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (dundee_id, 'Medicine', 'medicine', 'A100', 'mbchb', 'Medicine', 5,
     '{"highers": "AAAAB", "ucas_points": 160, "required_subjects": ["Chemistry", "Biology"]}'::jsonb,
     '{"simd20_offer": "AABBB", "care_experienced_offer": "AABBB"}'::jsonb,
     'A patient-centred medical degree with early clinical contact.'),

    (dundee_id, 'Dentistry', 'dentistry', 'A200', 'bds', 'Dentistry', 5,
     '{"highers": "AAAAB", "ucas_points": 160, "required_subjects": ["Chemistry", "Biology"]}'::jsonb,
     '{"simd20_offer": "AABBB", "care_experienced_offer": "AABBB"}'::jsonb,
     'Train to become a dentist with state-of-the-art clinical facilities.'),

    (dundee_id, 'Art & Design', 'art-design', 'W100', 'ba', 'Art & Design', 4,
     '{"highers": "BBC", "ucas_points": 96}'::jsonb,
     '{"simd20_offer": "CCC", "simd40_offer": "BCC"}'::jsonb,
     'Develop your creative practice at one of the UK''s top art schools.');

    -- University of Aberdeen Courses
    INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, duration_years, entry_requirements, widening_access_requirements, description) VALUES
    (aberdeen_id, 'Law', 'law', 'M100', 'llb', 'Law', 4,
     '{"highers": "AABB", "ucas_points": 136}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study Scots law in one of Scotland''s oldest law schools.'),

    (aberdeen_id, 'Petroleum Engineering', 'petroleum-engineering', 'H850', 'beng', 'Engineering', 5,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Mathematics", "Physics or Chemistry"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Train for the energy industry with Europe''s leading petroleum engineering programme.'),

    (aberdeen_id, 'Marine Biology', 'marine-biology', 'C160', 'bsc', 'Biological Sciences', 4,
     '{"highers": "AABB", "ucas_points": 136, "required_subjects": ["Biology"]}'::jsonb,
     '{"simd20_offer": "ABBB", "simd40_offer": "AABB"}'::jsonb,
     'Study marine life in one of Scotland''s premier coastal locations.');

END $$;

-- ============================================
-- SEED DATA: Sample SIMD Postcodes
-- ============================================

-- Insert sample SIMD postcodes (in real deployment, import full dataset)
INSERT INTO simd_postcodes (postcode, simd_decile, datazone, council_area) VALUES
-- Glasgow postcodes (mixed deprivation)
('G1 1AA', 1, 'S01003001', 'Glasgow City'),
('G1 1AB', 1, 'S01003001', 'Glasgow City'),
('G1 2AA', 2, 'S01003002', 'Glasgow City'),
('G11 5AA', 3, 'S01003010', 'Glasgow City'),
('G12 8QQ', 8, 'S01003050', 'Glasgow City'),
('G12 0YN', 9, 'S01003051', 'Glasgow City'),
('G61 1AA', 10, 'S01003100', 'East Dunbartonshire'),

-- Edinburgh postcodes (mixed deprivation)
('EH1 1AA', 3, 'S01002001', 'City of Edinburgh'),
('EH1 2AA', 4, 'S01002002', 'City of Edinburgh'),
('EH3 5AA', 7, 'S01002010', 'City of Edinburgh'),
('EH4 1AA', 6, 'S01002020', 'City of Edinburgh'),
('EH10 4AA', 9, 'S01002050', 'City of Edinburgh'),
('EH12 8AA', 8, 'S01002060', 'City of Edinburgh'),
('EH6 5AA', 2, 'S01002070', 'City of Edinburgh'),
('EH15 1AA', 1, 'S01002080', 'City of Edinburgh'),

-- Dundee postcodes
('DD1 1AA', 2, 'S01004001', 'Dundee City'),
('DD2 1AA', 3, 'S01004010', 'Dundee City'),
('DD3 6AA', 1, 'S01004020', 'Dundee City'),
('DD4 7AA', 4, 'S01004030', 'Dundee City'),

-- Aberdeen postcodes
('AB10 1AA', 5, 'S01005001', 'Aberdeen City'),
('AB11 5AA', 3, 'S01005010', 'Aberdeen City'),
('AB15 8AA', 9, 'S01005020', 'Aberdeen City'),
('AB24 3AA', 2, 'S01005030', 'Aberdeen City'),

-- St Andrews postcodes
('KY16 9AA', 7, 'S01006001', 'Fife'),
('KY16 8AA', 6, 'S01006002', 'Fife'),

-- Stirling postcodes
('FK8 1AA', 4, 'S01007001', 'Stirling'),
('FK9 4AA', 5, 'S01007010', 'Stirling'),

-- Inverness postcodes
('IV1 1AA', 4, 'S01008001', 'Highland'),
('IV2 3AA', 5, 'S01008010', 'Highland'),

-- Paisley postcodes
('PA1 1AA', 1, 'S01009001', 'Renfrewshire'),
('PA2 6AA', 2, 'S01009010', 'Renfrewshire');

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on public tables
GRANT SELECT ON universities TO anon, authenticated;
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT ON simd_postcodes TO anon, authenticated;

-- Grant full access on user-specific tables to authenticated users
GRANT ALL ON students TO authenticated;
GRANT ALL ON saved_courses TO authenticated;
GRANT ALL ON student_grades TO authenticated;

-- Grant sequence usage for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
