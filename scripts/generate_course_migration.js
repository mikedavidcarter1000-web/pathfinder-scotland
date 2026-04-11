#!/usr/bin/env node
/**
 * Generate SQL migration from course data JSON.
 *
 * Usage:  node scripts/generate_course_migration.js <courses_data.json> <output.sql>
 *
 * Input JSON structure:
 *   [
 *     {
 *       "name": "Course Name",
 *       "university_id": "uuid",
 *       "ucas_code": "X100",
 *       "degree_type": "bsc",
 *       "subject_area": "Computing Science",
 *       "duration_years": 4,
 *       "description": "One sentence.",
 *       "entry_requirements": { ... },
 *       "widening_access_requirements": { ... },
 *       "course_url": "https://..."
 *     },
 *     ...
 *   ]
 */

const fs = require('fs');
const path = require('path');

const ABERTAY_UUID = '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e';

const VALID_DEGREE_TYPES = new Set([
  'bsc', 'ba', 'ma', 'beng', 'meng', 'llb', 'mbchb', 'bds', 'bvm', 'bmus', 'bed', 'bnurs',
]);

// Map allowed subject_area values to existing DB values (normalisation)
const SUBJECT_AREA_ALIASES = {
  'Computer Science': 'Computing Science',
  'Computing': 'Computing Science',
  'Cybersecurity': 'Computing Science',
  'Cyber Security': 'Computing Science',
  'Games Development': 'Computing Science',
  'Game Design': 'Computing Science',
  'Data Science': 'Computing Science',
  'Artificial Intelligence': 'Computing Science',
  'Life Sciences': 'Biological Sciences',
  'Biology': 'Biological Sciences',
  'Biochemistry': 'Biological Sciences',
  'Zoology': 'Biological Sciences',
  'Genetics': 'Biological Sciences',
  'Microbiology': 'Biological Sciences',
  'Molecular Biology': 'Biological Sciences',
  'Neuroscience': 'Biological Sciences',
  'Physiology': 'Biological Sciences',
  'Anatomy': 'Biological Sciences',
  'Ecology': 'Biological Sciences',
  'Pharmacology': 'Pharmacy',
  'Accountancy': 'Business Management',
  'Accounting': 'Business Management',
  'Accounting and Finance': 'Business Management',
  'Finance': 'Business Management',
  'Marketing': 'Business Management',
  'Management': 'Business Management',
  'International Business': 'Business Management',
  'Human Resource Management': 'Business Management',
  'Events Management': 'Business Management',
  'Hospitality Management': 'Travel and Tourism',
  'Civil Engineering': 'Engineering',
  'Mechanical Engineering': 'Engineering',
  'Electrical Engineering': 'Engineering',
  'Chemical Engineering': 'Engineering',
  'Aerospace Engineering': 'Engineering',
  'Structural Engineering': 'Engineering',
  'Software Engineering': 'Engineering',
  'Petroleum Engineering': 'Engineering',
  'Electronics': 'Engineering',
  'Journalism': 'Media Studies',
  'Film': 'Media Studies',
  'Film and Television': 'Media Studies',
  'Television': 'Media Studies',
  'Broadcast': 'Media Studies',
  'Film and Media': 'Media Studies',
  'Communication Studies': 'Media Studies',
  'Public Relations': 'Media Studies',
  'Advertising': 'Media Studies',
  'Film Studies': 'Media Studies',
  'International Relations': 'Politics',
  'Government': 'Politics',
  'Public Policy': 'Politics',
  'Drama': 'Performing Arts',
  'Theatre': 'Performing Arts',
  'Dance': 'Performing Arts',
  'Acting': 'Performing Arts',
  'Musical Theatre': 'Performing Arts',
  'Graphic Design': 'Art and Design',
  'Fine Art': 'Art and Design',
  'Illustration': 'Art and Design',
  'Textile Design': 'Art and Design',
  'Product Design': 'Art and Design',
  'Fashion': 'Art and Design',
  'Fashion Design': 'Art and Design',
  'Interior Design': 'Art and Design',
  'Animation': 'Art and Design',
  'Architecture': 'Architecture',
  'Landscape Architecture': 'Architecture',
  'Urban Planning': 'Architecture',
  'Modern Languages': 'Modern Languages',
  'French': 'Modern Languages',
  'Spanish': 'Modern Languages',
  'German': 'Modern Languages',
  'Italian': 'Modern Languages',
  'Chinese': 'Modern Languages',
  'Japanese': 'Modern Languages',
  'Arabic': 'Modern Languages',
  'Russian': 'Modern Languages',
  'Portuguese': 'Modern Languages',
  'Linguistics': 'Modern Languages',
  'Translation': 'Modern Languages',
  'English Literature': 'English',
  'English Language': 'English',
  'Creative Writing': 'English',
  'Ancient History': 'History',
  'Archaeology': 'History',
  'Scottish History': 'History',
  'Classics': 'Classics',
  'Classical Studies': 'Classics',
  'Religious Studies': 'Theology and Divinity',
  'Theology': 'Theology and Divinity',
  'Divinity': 'Theology and Divinity',
  'Social Work': 'Social Work',
  'Social Policy': 'Sociology',
  'Social Sciences': 'Sociology',
  'Anthropology': 'Sociology',
  'Social Anthropology': 'Sociology',
  'Criminal Justice': 'Criminology',
  'Forensic Science': 'Biological Sciences',
  'Midwifery': 'Nursing',
  'Radiography': 'Health Sciences',
  'Paramedic': 'Health Sciences',
  'Paramedicine': 'Health Sciences',
  'Podiatry': 'Health Sciences',
  'Optometry': 'Health Sciences',
  'Nutrition': 'Health Sciences',
  'Dietetics': 'Health Sciences',
  'Occupational Therapy': 'Health Sciences',
  'Physiotherapy': 'Health Sciences',
  'Speech Therapy': 'Health Sciences',
  'Biomedical Science': 'Biological Sciences',
  'Biomedical Sciences': 'Biological Sciences',
  'Medical Science': 'Biological Sciences',
  'Agriculture': 'Agriculture',
  'Agricultural Science': 'Agriculture',
  'Aquaculture': 'Marine Science',
  'Marine Biology': 'Marine Science',
  'Oceanography': 'Marine Science',
  'Earth Science': 'Geology',
  'Earth Sciences': 'Geology',
  'Geophysics': 'Geology',
  'Environmental Geoscience': 'Environmental Science',
  'Environmental Studies': 'Environmental Science',
  'Sustainability': 'Environmental Science',
  'Tourism': 'Travel and Tourism',
  'Hospitality': 'Travel and Tourism',
  'Physical Education': 'Sport and Fitness',
  'Sports Science': 'Sport and Fitness',
  'Sport Science': 'Sport and Fitness',
  'Sport and Exercise Science': 'Sport and Fitness',
  'Sport Coaching': 'Sport and Fitness',
  'Food Science': 'Food Science',
  'Music Performance': 'Music',
  'Astrophysics': 'Physics',
  'Astronomy': 'Physics',
  'Statistics': 'Mathematics',
  'Actuarial Science': 'Mathematics',
  'Primary Education': 'Education',
  'Secondary Education': 'Education',
  'Teaching': 'Education',
  'Childhood Studies': 'Education',
};

