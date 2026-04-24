// Auto-generate HGIOS4 evidence statements from platform data.
//
// Each generator takes a service-role admin client + schoolId and returns
// an array of inspection_evidence-ready rows that can be POSTed to the
// evidence table or rendered inline in the portfolio view. Statements
// are factual aggregates only -- never include individual names.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAttainmentMeasures, getSimdGap, getCesCapacities, getValueAdded } from './analytics'

export type GeneratedEvidence = {
  indicator_code: string
  evidence_type: 'quantitative' | 'qualitative' | 'observation' | 'stakeholder_voice' | 'document'
  title: string
  description: string
  source: string
  data_snapshot: unknown
}

// QI 1.5: Management of resources to promote equity
async function q15(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const out: GeneratedEvidence[] = []
  const { data: pef } = await (admin as any).from('pef_allocations').select('id, academic_year, total_allocation').eq('school_id', schoolId).order('academic_year', { ascending: false }).limit(1).maybeSingle()
  if (pef) {
    const { data: spend } = await (admin as any).from('pef_spend').select('amount, target_student_count').eq('allocation_id', pef.id)
    const totalSpent = (spend ?? []).reduce((a: number, s: any) => a + Number(s.amount), 0)
    const targeted = (spend ?? []).reduce((a: number, s: any) => a + (s.target_student_count ?? 0), 0)
    out.push({
      indicator_code: '1.5',
      evidence_type: 'quantitative',
      title: `PEF allocation ${pef.academic_year}`,
      description: `£${Number(pef.total_allocation).toLocaleString()} PEF funding allocated in ${pef.academic_year}. £${totalSpent.toLocaleString()} committed across ${(spend ?? []).length} targeted interventions reaching approximately ${targeted} students.`,
      source: 'auto_generated: pef_allocations + pef_spend',
      data_snapshot: { allocation: pef, spend_count: (spend ?? []).length, spent: totalSpent, targeted },
    })
  }

  const simd = await getSimdGap(admin, schoolId)
  const q1 = simd.find((r) => r.simd_quintile === 1)
  const q5 = simd.find((r) => r.simd_quintile === 5)
  if (q1 && q5 && (q1.student_count > 0 || q5.student_count > 0)) {
    const gap = Math.round((q5.n5_5plus_ac_pct - q1.n5_5plus_ac_pct) * 10) / 10
    out.push({
      indicator_code: '1.5',
      evidence_type: 'quantitative',
      title: 'SIMD attainment gap (5+ N5 A-C)',
      description: `Attainment gap (5+ National 5 at A-C) between SIMD Q1 (most deprived) and Q5 (least deprived): ${gap} percentage points. Q1: ${q1.n5_5plus_ac_pct}% (n=${q1.student_count}); Q5: ${q5.n5_5plus_ac_pct}% (n=${q5.student_count}).`,
      source: 'auto_generated: tracking_entries + students.simd_decile',
      data_snapshot: { q1, q5, gap },
    })
  }
  return out
}

// QI 2.1: Safeguarding and child protection
async function q21(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const { data: concerns } = await (admin as any).from('safeguarding_concerns').select('id, escalation_level, resolved_at').eq('school_id', schoolId)
  const rows = concerns ?? []
  const escalated = rows.filter((r: any) => r.escalation_level && r.escalation_level !== 'concern').length
  const resolved = rows.filter((r: any) => r.resolved_at != null).length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: accessCount } = await (admin as any).from('safeguarding_access_log').select('id', { count: 'exact', head: true })
  return [{
    indicator_code: '2.1',
    evidence_type: 'quantitative',
    title: 'Safeguarding activity (aggregate)',
    description: `${rows.length} safeguarding concerns logged. ${escalated} escalated. ${resolved} resolved. All concern access is audited (${accessCount ?? 0} log entries).`,
    source: 'auto_generated: safeguarding_concerns + safeguarding_access_log',
    data_snapshot: { total: rows.length, escalated, resolved, access_events: accessCount ?? 0 },
  }]
}

