// Scottish local authorities (32) -- matches convention used across project.
// See lib/postcode-validation.ts ADMIN_DISTRICT_ALIASES for the one alias
// (Na h-Eileanan Siar -> Comhairle nan Eilean Siar).
// Synchronised with data/scottish-councils.json (same list, JSON file used
// by callers that need to ship the list to the client without importing
// TypeScript).
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

// 8 school-staff roles. `class_teacher` and `faculty_head` are
// school-internal roles (staff invited by admins via the /school/join
// flow, not registration contacts). The registration UI still exposes
// only the 6 "contact" roles (see CONTACT_ROLES in
// app/school/register/page.tsx) because class teachers and faculty heads
// cannot register a school themselves.
export type SchoolStaffRole =
  | 'class_teacher'
  | 'faculty_head'
  | 'guidance_teacher'
  | 'pt_guidance'
  | 'dyw_coordinator'
  | 'depute'
  | 'head_teacher'
  | 'admin'

export const STAFF_ROLE_LABELS: Record<SchoolStaffRole, string> = {
  class_teacher: 'Class teacher',
  faculty_head: 'Faculty head',
  guidance_teacher: 'Guidance teacher',
  pt_guidance: 'Principal Teacher of Guidance',
  dyw_coordinator: 'DYW coordinator',
  depute: 'Depute head teacher',
  head_teacher: 'Head teacher',
  admin: 'School admin',
}

// Roles that get individual-student view by default (named guidance / DYW
// / pastoral-support roles). SMT (head_teacher/depute) also get it via
// the permission matrix; they are not listed here because their access
// flows through `is_school_admin`, not via role.
export const INDIVIDUAL_VIEW_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
]

// Per-role default permission set, used by the staff-invite and
// registration flows to initialise school_staff permission booleans.
// The schema default is `false` for every permission, so any role that
// omits a permission below will have that permission denied until an
// admin toggles it explicitly.
export type StaffPermissions = {
  can_view_individual_students: boolean
  can_view_tracking: boolean
  can_edit_tracking: boolean
  can_view_guidance_notes: boolean
  can_edit_guidance_notes: boolean
  can_view_analytics: boolean
  can_manage_school: boolean
}

export const DEFAULT_ROLE_PERMISSIONS: Record<SchoolStaffRole, StaffPermissions> = {
  class_teacher: {
    can_view_individual_students: false,
    can_view_tracking: true,
    can_edit_tracking: true,
    can_view_guidance_notes: false,
    can_edit_guidance_notes: false,
    can_view_analytics: false,
    can_manage_school: false,
  },
  faculty_head: {
    can_view_individual_students: false,
    can_view_tracking: true,
    can_edit_tracking: true,
    can_view_guidance_notes: false,
    can_edit_guidance_notes: false,
    can_view_analytics: true,
    can_manage_school: false,
  },
  guidance_teacher: {
    can_view_individual_students: true,
    can_view_tracking: true,
    can_edit_tracking: false,
    can_view_guidance_notes: true,
    can_edit_guidance_notes: true,
    can_view_analytics: true,
    can_manage_school: false,
  },
  pt_guidance: {
    can_view_individual_students: true,
    can_view_tracking: true,
    can_edit_tracking: false,
    can_view_guidance_notes: true,
    can_edit_guidance_notes: true,
    can_view_analytics: true,
    can_manage_school: false,
  },
  dyw_coordinator: {
    can_view_individual_students: true,
    can_view_tracking: true,
    can_edit_tracking: false,
    can_view_guidance_notes: false,
    can_edit_guidance_notes: false,
    can_view_analytics: true,
    can_manage_school: false,
  },
  depute: {
    can_view_individual_students: true,
    can_view_tracking: true,
    can_edit_tracking: true,
    can_view_guidance_notes: true,
    can_edit_guidance_notes: true,
    can_view_analytics: true,
    can_manage_school: true,
  },
  head_teacher: {
    can_view_individual_students: true,
    can_view_tracking: true,
    can_edit_tracking: true,
    can_view_guidance_notes: true,
    can_edit_guidance_notes: true,
    can_view_analytics: true,
    can_manage_school: true,
  },
  admin: {
    can_view_individual_students: false,
    can_view_tracking: true,
    can_edit_tracking: false,
    can_view_guidance_notes: false,
    can_edit_guidance_notes: false,
    can_view_analytics: true,
    can_manage_school: true,
  },
}

export const FOUNDING_SCHOOLS_CAP = 10
export const TRIAL_MONTHS = 12

export const SCHOOL_TYPES = ['secondary', 'all_through', 'special', 'independent'] as const
