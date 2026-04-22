// Scottish local authorities (32) — matches convention used across project.
// See lib/postcode-validation.ts ADMIN_DISTRICT_ALIASES for the one alias
// (Na h-Eileanan Siar -> Comhairle nan Eilean Siar).
export const SCOTTISH_LOCAL_AUTHORITIES = [
  'Aberdeen City',
  'Aberdeenshire',
  'Angus',
  'Argyll and Bute',
  'City of Edinburgh',
  'Clackmannanshire',
  'Comhairle nan Eilean Siar',
  'Dumfries and Galloway',
  'Dundee City',
  'East Ayrshire',
  'East Dunbartonshire',
  'East Lothian',
  'East Renfrewshire',
  'Falkirk',
  'Fife',
  'Glasgow City',
  'Highland',
  'Inverclyde',
  'Midlothian',
  'Moray',
  'North Ayrshire',
  'North Lanarkshire',
  'Orkney Islands',
  'Perth and Kinross',
  'Renfrewshire',
  'Scottish Borders',
  'Shetland Islands',
  'South Ayrshire',
  'South Lanarkshire',
  'Stirling',
  'West Dunbartonshire',
  'West Lothian',
] as const

export type SchoolStaffRole =
  | 'guidance_teacher'
  | 'pt_guidance'
  | 'dyw_coordinator'
  | 'depute'
  | 'head_teacher'
  | 'admin'

export const STAFF_ROLE_LABELS: Record<SchoolStaffRole, string> = {
  guidance_teacher: 'Guidance teacher',
  pt_guidance: 'Principal Teacher of Guidance',
  dyw_coordinator: 'DYW coordinator',
  depute: 'Depute head teacher',
  head_teacher: 'Head teacher',
  admin: 'School admin',
}

// Roles that get individual-student view by default.
export const INDIVIDUAL_VIEW_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
]

export const FOUNDING_SCHOOLS_CAP = 10
export const TRIAL_MONTHS = 12

export const SCHOOL_TYPES = ['secondary', 'all_through', 'special', 'independent'] as const
