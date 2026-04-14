import type { OfferType, SupportGroup } from '@/types/offers'

// Discount badge colours by offer_type, mapped to inline styles so we don't
// depend on Tailwind config additions.
export const OFFER_TYPE_BADGE: Record<OfferType, { bg: string; fg: string; label: string }> = {
  entitlement: {
    bg: 'rgba(16, 185, 129, 0.14)',
    fg: '#047857',
    label: 'Entitlement',
  },
  free_resource: {
    bg: 'rgba(59, 130, 246, 0.14)',
    fg: '#1D4ED8',
    label: 'Free',
  },
  general_discount: {
    bg: 'rgba(245, 158, 11, 0.16)',
    fg: '#B45309',
    label: 'Discount',
  },
  affiliate: {
    bg: 'rgba(245, 158, 11, 0.16)',
    fg: '#B45309',
    label: 'Discount',
  },
  exclusive: {
    bg: 'rgba(139, 92, 246, 0.14)',
    fg: '#6D28D9',
    label: 'Exclusive',
  },
  sponsored: {
    bg: 'rgba(244, 63, 94, 0.14)',
    fg: '#BE123C',
    label: 'Sponsored',
  },
  general: {
    bg: 'var(--pf-grey-100)',
    fg: 'var(--pf-grey-900)',
    label: 'Offer',
  },
}

// Collapse an array of eligible stages into compact human-readable pills.
// "s1..s6" -> ["S1-S6"]; "s5,s6" -> ["S5-S6"]; undergraduate/postgraduate/college
// become "Uni", "Postgrad", "College" respectively.
export function collapseStages(stages: string[]): string[] {
  if (!stages || stages.length === 0) return []

  const schoolOrder = ['s1', 's2', 's3', 's4', 's5', 's6']
  const schoolPresent = schoolOrder.filter((s) => stages.includes(s))
  const result: string[] = []

  if (schoolPresent.length > 0) {
    // Find contiguous runs (data may have gaps, though normally doesn't).
    let runStart = schoolOrder.indexOf(schoolPresent[0])
    let runEnd = runStart
    for (let i = 1; i < schoolPresent.length; i++) {
      const idx = schoolOrder.indexOf(schoolPresent[i])
      if (idx === runEnd + 1) {
        runEnd = idx
      } else {
        result.push(formatSchoolRun(schoolOrder[runStart], schoolOrder[runEnd]))
        runStart = idx
        runEnd = idx
      }
    }
    result.push(formatSchoolRun(schoolOrder[runStart], schoolOrder[runEnd]))
  }

  if (stages.includes('college')) result.push('College')
  if (stages.includes('undergraduate')) result.push('Uni')
  if (stages.includes('postgraduate')) result.push('Postgrad')

  return result
}

function formatSchoolRun(start: string, end: string): string {
  if (start === end) return start.toUpperCase()
  return `${start.toUpperCase()}-${end.toUpperCase()}`
}

export const SUPPORT_GROUP_LABELS: Record<SupportGroup, string> = {
  'young-carers': 'Young carers',
  'estranged-students': 'Estranged students',
  'young-parents': 'Young parents',
  'refugees-asylum-seekers': 'Refugees / asylum seekers',
  'esol-eal': 'ESOL / EAL',
  'disability': 'Disability',
  'lgbtq': 'LGBTQ+',
  'mature-students': 'Mature students',
  'grt': 'GRT',
  'home-educated': 'Home-educated',
  'early-leavers': 'Early leavers',
  'rural-island': 'Rural / island',
  'care-experienced': 'Care-experienced',
}

export const SUPPORT_GROUP_ROUTES: Record<SupportGroup, string | null> = {
  'young-carers': '/support/young-carers',
  'estranged-students': '/support/estranged-students',
  'young-parents': '/support/young-parents',
  'refugees-asylum-seekers': '/support/refugees-asylum-seekers',
  'esol-eal': '/support/esol-eal',
  'disability': '/support/disability',
  'lgbtq': '/support/lgbtq',
  'mature-students': '/support/mature-students',
  'grt': '/support/grt',
  'home-educated': '/support/home-educated',
  'early-leavers': '/support/early-leavers',
  'rural-island': '/support/rural-island',
  'care-experienced': null,
}

// Map Lucide icon names (stored in offer_categories.icon) to inline SVG paths.
// Only the icons actually used by the 15 seeded categories are mapped.
type IconPaths = { path: React.ReactNode; strokeLinejoin?: 'round' | 'miter' | 'bevel' }

const ICON_PATHS: Record<string, IconPaths> = {
  landmark: {
    path: (
      <>
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </>
    ),
  },
  laptop: {
    path: (
      <>
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
      </>
    ),
  },
  utensils: {
    path: (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </>
    ),
  },
  'shopping-bag': {
    path: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  smartphone: {
    path: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </>
    ),
  },
  ticket: {
    path: (
      <>
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </>
    ),
  },
  'heart-pulse': {
    path: (
      <>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
      </>
    ),
  },
  train: {
    path: (
      <>
        <rect x="4" y="3" width="16" height="16" rx="2" />
        <line x1="4" y1="11" x2="20" y2="11" />
        <path d="M8 19 6 22" />
        <path d="m18 22-2-3" />
        <circle cx="8" cy="15" r="1" />
        <circle cx="16" cy="15" r="1" />
      </>
    ),
  },
  wifi: {
    path: (
      <>
        <path d="M5 13a10 10 0 0 1 14 0" />
        <path d="M8.5 16.5a5 5 0 0 1 7 0" />
        <path d="M2 8.82a15 15 0 0 1 20 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>
    ),
  },
  'piggy-bank': {
    path: (
      <>
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2Z" />
        <path d="M2 9v1c0 1.1.9 2 2 2h1" />
        <path d="M16 11h0" />
      </>
    ),
  },
  home: {
    path: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  'shield-check': {
    path: (
      <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  zap: {
    path: (
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    ),
  },
  dumbbell: {
    path: (
      <>
        <path d="M14.4 14.4 9.6 9.6" />
        <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829Z" />
        <path d="m21.5 21.5-1.4-1.4" />
        <path d="M3.9 3.9 2.5 2.5" />
        <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829Z" />
      </>
    ),
  },
  'play-circle': {
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </>
    ),
  },
}

export function CategoryIcon({
  name,
  size = 20,
  strokeWidth = 2,
}: {
  name: string | null | undefined
  size?: number
  strokeWidth?: number
}) {
  const entry = name ? ICON_PATHS[name] : null
  if (!entry) {
    // Fallback -- generic gift/tag icon
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 12v10H4V12" />
        <path d="M22 7H2v5h20V7Z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
      </svg>
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {entry.path}
    </svg>
  )
}
