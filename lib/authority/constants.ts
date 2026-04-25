export type AuthorityStaffRole = 'la_admin' | 'qio' | 'data_analyst'

export const AUTHORITY_ROLE_LABELS: Record<AuthorityStaffRole, string> = {
  la_admin: 'LA Administrator',
  qio: 'Quality Improvement Officer',
  data_analyst: 'Data Analyst',
}

export const AUTHORITY_ROLES: AuthorityStaffRole[] = ['la_admin', 'qio', 'data_analyst']

export const RESEND_FROM = 'Pathfinder Scotland <noreply@pathfinderscot.co.uk>'

// LA portal admin notification recipient
export const LA_ADMIN_NOTIFY_EMAIL = 'mike.david.carter1000@gmail.com'

// Council email domain patterns that indicate an official LA address
export const COUNCIL_DOMAIN_PATTERNS = [
  '.gov.uk',
  '.gov.scot',
  '.gov.scotland',
  '.council.gov.uk',
  '.highland.gov.uk',
  '.shetland.gov.uk',
  '.orkney.gov.uk',
]

export function isOfficialCouncilDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return COUNCIL_DOMAIN_PATTERNS.some((p) => domain.endsWith(p))
}
