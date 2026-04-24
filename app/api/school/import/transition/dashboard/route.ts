import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

type Level = 'early' | 'first' | 'second' | 'third' | 'fourth'
const LEVEL_ORDER: Record<Level, number> = { early: 1, first: 2, second: 3, third: 4, fourth: 5 }

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  // Permission: guidance + leadership + admin already enforced by RLS.

  const url = new URL(req.url)
  const year = url.searchParams.get('transition_year')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (admin as any)
    .from('transition_profiles')
    .select('id, student_id, scn, student_name, source_primary, transition_year, reading_level, writing_level, listening_talking_level, numeracy_level, asn_notes, pastoral_notes, snsa_reading_score, snsa_numeracy_score')
    .eq('school_id', ctx.schoolId)
  if (year) q = q.eq('transition_year', year)
  const { data } = await q
  const rows = data ?? []

  const total = rows.length
  const primaries = new Map<string, { count: number; readingSum: number; readingCount: number; numeracySum: number; numeracyCount: number; asn: number }>()
  const readingDist: Record<string, number> = {}
  const writingDist: Record<string, number> = {}
  const listeningDist: Record<string, number> = {}
  const numeracyDist: Record<string, number> = {}
  let asnCount = 0
  let pastoralCount = 0
  const flagged: Array<{ id: string; student_id: string | null; name: string; primary: string; reasons: string[] }> = []

  for (const r of rows) {
    const p = primaries.get(r.source_primary) ?? { count: 0, readingSum: 0, readingCount: 0, numeracySum: 0, numeracyCount: 0, asn: 0 }
    p.count++
    if (r.reading_level) { p.readingSum += LEVEL_ORDER[r.reading_level as Level]; p.readingCount++ }
    if (r.numeracy_level) { p.numeracySum += LEVEL_ORDER[r.numeracy_level as Level]; p.numeracyCount++ }
    if (r.asn_notes) p.asn++
    primaries.set(r.source_primary, p)

    readingDist[r.reading_level ?? '-'] = (readingDist[r.reading_level ?? '-'] ?? 0) + 1
    writingDist[r.writing_level ?? '-'] = (writingDist[r.writing_level ?? '-'] ?? 0) + 1
    listeningDist[r.listening_talking_level ?? '-'] = (listeningDist[r.listening_talking_level ?? '-'] ?? 0) + 1
    numeracyDist[r.numeracy_level ?? '-'] = (numeracyDist[r.numeracy_level ?? '-'] ?? 0) + 1

    if (r.asn_notes) asnCount++
    if (r.pastoral_notes) pastoralCount++

    const reasons: string[] = []
    if (r.reading_level === 'early' || r.reading_level === 'first') reasons.push('Reading below expected')
    if (r.writing_level === 'early' || r.writing_level === 'first') reasons.push('Writing below expected')
    if (r.listening_talking_level === 'early' || r.listening_talking_level === 'first') reasons.push('Listening/talking below expected')
    if (r.numeracy_level === 'early' || r.numeracy_level === 'first') reasons.push('Numeracy below expected')
    if (r.asn_notes) reasons.push('ASN notes from primary')
    if (r.pastoral_notes) reasons.push('Pastoral concerns noted')
    if (reasons.length > 0) {
      flagged.push({ id: r.id, student_id: r.student_id, name: r.student_name, primary: r.source_primary, reasons })
    }
  }

  const byPrimary = Array.from(primaries.entries()).map(([name, s]) => ({
    primary: name,
    count: s.count,
    avgReadingLevel: s.readingCount ? Math.round((s.readingSum / s.readingCount) * 10) / 10 : null,
    avgNumeracyLevel: s.numeracyCount ? Math.round((s.numeracySum / s.numeracyCount) * 10) / 10 : null,
    asnCount: s.asn,
  })).sort((a, b) => (a.avgReadingLevel ?? 99) - (b.avgReadingLevel ?? 99))

  return NextResponse.json({
    total,
    primaries: Array.from(primaries.keys()).length,
    distributions: { reading: readingDist, writing: writingDist, listening: listeningDist, numeracy: numeracyDist },
    asnCount,
    pastoralCount,
    byPrimary,
    flagged,
  })
}
