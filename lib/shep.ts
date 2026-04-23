// SHEP (Scottish Higher Education Programme) regional programmes.
// Each programme covers a set of Scottish local authorities and secondary schools.
// Participation in a SHEP programme is itself a widening access indicator and
// can trigger adjusted offers at any Scottish university.

export interface ShepProgramme {
  key: 'leaps' | 'focus-west' | 'aspire-north' | 'lift-off'
  name: string
  region: string
  description: string
  offers: string
  url: string
  councilAreas: string[]
  // Postcode area prefixes (the letter part) that roughly map to this region.
  // Used as a fallback when we only have a student's postcode, not their
  // verified council area from the SIMD lookup.
  postcodePrefixes: string[]
}

export const SHEP_PROGRAMMES: ShepProgramme[] = [
  {
    key: 'leaps',
    name: 'LEAPS',
    region: 'Lothians, Edinburgh & Scottish Borders',
    description:
      'Lothians Equal Access Programme for Schools. Partnership between all four Lothian councils and the Scottish Borders — mentoring, summer schools, and pre-entry support for S4 to S6.',
    offers:
      'Dedicated pre-entry programme. Participation can unlock adjusted offers at Edinburgh, Heriot-Watt, Napier, QMU, Stirling, and all Scottish universities.',
    url: 'https://www.leapsonline.org',
    councilAreas: [
      'City of Edinburgh',
      'East Lothian',
      'Midlothian',
      'West Lothian',
      'Scottish Borders',
    ],
    postcodePrefixes: ['EH', 'TD'],
  },
  {
    key: 'focus-west',
    name: 'FOCUS West',
    region: 'Glasgow & West of Scotland',
    description:
      'Partnership between Glasgow, Strathclyde, GCU, UWS, GSA, QMU, and RCS. Supports students from S4 onwards with university visits, mentoring, and Top-Up courses.',
    offers:
      'FOCUS West Top-Up gives a further one-grade reduction on top of Minimum Entry Requirements at Strathclyde, and similar recognition at other member universities.',
    url: 'https://www.focuswest.org.uk',
    councilAreas: [
      'Glasgow City',
      'Renfrewshire',
      'East Renfrewshire',
      'West Dunbartonshire',
      'East Dunbartonshire',
      'Inverclyde',
      'North Lanarkshire',
      'South Lanarkshire',
      'North Ayrshire',
      'East Ayrshire',
      'South Ayrshire',
      'Argyll and Bute',
    ],
    postcodePrefixes: ['G', 'PA', 'ML', 'KA'],
  },
  {
    key: 'aspire-north',
    name: 'Aspire North',
    region: 'Aberdeen, North-East & Highlands',
    description:
      'Partnership between the University of Aberdeen, Robert Gordon University, and UHI. Covers schools across Aberdeen, Aberdeenshire, Moray, and the Highlands.',
    offers:
      'Participation in Aspire North activities counts towards contextual admissions at Aberdeen, RGU, and UHI. Reach programme covers Medicine and Law at Aberdeen.',
    url: 'https://www.aspirenorth.co.uk',
    councilAreas: [
      'Aberdeen City',
      'Aberdeenshire',
      'Moray',
      'Highland',
      'Orkney Islands',
      'Shetland Islands',
      'Na h-Eileanan Siar',
    ],
    postcodePrefixes: ['AB', 'IV', 'KW', 'HS', 'ZE'],
  },
  {
    key: 'lift-off',
    name: 'LIFT OFF',
    region: 'Tayside & Fife',
    description:
      "University of Dundee's widening access partnership — summer schools, subject tasters, and mentoring across Tayside, Angus, Perth & Kinross, and Fife.",
    offers:
      'LIFT OFF participation counts towards contextual admissions at Dundee, Abertay, St Andrews, and Stirling.',
    url: 'https://www.dundee.ac.uk/widening-access',
    councilAreas: [
      'Dundee City',
      'Angus',
      'Perth and Kinross',
      'Fife',
      'Clackmannanshire',
      'Stirling',
      'Falkirk',
    ],
    postcodePrefixes: ['DD', 'PH', 'KY', 'FK'],
  },
]

// Normalise a postcode, then return the two-letter (or one-letter for G) area prefix.
function extractPostcodeArea(postcode: string | null): string | null {
  if (!postcode) return null
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase()
  const match = cleaned.match(/^([A-Z]{1,2})\d/)
  return match ? match[1] : null
}

// Look up the SHEP programme that covers a given council area. Exact match only.
export function findShepByCouncilArea(councilArea: string | null): ShepProgramme | null {
  if (!councilArea) return null
  const needle = councilArea.trim().toLowerCase()
  return (
    SHEP_PROGRAMMES.find((p) =>
      p.councilAreas.some((c) => c.toLowerCase() === needle)
    ) ?? null
  )
}

// Fall back to matching the postcode area prefix. Used when we only have the
// student's raw postcode, not the verified council area from the SIMD lookup.
export function findShepByPostcode(postcode: string | null): ShepProgramme | null {
  const area = extractPostcodeArea(postcode)
  if (!area) return null
  return (
    SHEP_PROGRAMMES.find((p) => p.postcodePrefixes.includes(area)) ?? null
  )
}

// Return the display name of a SHEP programme by key, if present in a
// university's shep_programmes array. Normalises common variants.
export function matchShepProgrammeLabel(label: string): ShepProgramme | null {
  const needle = label.trim().toLowerCase()
  return (
    SHEP_PROGRAMMES.find(
      (p) =>
        p.name.toLowerCase() === needle ||
        p.key === needle.replace(/\s+/g, '-')
    ) ?? null
  )
}