const SUBJECTS_IN_DB = new Set([
  'Administration and IT', 'Applications of Mathematics', 'Applied Science', 'Art and Design',
  'Barista Skills', 'Biology', 'BSL (British Sign Language)', 'Built Environment',
  'Business Management', 'Chemistry', 'Classical Studies', 'Computer Games Development',
  'Computing Science', 'Creative Thinking', 'Criminology', 'Cyber Security', 'Cycle Maintenance',
  'Dance', 'Data Science', 'Design and Manufacture', 'Digital Media', 'Drama',
  'Duke of Edinburgh Bronze Award', 'Early Learning and Childcare', 'Economics',
  'Engineering Science', 'English', 'Enterprise and 3D Print Club', 'Environmental Science',
  'ESOL', 'Event Organisation', 'Exercise and Fitness Leadership', 'Experimenting in Art',
  'Fashion and Textile Technology', 'Film and Media', 'Film and Screen', 'French',
  'Gaelic (Learners)', 'Gàidhlig', 'Geography', 'German', 'Graphic Communication',
  'Hair and Make Up Design', 'Health and Food Technology', 'History',
  'Hospitality: Practical Cake Craft', 'Human Biology', 'Italian', 'Jewellery Making',
  'Journalism', 'Junk Kouture', 'Laboratory Science', 'Languages for Life and Work Award',
  'Latin', 'Mandarin', 'Mathematics', 'Media Studies', 'Modern Studies', 'Music',
  'Music Technology', 'Musical Theatre', 'Netball Leadership and Umpiring', 'People and Society',
  'Philosophy', 'Photography', 'Physical Education', 'Physics', 'Politics', 'Practical Cookery',
  'Practical Metalworking', 'Practical Woodworking', 'Psychology',
  'Religious, Moral and Philosophical Studies (RMPS)', 'Scottish Studies', 'Social Anthropology',
  'Sociology', 'Spanish', 'Sport and Fitness', 'Sports Leadership', 'Travel and Tourism',
  'Young STEM Leader',
]);

