/**
 * Map a career_roles.title to the training-phase slug keys declared in
 * `./training-phases.ts`. Returns null when the role has no pre-entry
 * training phase in the lookup (the calculator then yields 0 for ages
 * below typical_entry_age, which is the correct behaviour for roles whose
 * entry age is the school-leaving or HNC-entry age).
 *
 * Matching is intentionally narrow: exact titles first, then targeted
 * prefix/contains checks for role families (Solicitor variants, Secondary
 * teacher subjects). Any broadening here risks mislabelling an adjacent
 * role -- see Session 1 learnings on the Architect / Marine Architect
 * collision.
 */
export function trainingSlugForTitle(title: string): string | null {
  const t = title.trim()

  if (t === 'Doctor / GP') return 'doctor'
  if (t === 'Dentist') return 'dentist'
  if (t === 'Veterinary Surgeon') return 'vet'
  if (t === 'Pharmacist') return 'pharmacist'
  if (t === 'Advocate') return 'advocate'
  if (t === 'Clinical Psychologist') return 'clinical_psychologist'

  if (t === 'Primary Teacher') return 'teacher_primary'

  if (t.startsWith('Secondary Teacher')) {
    const lower = t.toLowerCase()
    if (lower.includes('english')) return 'teacher_secondary_english'
    if (lower.includes('maths') || lower.includes('mathematics')) {
      return 'teacher_secondary_maths'
    }
    if (lower.includes('science')) return 'teacher_secondary_science'
    if (lower.includes('languages') || lower.includes('modern')) {
      return 'teacher_secondary_modern_languages'
    }
    return null
  }

  // Solicitor family: Junior/Trainee Solicitor, Senior Solicitor, etc.
  // (Uses "solicitor" because the LLB+DPLP+traineeship pathway is common.)
  if (/\bsolicitor\b/i.test(t)) return 'solicitor'

  if (t === 'Electrician') return 'electrician_apprentice'
  if (t === 'Plumber') return 'plumber_apprentice'
  if (t === 'Joiner' || t === 'Carpenter' || t === 'Joiner / Carpenter') {
    return 'joiner_apprentice'
  }
  if (t === 'Mechanic' || t === 'Motor Vehicle Mechanic') {
    return 'mechanic_apprentice'
  }

  return null
}
