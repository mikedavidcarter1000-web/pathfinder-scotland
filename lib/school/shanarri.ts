// SHANARRI wellbeing indicator helpers.
// Eight GIRFEC indicators (Safe, Healthy, Achieving, Nurtured, Active,
// Respected, Responsible, Included). Scores are 1-5 integers stored on
// wellbeing_responses.

export type ShanarriKey =
  | 'safe' | 'healthy' | 'achieving' | 'nurtured'
  | 'active' | 'respected' | 'responsible' | 'included'

export const SHANARRI_INDICATORS: Array<{
  key: ShanarriKey
  label: string
  prompt: string
  column: string
}> = [
  { key: 'safe', label: 'Safe', prompt: 'I feel safe at school and in my community', column: 'safe_score' },
  { key: 'healthy', label: 'Healthy', prompt: 'I feel healthy and know how to look after my physical and mental health', column: 'healthy_score' },
  { key: 'achieving', label: 'Achieving', prompt: 'I feel supported to do well in my learning', column: 'achieving_score' },
  { key: 'nurtured', label: 'Nurtured', prompt: 'I feel cared for by the people around me', column: 'nurtured_score' },
  { key: 'active', label: 'Active', prompt: 'I have opportunities to be active and try new things', column: 'active_score' },
  { key: 'respected', label: 'Respected', prompt: 'I feel listened to and my opinions are valued', column: 'respected_score' },
  { key: 'responsible', label: 'Responsible', prompt: 'I have opportunities to take responsibility and make a difference', column: 'responsible_score' },
  { key: 'included', label: 'Included', prompt: 'I feel included and that I belong', column: 'included_score' },
]

export type ShanarriScores = Partial<Record<ShanarriKey, number | null>>

export type AggregateShanarri = {
  indicator: ShanarriKey
  label: string
  average: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export function responseToScores(row: Record<string, unknown>): ShanarriScores {
  const result: ShanarriScores = {}
  for (const indicator of SHANARRI_INDICATORS) {
    const v = row[indicator.column]
    result[indicator.key] = typeof v === 'number' ? v : null
  }
  return result
}

export function aggregateResponses(rows: Array<Record<string, unknown>>): AggregateShanarri[] {
  const out: AggregateShanarri[] = []
  for (const indicator of SHANARRI_INDICATORS) {
    const scores = rows
      .map((r) => r[indicator.column])
      .filter((v): v is number => typeof v === 'number')
    const sum = scores.reduce((a, b) => a + b, 0)
    const avg = scores.length === 0 ? 0 : sum / scores.length
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const s of scores) {
      if (s >= 1 && s <= 5) distribution[s as 1 | 2 | 3 | 4 | 5] += 1
    }
    out.push({ indicator: indicator.key, label: indicator.label, average: Math.round(avg * 10) / 10, distribution })
  }
  return out
}

// Radar data in a consistent order for SVG rendering. Returns coords for a
// regular octagon with radius proportional to the score (1..5 -> 20%..100%).
export function radarPoints(scores: ShanarriScores, centerX: number, centerY: number, radius: number): string {
  const points: string[] = []
  for (let i = 0; i < SHANARRI_INDICATORS.length; i++) {
    const indicator = SHANARRI_INDICATORS[i]
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / SHANARRI_INDICATORS.length
    const score = scores[indicator.key] ?? 0
    const r = (Math.max(0, Math.min(5, score)) / 5) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

export function radarAxisLabel(index: number, centerX: number, centerY: number, radius: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / SHANARRI_INDICATORS.length
  const r = radius + 16
  return {
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle),
  }
}

// Simple keyword list for safeguarding flagging of free-text in anonymous
// surveys. A free-text response mentioning any of these is surfaced to
// staff as "requires follow-up". We intentionally do not attempt to
// identify the student.
const SAFEGUARDING_KEYWORDS = [
  'hurt', 'hurts', 'hurting',
  'scared', 'afraid',
  'abuse', 'abused', 'abusive',
  'suicide', 'suicidal', 'kill myself', 'end it all',
  'self-harm', 'self harm', 'cut myself', 'cutting',
  'bullied', 'bully', 'bullying',
  'not safe', 'unsafe',
  'hit', 'hitting', 'beaten', 'beats me',
  'neglect', 'no food', 'hungry',
  'alcohol at home', 'drugs at home',
  'run away', 'running away',
  'hopeless', 'worthless', 'pointless',
]

export function flagFreeText(text: string | null | undefined): boolean {
  if (!text) return false
  const lc = text.toLowerCase()
  return SAFEGUARDING_KEYWORDS.some((kw) => lc.includes(kw))
}
