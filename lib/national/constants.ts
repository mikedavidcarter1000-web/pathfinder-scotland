// Authority-15: shared constants for the national tier (above LA).

export type NationalStaffRole = 'national_admin' | 'national_analyst'

export const NATIONAL_ROLE_LABELS: Record<NationalStaffRole, string> = {
  national_admin: 'National Administrator',
  national_analyst: 'National Analyst',
}

export const NATIONAL_ROLES: NationalStaffRole[] = ['national_admin', 'national_analyst']

// Organisations that can be assigned to a national_staff row. Mirrors the
// CHECK constraint on national_staff.organisation -- keep in sync.
export const NATIONAL_ORGANISATIONS = [
  'Scottish Government',
  'Education Scotland',
  'Scottish Funding Council',
  'Qualifications Scotland',
  'Skills Development Scotland',
  'Pathfinder Scotland',
] as const

export type NationalOrganisation = (typeof NATIONAL_ORGANISATIONS)[number]

// Top-level routes for the national tier; layouts and guards reference
// these so a path change in one place propagates everywhere.
export const NATIONAL_ROUTES = {
  dashboard: '/national/dashboard',
  authorities: '/national/authorities',
  reports: '/national/reports',
  exports: '/national/exports',
  settings: '/national/settings',
  staffSettings: '/national/settings/staff',
} as const
