// Mustache-style placeholder substitution for comment templates and parent
// report templates. Supports {{key}} for scalar substitution and
// {{#section}}...{{/section}} for array iteration.
// Also handles {{^section}}...{{/section}} for "absent or empty" branches.
// Keep this module dependency-free — it runs on both the server (report
// generation) and the client (grid comment picker).

export type TemplateContext = Record<string, unknown>

const SCALAR_RE = /\{\{([a-z_][a-z0-9_]*)\}\}/gi
const SECTION_RE = /\{\{(#|\^)([a-z_][a-z0-9_]*)\}\}([\s\S]*?)\{\{\/\2\}\}/gi

function renderScalar(body: string, ctx: TemplateContext): string {
  return body.replace(SCALAR_RE, (_m, key: string) => {
    const v = ctx[key]
    if (v === null || v === undefined) return ''
    return String(v)
  })
}

function isTruthyValue(v: unknown): boolean {
  if (v === null || v === undefined) return false
  if (typeof v === 'string') return v.length > 0
  if (typeof v === 'number') return true
  if (typeof v === 'boolean') return v
  if (Array.isArray(v)) return v.length > 0
  return true
}

export function renderTemplate(template: string, ctx: TemplateContext): string {
  // Process sections first (recursively via the replace callback, since
  // sections can be nested).
  const withSections = template.replace(SECTION_RE, (_m, marker: string, key: string, inner: string) => {
    const val = ctx[key]
    const truthy = isTruthyValue(val)
    if (marker === '#') {
      if (!truthy) return ''
      if (Array.isArray(val)) {
        return val.map((item) => renderTemplate(inner, typeof item === 'object' && item !== null ? { ...ctx, ...(item as TemplateContext) } : ctx)).join('')
      }
      return renderTemplate(inner, ctx)
    }
    // Inverted (^): render only when falsy
    if (marker === '^') return truthy ? '' : renderTemplate(inner, ctx)
    return ''
  })
  return renderScalar(withSections, ctx)
}

// Neutral default pronouns used when students table does not store pronouns.
// Swappable at the callsite if the student has a recorded preference later.
export const DEFAULT_PRONOUNS = {
  pronoun_subject: 'they',
  pronoun_object: 'them',
  pronoun_possessive: 'their',
}

// Compose a student-oriented context for comment/report rendering.
export function composeStudentContext(
  student: { first_name?: string | null; last_name?: string | null },
  subjectName: string,
  extra: TemplateContext = {}
): TemplateContext {
  const firstName = student.first_name ?? ''
  return {
    ...DEFAULT_PRONOUNS,
    name: firstName || student.last_name || 'The student',
    first_name: firstName,
    last_name: student.last_name ?? '',
    subject: subjectName,
    ...extra,
  }
}
