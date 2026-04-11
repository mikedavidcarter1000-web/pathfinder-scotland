// Per-role AI impact rating scale (1-10)
//
// Used by the granular career_roles system seeded from the research
// document "AI and the Future of Careers: A Guide for Scottish School
// Leavers" (April 2026). The scale sits alongside the coarser 3-tier
// sector-level AI_IMPACT_META in lib/constants.ts: the sector tier is
// the one-line read, this 1-10 scale is the per-role detail.

export type AiRatingBand = 'low' | 'medium' | 'high' | 'near-complete'

export interface AiRatingBandMeta {
  band: AiRatingBand
  label: string
  summary: string
  range: [number, number]
  colour: 'green' | 'amber' | 'red-amber' | 'red'
  bg: string
  text: string
  dot: string
}

export const AI_RATING_BANDS: Record<AiRatingBand, AiRatingBandMeta> = {
  'low': {
    band: 'low',
    label: 'Low impact',
    summary:
      'AI assists but the role remains fundamentally unchanged. Strong job security.',
    range: [1, 3],
    colour: 'green',
    bg: 'rgba(16, 185, 129, 0.12)',
    text: 'var(--pf-green-500)',
    dot: 'var(--pf-green-500)',
  },
  'medium': {
    band: 'medium',
    label: 'Medium impact',
    summary:
      'Significant changes to how work is done. Some tasks automated, new skills needed. Adapt and thrive.',
    range: [4, 6],
    colour: 'amber',
    bg: 'rgba(245, 158, 11, 0.14)',
    text: 'var(--pf-amber-500)',
    dot: 'var(--pf-amber-500)',
  },
  'high': {
    band: 'high',
    label: 'High impact',
    summary:
      'Substantial transformation expected. The role will look very different. Build complementary skills.',
    range: [7, 9],
    colour: 'red-amber',
    bg: 'rgba(249, 115, 22, 0.14)',
    text: 'var(--pf-orange-500, #ea580c)',
    dot: 'var(--pf-orange-500, #ea580c)',
  },
  'near-complete': {
    band: 'near-complete',
    label: 'Near-complete automation',
    summary:
      'Role likely to be largely automated within 10-15 years. Consider adjacent careers.',
    range: [10, 10],
    colour: 'red',
    bg: 'rgba(239, 68, 68, 0.12)',
    text: 'var(--pf-red-500)',
    dot: 'var(--pf-red-500)',
  },
}

export function getAiRatingBand(rating: number): AiRatingBandMeta {
  if (rating <= 3) return AI_RATING_BANDS.low
  if (rating <= 6) return AI_RATING_BANDS.medium
  if (rating <= 9) return AI_RATING_BANDS.high
  return AI_RATING_BANDS['near-complete']
}

export function isValidAiRating(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 10
}

export const AI_RATING_SOURCE =
  'Research document "AI and the Future of Careers: A Guide for Scottish School Leavers" (April 2026), drawing on WEF Future of Jobs Report 2025, McKinsey Global Institute, Oxford Martin School, OECD, Anthropic Economic Index, OpenAI/UPenn, MIT/Stanford, ONS, Skills Development Scotland and Scotland\'s AI Strategy 2026-2031.'
