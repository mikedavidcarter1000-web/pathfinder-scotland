// Grade values for different qualification types
export const GRADE_VALUES = {
  higher: {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
  },
  advanced_higher: {
    A: 6,
    B: 5,
    C: 4,
    D: 3,
  },
  national_5: {
    A: 3,
    B: 2,
    C: 1,
    D: 0,
  },
  a_level: {
    'A*': 7,
    A: 6,
    B: 5,
    C: 4,
    D: 3,
    E: 2,
  },
  btec: {
    'D*': 6,
    D: 5,
    M: 4,
    P: 3,
  },
} as const

// UCAS tariff points
export const UCAS_POINTS = {
  higher: {
    A: 33,
    B: 27,
    C: 21,
    D: 15,
  },
  advanced_higher: {
    A: 56,
    B: 48,
    C: 40,
    D: 32,
  },
  a_level: {
    'A*': 56,
    A: 48,
    B: 40,
    C: 32,
    D: 24,
    E: 16,
  },
} as const

// Common subjects by qualification type
export const SUBJECTS = {
  higher: [
    'English',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'History',
    'Geography',
    'Modern Studies',
    'Business Management',
    'Art & Design',
    'Music',
    'Drama',
    'Physical Education',
    'Psychology',
    'Sociology',
    'Philosophy',
    'Computing Science',
    'French',
    'Spanish',
    'German',
    'Gaelic',
    'Latin',
    'Classical Studies',
    'Religious, Moral & Philosophical Studies',
    'Economics',
    'Accounting',
    'Administration & IT',
    'Design & Manufacture',
    'Engineering Science',
    'Graphic Communication',
    'Health & Food Technology',
    'Hospitality: Practical Cookery',
    'Media',
    'Photography',
    'Politics',
    'Human Biology',
  ],
  advanced_higher: [
    'English',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'History',
    'Geography',
    'Modern Studies',
    'Art & Design',
    'Music',
    'Drama',
    'Psychology',
    'Philosophy',
    'Computing Science',
    'French',
    'Spanish',
    'German',
    'Latin',
    'Classical Studies',
    'Economics',
    'Business Management',
    'Engineering Science',
    'Graphic Communication',
    'Product Design',
    'Politics',
  ],
  national_5: [
    'English',
    'Mathematics',
    'Applications of Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'History',
    'Geography',
    'Modern Studies',
    'Business Management',
    'Art & Design',
    'Music',
    'Drama',
    'Physical Education',
    'Computing Science',
    'French',
    'Spanish',
    'German',
    'Gaelic',
    'Latin',
    'Religious, Moral & Philosophical Studies',
    'Accounting',
    'Administration & IT',
    'Design & Manufacture',
    'Engineering Science',
    'Graphic Communication',
    'Health & Food Technology',
    'Hospitality: Practical Cookery',
    'Media',
  ],
} as const

// Subject areas for course categorisation
export const SUBJECT_AREAS = [
  'Accounting & Finance',
  'Agriculture & Forestry',
  'Architecture',
  'Art & Design',
  'Biological Sciences',
  'Business & Management',
  'Chemistry',
  'Computer Science',
  'Dentistry',
  'Drama & Theatre',
  'Economics',
  'Education & Teaching',
  'Engineering',
  'English & Creative Writing',
  'Environmental Science',
  'Film & Media',
  'Geography',
  'History',
  'Languages',
  'Law',
  'Mathematics',
  'Medicine',
  'Music',
  'Nursing & Midwifery',
  'Pharmacy',
  'Philosophy',
  'Physics',
  'Politics',
  'Psychology',
  'Social Sciences',
  'Sport & Exercise',
  'Veterinary Medicine',
] as const

// University types
export const UNIVERSITY_TYPES = {
  ancient: {
    label: 'Ancient',
    description: 'Founded before 1600, steeped in tradition',
    color: 'purple',
  },
  traditional: {
    label: 'Traditional',
    description: 'Established research-intensive universities',
    color: 'blue',
  },
  modern: {
    label: 'Modern',
    description: 'Post-1992 universities, often vocational focus',
    color: 'green',
  },
  specialist: {
    label: 'Specialist',
    description: 'Focused on specific disciplines',
    color: 'orange',
  },
} as const

// School stages
export const SCHOOL_STAGES = {
  s3: {
    label: 'S3',
    description: 'Third year of secondary school',
    yearGroup: 9,
  },
  s4: {
    label: 'S4',
    description: 'Fourth year (National 5 year)',
    yearGroup: 10,
  },
  s5: {
    label: 'S5',
    description: 'Fifth year (Higher year)',
    yearGroup: 11,
  },
  s6: {
    label: 'S6',
    description: 'Sixth year (Advanced Higher)',
    yearGroup: 12,
  },
  college: {
    label: 'College',
    description: 'Further education college student',
    yearGroup: null,
  },
  mature: {
    label: 'Mature Student',
    description: 'Adult returning to education',
    yearGroup: null,
  },
} as const

// Degree types
export const DEGREE_TYPES = {
  bsc: {
    label: 'BSc',
    fullName: 'Bachelor of Science',
    duration: 4,
  },
  ba: {
    label: 'BA',
    fullName: 'Bachelor of Arts',
    duration: 4,
  },
  ma: {
    label: 'MA (Hons)',
    fullName: 'Master of Arts',
    duration: 4,
  },
  beng: {
    label: 'BEng',
    fullName: 'Bachelor of Engineering',
    duration: 4,
  },
  meng: {
    label: 'MEng',
    fullName: 'Master of Engineering',
    duration: 5,
  },
  llb: {
    label: 'LLB',
    fullName: 'Bachelor of Laws',
    duration: 4,
  },
  mbchb: {
    label: 'MBChB',
    fullName: 'Bachelor of Medicine and Surgery',
    duration: 5,
  },
  bds: {
    label: 'BDS',
    fullName: 'Bachelor of Dental Surgery',
    duration: 5,
  },
  bvm: {
    label: 'BVM&S',
    fullName: 'Bachelor of Veterinary Medicine and Surgery',
    duration: 5,
  },
  bmus: {
    label: 'BMus',
    fullName: 'Bachelor of Music',
    duration: 4,
  },
  bed: {
    label: 'BEd',
    fullName: 'Bachelor of Education',
    duration: 4,
  },
  bnurs: {
    label: 'BNurs',
    fullName: 'Bachelor of Nursing',
    duration: 4,
  },
} as const

// SIMD decile descriptions
export const SIMD_DESCRIPTIONS = {
  1: 'Most deprived 10%',
  2: 'Most deprived 11-20%',
  3: 'Most deprived 21-30%',
  4: 'Most deprived 31-40%',
  5: 'Middle 41-50%',
  6: 'Middle 51-60%',
  7: 'Least deprived 31-40%',
  8: 'Least deprived 21-30%',
  9: 'Least deprived 11-20%',
  10: 'Least deprived 10%',
} as const

// URLs
export const EXTERNAL_URLS = {
  ucas: 'https://www.ucas.com',
  saas: 'https://www.saas.gov.uk',
  sqa: 'https://www.sqa.org.uk',
  simd: 'https://www.gov.scot/collections/scottish-index-of-multiple-deprivation-2020/',
} as const
