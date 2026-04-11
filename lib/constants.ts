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
  s2: {
    label: 'S2',
    description: 'Going into S3',
    offer: 'Plan your S3 subject choices and explore career sectors.',
    yearGroup: 8,
  },
  s3: {
    label: 'S3',
    description: 'Going into S4',
    offer: 'Pick your N5 subjects and start mapping pathways.',
    yearGroup: 9,
  },
  s4: {
    label: 'S4',
    description: 'Going into S5',
    offer: 'Choose Highers and match them to university courses.',
    yearGroup: 10,
  },
  s5: {
    label: 'S5',
    description: 'Going into S6',
    offer: 'Track your Higher results and plan Advanced Highers.',
    yearGroup: 11,
  },
  s6: {
    label: 'S6',
    description: 'Applying to university',
    offer: 'Match your grades to UCAS courses and check entry requirements.',
    yearGroup: 12,
  },
  college: {
    label: 'College',
    description: 'Further education college student',
    offer: 'Explore degree pathways from your college course.',
    yearGroup: null,
  },
  mature: {
    label: 'Mature Student',
    description: 'Adult returning to education',
    offer: 'Find routes back into higher education.',
    yearGroup: null,
  },
} as const

// School stages shown as cards in onboarding (in display order). Excludes
// college / mature which the onboarding card flow doesn't currently surface.
export const ONBOARDING_STAGE_CARDS: Array<keyof typeof SCHOOL_STAGES> = [
  's2',
  's3',
  's4',
  's5',
  's6',
]

// Most common SQA subjects shown as the default checklist in onboarding's
// batch grade entry. Order is meaningful — the checklist renders these in
// this exact sequence so the most-picked subjects appear first.
export const COMMON_SUBJECTS_BY_LEVEL: Record<'higher' | 'advanced_higher' | 'national_5', string[]> = {
  higher: [
    'English',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'History',
    'Geography',
    'Modern Studies',
    'Art and Design',
    'Music',
    'French',
    'Spanish',
    'Physical Education',
    'Computing Science',
    'Business Management',
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
    'Art and Design',
    'Music',
    'French',
    'Spanish',
    'Computing Science',
    'Business Management',
  ],
  national_5: [
    'English',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'History',
    'Geography',
    'Modern Studies',
    'Art and Design',
    'Music',
    'French',
    'Spanish',
    'Physical Education',
    'Computing Science',
    'Business Management',
  ],
}

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

// Curricular area badge colours -- matches the Pathfinder design skill file.
// Uses a 10%-opacity background + full-colour text, implemented with tailwind
// classes that point at the same hex values defined in globals.css custom props.
export const CURRICULAR_AREA_COLOURS: Record<string, { bg: string; text: string; border: string; bar: string; dot: string }> = {
  Languages:                      { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100',    bar: 'from-blue-500 to-blue-600',       dot: 'bg-blue-500' },
  Mathematics:                    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100',  bar: 'from-indigo-500 to-indigo-600',   dot: 'bg-indigo-500' },
  Sciences:                       { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', bar: 'from-emerald-500 to-emerald-600', dot: 'bg-emerald-500' },
  'Social Studies':               { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   bar: 'from-amber-400 to-amber-500',     dot: 'bg-amber-500' },
  'Expressive Arts':              { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-100',  bar: 'from-violet-500 to-violet-600',   dot: 'bg-violet-500' },
  Technologies:                   { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   bar: 'from-slate-500 to-slate-600',     dot: 'bg-slate-500' },
  'Religious and Moral Education':{ bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100',    bar: 'from-rose-500 to-rose-600',       dot: 'bg-rose-500' },
  'Health and Wellbeing':         { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-100',    bar: 'from-teal-500 to-teal-600',       dot: 'bg-teal-500' },
}

export const DEFAULT_CURRICULAR_AREA_COLOUR = {
  bg: 'bg-gray-50',
  text: 'text-gray-700',
  border: 'border-gray-200',
  bar: 'from-gray-400 to-gray-500',
  dot: 'bg-gray-400',
}

// Resolves a curricular area name to its colour palette, normalising case,
// whitespace, and common punctuation variants ("&" vs "and") so that minor
// seed differences don't cause a silent fall-through to the gray default.
export function getCurricularAreaColour(name: string | null | undefined) {
  if (!name) return DEFAULT_CURRICULAR_AREA_COLOUR
  const exact = CURRICULAR_AREA_COLOURS[name]
  if (exact) return exact
  const normalised = name.trim().replace(/\s+&\s+/g, ' and ').toLowerCase()
  for (const key of Object.keys(CURRICULAR_AREA_COLOURS)) {
    if (key.toLowerCase() === normalised) return CURRICULAR_AREA_COLOURS[key]
  }
  return DEFAULT_CURRICULAR_AREA_COLOUR
}

// Short labels for SQA qualification levels used across pathway pages
export const QUALIFICATION_LEVEL_LABELS: Record<string, string> = {
  bge: 'BGE',
  n3: 'N3',
  n4: 'N4',
  n5: 'N5',
  higher: 'Higher',
  adv_higher: 'Advanced Higher',
}

// Relevance style for subject ↔ career sector links
export const RELEVANCE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  essential:   { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    label: 'Essential' },
  recommended: { bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', label: 'Recommended' },
  related:     { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   label: 'Related' },
}

// AI impact ratings — sourced from Anthropic (2024), OpenAI/UPenn (2023), McKinsey (2023).
// The three levels describe exposure to AI-driven change, not desirability.
export type AiImpactRating = 'human-centric' | 'ai-augmented' | 'ai-exposed'

export const AI_IMPACT_META: Record<
  AiImpactRating,
  {
    label: string
    shortLabel: string
    summary: string
    bg: string
    text: string
    dot: string
  }
> = {
  'human-centric': {
    label: 'Human-centric',
    shortLabel: 'Human-centric',
    summary: 'Low AI disruption risk',
    bg: 'rgba(16, 185, 129, 0.12)',
    text: 'var(--pf-green-500)',
    dot: 'var(--pf-green-500)',
  },
  'ai-augmented': {
    label: 'AI-augmented',
    shortLabel: 'AI-augmented',
    summary: 'AI will change how this work is done',
    bg: 'rgba(245, 158, 11, 0.14)',
    text: 'var(--pf-amber-500)',
    dot: 'var(--pf-amber-500)',
  },
  'ai-exposed': {
    label: 'AI-exposed',
    shortLabel: 'AI-exposed',
    summary: 'Significant AI-driven change expected',
    bg: 'rgba(239, 68, 68, 0.12)',
    text: 'var(--pf-red-500)',
    dot: 'var(--pf-red-500)',
  },
}

export const AI_IMPACT_DEFAULT_SOURCE =
  'Based on research by Anthropic (2024), OpenAI/University of Pennsylvania (2023), and McKinsey Global Institute (2023). Last updated April 2026.'

export function isAiImpactRating(value: string | null | undefined): value is AiImpactRating {
  return value === 'human-centric' || value === 'ai-augmented' || value === 'ai-exposed'
}

// URLs
export const EXTERNAL_URLS = {
  ucas: 'https://www.ucas.com',
  saas: 'https://www.saas.gov.uk',
  sqa: 'https://www.sqa.org.uk',
  simd: 'https://www.gov.scot/collections/scottish-index-of-multiple-deprivation-2020/',
} as const
