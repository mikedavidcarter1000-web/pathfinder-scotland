import { renderTemplate } from '@/lib/school/comment-template'

export type ReportRowData = {
  subject_name: string
  working_grade: string | null
  grade_colour: string
  on_track: string | null
  on_track_colour: string
  effort: string | null
  effort_colour: string
  comment: string
  custom_values?: string[]
}

export type ReportData = {
  school_name: string
  school_logo?: string
  header_colour: string
  cycle_name: string
  student_name: string
  year_group: string
  registration_class: string
  subjects: ReportRowData[]
  custom_metrics_present?: boolean
  custom_metric_names?: string[]
  generated_date: string
}

// Maps a grade letter to the same colour scheme used in the grid.
export function gradeColour(grade: string | null): string {
  if (!grade) return '#ffffff'
  const g = grade.toUpperCase()
  if (g === 'A') return '#dcfce7'
  if (g === 'B') return '#dbeafe'
  if (g === 'C') return '#fef3c7'
  if (g === 'D') return '#fed7aa'
  if (g.includes('NO')) return '#fee2e2'
  return '#ffffff'
}

export function onTrackColour(v: string | null): string {
  if (!v) return '#ffffff'
  if (v === 'above') return '#dcfce7'
  if (v === 'on_track') return '#dbeafe'
  if (v === 'below') return '#fef3c7'
  if (v === 'significantly_below') return '#fee2e2'
  return '#ffffff'
}

export function effortColour(v: string | null): string {
  if (!v) return '#ffffff'
  if (v === 'excellent') return '#dcfce7'
  if (v === 'good') return '#dbeafe'
  if (v === 'satisfactory') return '#fef3c7'
  if (v === 'concern') return '#fee2e2'
  return '#ffffff'
}

export function renderReportHtml(template: string, data: ReportData): string {
  // Our template uses {{#subjects}}...{{/subjects}} for iteration, which the
  // comment-template renderer already supports.
  return renderTemplate(template, data as unknown as Record<string, unknown>)
}