// Map free-text required subject names to subjects table names (case-insensitive)
const SUBJECT_NAME_ALIASES = {
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'mathematics': 'Mathematics',
  'further mathematics': 'Mathematics',
  'applications of mathematics': 'Applications of Mathematics',
  'chem': 'Chemistry',
  'chemistry': 'Chemistry',
  'bio': 'Biology',
  'biology': 'Biology',
  'human biology': 'Human Biology',
  'physics': 'Physics',
  'english': 'English',
  'english literature': 'English',
  'english language': 'English',
  'computing science': 'Computing Science',
  'computing': 'Computing Science',
  'computer science': 'Computing Science',
  'engineering science': 'Engineering Science',
  'art': 'Art and Design',
  'art and design': 'Art and Design',
  'design': 'Art and Design',
  'graphic communication': 'Graphic Communication',
  'graphics': 'Graphic Communication',
  'geography': 'Geography',
  'history': 'History',
  'modern studies': 'Modern Studies',
  'business management': 'Business Management',
  'business': 'Business Management',
  'economics': 'Economics',
  'psychology': 'Psychology',
  'french': 'French',
  'spanish': 'Spanish',
  'german': 'German',
  'italian': 'Italian',
  'latin': 'Latin',
  'gaelic': 'Gàidhlig',
  'gàidhlig': 'Gàidhlig',
  'music': 'Music',
  'drama': 'Drama',
  'philosophy': 'Philosophy',
  'politics': 'Politics',
  'religious, moral and philosophical studies': 'Religious, Moral and Philosophical Studies (RMPS)',
  'religious studies': 'Religious, Moral and Philosophical Studies (RMPS)',
  'rmps': 'Religious, Moral and Philosophical Studies (RMPS)',
  'design and manufacture': 'Design and Manufacture',
  'physical education': 'Physical Education',
  'cyber security': 'Cyber Security',
  'environmental science': 'Environmental Science',
  'sociology': 'Sociology',
  'data science': 'Data Science',
  'classical studies': 'Classical Studies',
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function jsonbLiteral(obj) {
  if (!obj || Object.keys(obj).length === 0) return "'{}'::jsonb";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function normaliseSubjectArea(sa) {
  if (!sa) return null;
  if (SUBJECT_AREA_ALIASES[sa]) return SUBJECT_AREA_ALIASES[sa];
  return sa;
}

function resolveRequiredSubject(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  if (SUBJECT_NAME_ALIASES[lower]) return SUBJECT_NAME_ALIASES[lower];
  // try case-insensitive match
  for (const s of SUBJECTS_IN_DB) {
    if (s.toLowerCase() === lower) return s;
  }
  return null;
}

function minGradeFromHighers(highers) {
  if (!highers || typeof highers !== 'string') return null;
  // Get the minimum letter grade in the highers string (last letter)
  const letters = highers.split('').filter(c => /[A-D]/i.test(c));
  if (letters.length === 0) return null;
  const min = letters.reduce((acc, c) => {
    const letterVal = c.toUpperCase().charCodeAt(0);
    const accVal = acc.charCodeAt(0);
    return letterVal > accVal ? c.toUpperCase() : acc;
  }, 'A');
  return min;
}

function validateCourse(c, idx) {
  const errors = [];
  if (!c.name) errors.push('missing name');
  if (!c.university_id) errors.push('missing university_id');
  if (c.degree_type && !VALID_DEGREE_TYPES.has(c.degree_type)) {
    errors.push(`invalid degree_type: ${c.degree_type}`);
  }
  return errors;
}

function main() {
  const [,, inputPath, outputPath] = process.argv;

  if (!inputPath || !outputPath) {
    console.error('Usage: node generate_course_migration.js <input.json> <output.sql>');
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const courses = JSON.parse(raw);

  console.log(`Loaded ${courses.length} courses from ${inputPath}`);

  const lines = [];
  const errors = [];
  const slugCounts = new Map();
  const seenKeys = new Set(); // university_id + name lowercased
  const subjectAreas = new Set();

  lines.push('-- Generated course migration');
  lines.push('-- Source: scripts/generate_course_migration.js');
  lines.push(`-- Course count: ${courses.length}`);
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  // Emit course inserts
  lines.push('-- ============================================================================');
  lines.push('-- COURSE INSERTS');
  lines.push('-- ============================================================================');
  lines.push('');

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    // Resolve Abertay placeholder
    if (c.university_id === 'ABERTAY_UUID') {
      c.university_id = ABERTAY_UUID;
    }

    const errs = validateCourse(c, i);
    if (errs.length) {
      errors.push(`[${i}] ${c.name || 'unknown'}: ${errs.join(', ')}`);
      continue;
    }

    const key = `${c.university_id}:${c.name.toLowerCase()}`;
    if (seenKeys.has(key)) {
      errors.push(`[${i}] duplicate in input: ${c.name}`);
      continue;
    }
    seenKeys.add(key);

    let slug = slugify(c.name);
    const slugKey = `${c.university_id}:${slug}`;
    const currentCount = slugCounts.get(slugKey) || 0;
    if (currentCount > 0) slug = `${slug}-${currentCount + 1}`;
    slugCounts.set(slugKey, currentCount + 1);

    const subjectArea = normaliseSubjectArea(c.subject_area);
    if (subjectArea) subjectAreas.add(subjectArea);

    lines.push(`INSERT INTO courses (university_id, name, slug, ucas_code, degree_type, subject_area, description, duration_years, entry_requirements, widening_access_requirements, course_url)`);
    lines.push(`VALUES (`);
    lines.push(`  ${sqlEscape(c.university_id)},`);
    lines.push(`  ${sqlEscape(c.name)},`);
    lines.push(`  ${sqlEscape(slug)},`);
    lines.push(`  ${sqlEscape(c.ucas_code || null)},`);
    lines.push(`  ${c.degree_type ? sqlEscape(c.degree_type) + '::degree_type' : 'NULL'},`);
    lines.push(`  ${sqlEscape(subjectArea)},`);
    lines.push(`  ${sqlEscape(c.description || null)},`);
    lines.push(`  ${c.duration_years ?? 'NULL'},`);
    lines.push(`  ${jsonbLiteral(c.entry_requirements || {})},`);
    lines.push(`  ${jsonbLiteral(c.widening_access_requirements || {})},`);
    lines.push(`  ${sqlEscape(c.course_url || null)}`);
    lines.push(`)`);
    lines.push(`ON CONFLICT DO NOTHING;`);
    lines.push('');
  }

  // Emit course_subject_requirements using deferred resolution
  lines.push('-- ============================================================================');
  lines.push('-- COURSE_SUBJECT_REQUIREMENTS INSERTS');
  lines.push('-- ============================================================================');
  lines.push('-- Matches required_subjects in entry_requirements to subjects table');
  lines.push('');

  for (const c of courses) {
    if (c.university_id === 'ABERTAY_UUID') c.university_id = ABERTAY_UUID;

    const req = c.entry_requirements || {};
    const reqSubjects = req.required_subjects || [];
    if (!Array.isArray(reqSubjects) || reqSubjects.length === 0) continue;

    const highers = req.highers;
    const minGrade = minGradeFromHighers(highers); // fallback min grade

    for (const rs of reqSubjects) {
      const resolved = resolveRequiredSubject(rs);
      if (!resolved) {
        errors.push(`Could not resolve required subject "${rs}" for course ${c.name}`);
        continue;
      }
      lines.push(`INSERT INTO course_subject_requirements (course_id, subject_id, qualification_level, min_grade, is_mandatory)`);
      lines.push(`SELECT c.id, s.id, 'higher', ${sqlEscape(minGrade || 'C')}, true`);
      lines.push(`FROM courses c, subjects s`);
      lines.push(`WHERE c.university_id = ${sqlEscape(c.university_id)}`);
      lines.push(`  AND LOWER(c.name) = ${sqlEscape(c.name.toLowerCase())}`);
      lines.push(`  AND s.name = ${sqlEscape(resolved)}`);
      lines.push(`ON CONFLICT DO NOTHING;`);
      lines.push('');
    }
  }

  lines.push('COMMIT;');
  lines.push('');

  fs.writeFileSync(outputPath, lines.join('\n'));

  console.log(`\nWrote SQL to ${outputPath}`);
  console.log(`Distinct subject_areas encountered: ${[...subjectAreas].sort().join(', ')}`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length) errors.slice(0, 20).forEach(e => console.log(`  - ${e}`));
  if (errors.length > 20) console.log(`  ...and ${errors.length - 20} more`);
}

main();