// QI 2.2: Curriculum
async function q22(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const out: GeneratedEvidence[] = []
  const { data: rounds } = await (admin as any).from('choice_rounds').select('id').eq('school_id', schoolId)
  const { count: columnsCount } = await (admin as any).from('choice_round_columns').select('id', { count: 'exact', head: true }).in('round_id', ((rounds ?? []).map((r: any) => r.id)))
  const { count: submissionsCount } = await (admin as any).from('student_choices').select('id', { count: 'exact', head: true }).in('round_id', ((rounds ?? []).map((r: any) => r.id)))

  out.push({
    indicator_code: '2.2',
    evidence_type: 'quantitative',
    title: 'Subject-choice curriculum structure',
    description: `${rounds?.length ?? 0} subject-choice rounds configured. ${columnsCount ?? 0} choice columns across all rounds. ${submissionsCount ?? 0} student submissions recorded.`,
    source: 'auto_generated: choice_rounds + choice_round_columns + student_choices',
    data_snapshot: { rounds: rounds?.length ?? 0, columns: columnsCount ?? 0, submissions: submissionsCount ?? 0 },
  })

  // Curriculum rationale published.
  const { data: rationale } = await (admin as any).from('curriculum_rationale').select('academic_year, published_at').eq('school_id', schoolId).order('academic_year', { ascending: false }).limit(1).maybeSingle()
  if (rationale) {
    out.push({
      indicator_code: '2.2',
      evidence_type: 'document',
      title: 'Curriculum rationale',
      description: `Curriculum rationale drafted for ${rationale.academic_year}. Published: ${rationale.published_at ? 'yes' : 'draft only'}.`,
      source: 'auto_generated: curriculum_rationale',
      data_snapshot: rationale,
    })
  }
  return out
}

// QI 2.3: Learning, teaching and assessment
async function q23(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const { data: cycles } = await (admin as any).from('tracking_cycles').select('id, is_locked').eq('school_id', schoolId)
  const locked = (cycles ?? []).filter((c: any) => c.is_locked).length
  const measures = await getAttainmentMeasures(admin, schoolId)
  const completion = measures.total_students > 0 ? Math.round((measures.students_with_grades / measures.total_students) * 1000) / 10 : 0
  return [{
    indicator_code: '2.3',
    evidence_type: 'quantitative',
    title: 'Tracking cycles and completion',
    description: `${cycles?.length ?? 0} tracking cycles configured (${locked} locked). Current/latest cycle completion: ${completion}% of registered students (${measures.students_with_grades} of ${measures.total_students}).`,
    source: 'auto_generated: tracking_cycles + tracking_entries',
    data_snapshot: { cycles: cycles?.length ?? 0, locked, measures },
  }]
}

// QI 2.4: Personalised support
async function q24(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const out: GeneratedEvidence[] = []
  const { data: interventions } = await (admin as any).from('interventions').select('id, student_id, pef_funded').eq('school_id', schoolId)
  const rows = interventions ?? []
  const pefInt = rows.filter((r: any) => r.pef_funded).length
  const uniqueStudents = new Set<string>(rows.map((r: any) => r.student_id)).size

  out.push({
    indicator_code: '2.4',
    evidence_type: 'quantitative',
    title: 'Guidance interventions',
    description: `${rows.length} interventions logged across ${uniqueStudents} students. ${pefInt} PEF-funded interventions.`,
    source: 'auto_generated: interventions',
    data_snapshot: { total: rows.length, unique_students: uniqueStudents, pef_funded: pefInt },
  })

  const { data: asn } = await (admin as any).from('asn_provisions').select('id, provision_type, student_id').eq('school_id', schoolId).eq('is_active', true)
  const asnRows = asn ?? []
  const typeSet = new Set<string>(asnRows.map((r: any) => r.provision_type))
  const asnStudents = new Set<string>(asnRows.map((r: any) => r.student_id)).size
  out.push({
    indicator_code: '2.4',
    evidence_type: 'quantitative',
    title: 'ASN provisions',
    description: `${asnStudents} students with active ASN provisions. ${typeSet.size} provision types in use.`,
    source: 'auto_generated: asn_provisions',
    data_snapshot: { active_provisions: asnRows.length, unique_students: asnStudents, types_in_use: typeSet.size },
  })
  return out
}

// QI 3.1: Ensuring wellbeing, equality and inclusion
async function q31(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const out: GeneratedEvidence[] = []
  const { data: responses } = await (admin as any)
    .from('wellbeing_responses')
    .select('survey_id, safe_score, healthy_score, achieving_score, nurtured_score, active_score, respected_score, responsible_score, included_score, wellbeing_surveys!inner(school_id)')
    .filter('wellbeing_surveys.school_id', 'eq', schoolId)
  const rows = responses ?? []
  if (rows.length > 0) {
    const avg = (key: string) => Math.round((rows.reduce((a: number, r: any) => a + (r[key] ?? 0), 0) / rows.length) * 100) / 100
    out.push({
      indicator_code: '3.1',
      evidence_type: 'quantitative',
      title: 'SHANARRI wellbeing survey results',
      description: `${rows.length} wellbeing survey responses. Average scores (1-5): Safe ${avg('safe_score')}, Healthy ${avg('healthy_score')}, Achieving ${avg('achieving_score')}, Nurtured ${avg('nurtured_score')}, Active ${avg('active_score')}, Respected ${avg('respected_score')}, Responsible ${avg('responsible_score')}, Included ${avg('included_score')}.`,
      source: 'auto_generated: wellbeing_responses',
      data_snapshot: {
        responses: rows.length,
        averages: { safe: avg('safe_score'), healthy: avg('healthy_score'), achieving: avg('achieving_score'), nurtured: avg('nurtured_score'), active: avg('active_score'), respected: avg('respected_score'), responsible: avg('responsible_score'), included: avg('included_score') },
      },
    })
  }

  const simd = await getSimdGap(admin, schoolId)
  out.push({
    indicator_code: '3.1',
    evidence_type: 'quantitative',
    title: 'SIMD equity snapshot',
    description: `SIMD gap analysis conducted. Students by quintile: ${simd.map((r) => `Q${r.simd_quintile}: ${r.student_count}`).join(', ')}.`,
    source: 'auto_generated: students.simd_decile',
    data_snapshot: simd,
  })
  return out
}

// QI 3.2: Raising attainment and achievement
async function q32(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const measures = await getAttainmentMeasures(admin, schoolId)
  const valueAdded = await getValueAdded(admin, schoolId)
  const vaSummary = valueAdded.length > 0
    ? `Value-added analysis across ${valueAdded.length} subjects. Mean value-added: ${(valueAdded.reduce((a, b) => a + b.value_added, 0) / valueAdded.length).toFixed(2)}.`
    : 'Value-added analysis pending SQA results import.'
  return [{
    indicator_code: '3.2',
    evidence_type: 'quantitative',
    title: 'Key attainment measures',
    description: `5+ N5 A-C: ${measures.n5_5plus_ac_pct}%. 3+ Higher A-C: ${measures.higher_3plus_ac_pct}%. 1+ Advanced Higher: ${measures.ah_1plus_pct}%. ${vaSummary}`,
    source: 'auto_generated: tracking_entries + class_assignments + grade_scales',
    data_snapshot: { measures, value_added: valueAdded },
  }]
}

// QI 3.3: Increasing creativity and employability
async function q33(admin: SupabaseClient, schoolId: string): Promise<GeneratedEvidence[]> {
  const ces = await getCesCapacities(admin, schoolId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any).from('school_student_links').select('student_id').eq('school_id', schoolId)
  const ids = (links ?? []).map((l: any) => l.student_id)
  let quizzedPct = 0; let savedPct = 0
  if (ids.length > 0) {
    const { data: quizzes } = await (admin as any).from('quiz_results').select('student_id').in('student_id', ids)
    const { data: saved } = await (admin as any).from('saved_courses').select('student_id').in('student_id', ids)
    quizzedPct = Math.round((new Set<string>((quizzes ?? []).map((q: any) => q.student_id)).size / ids.length) * 1000) / 10
    savedPct = Math.round((new Set<string>((saved ?? []).map((s: any) => s.student_id)).size / ids.length) * 1000) / 10
  }
  return [{
    indicator_code: '3.3',
    evidence_type: 'quantitative',
    title: 'CES capacity scores and DYW engagement',
    description: `CES capacity scores: Self ${ces.self.score}/100, Strengths ${ces.strengths.score}/100, Horizons ${ces.horizons.score}/100, Networks ${ces.networks.score}/100. ${quizzedPct}% of students completed the career quiz. ${savedPct}% saved at least 1 university course.`,
    source: 'auto_generated: quiz_results + saved_courses + wellbeing_responses + student_grades',
    data_snapshot: { ces, quizzedPct, savedPct, total: ids.length },
  }]
}

export async function autoGenerateEvidenceFor(admin: SupabaseClient, schoolId: string, indicatorCode: string): Promise<GeneratedEvidence[]> {
  switch (indicatorCode) {
    case '1.5': return q15(admin, schoolId)
    case '2.1': return q21(admin, schoolId)
    case '2.2': return q22(admin, schoolId)
    case '2.3': return q23(admin, schoolId)
    case '2.4': return q24(admin, schoolId)
    case '3.1': return q31(admin, schoolId)
    case '3.2': return q32(admin, schoolId)
    case '3.3': return q33(admin, schoolId)
    default: return []
  }
}

export const AUTO_GEN_SUPPORTED = new Set(['1.5', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3'])
