import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Default tracking metrics seeded on school creation. Schools can then edit /
// add / deactivate from /school/settings. Exactly 3 defaults per Schools-2
// spec: Effort (repeated here as a custom metric so it can be coloured /
// renamed alongside the others), Homework, and On Track. The tracking_entries
// table already has first-class `effort` and `on_track` columns for the core
// two metrics; the custom-metric rows below are what render extra columns in
// the grid.
export const DEFAULT_TRACKING_METRICS = [
  {
    metric_name: 'Effort',
    metric_key: 'effort_custom',
    scale_type: 'rating' as const,
    scale_options: ['Excellent', 'Good', 'Satisfactory', 'Concern'],
    colour_coding: {
      Excellent: '#22c55e',
      Good: '#3b82f6',
      Satisfactory: '#f59e0b',
      Concern: '#ef4444',
    },
    sort_order: 1,
  },
  {
    metric_name: 'Homework',
    metric_key: 'homework',
    scale_type: 'rating' as const,
    scale_options: ['Excellent', 'Good', 'Satisfactory', 'Concern'],
    colour_coding: {
      Excellent: '#22c55e',
      Good: '#3b82f6',
      Satisfactory: '#f59e0b',
      Concern: '#ef4444',
    },
    sort_order: 2,
  },
  {
    metric_name: 'On Track',
    metric_key: 'on_track_custom',
    scale_type: 'rating' as const,
    scale_options: ['Above', 'On Track', 'Below', 'Significantly Below'],
    colour_coding: {
      Above: '#22c55e',
      'On Track': '#3b82f6',
      Below: '#f59e0b',
      'Significantly Below': '#ef4444',
    },
    sort_order: 3,
  },
]

// Default comment bank entries, seeded on school creation. Templates use
// Mustache-style placeholders: {{name}}, {{subject}}, {{pronoun_subject}},
// {{pronoun_object}}, {{pronoun_possessive}}. Without pronouns stored on
// students, the substitute uses gender-neutral "they/them/their".
export const DEFAULT_COMMENT_BANK: {
  category: 'positive' | 'improvement' | 'concern' | 'general'
  comment_template: string
}[] = [
  {
    category: 'positive',
    comment_template:
      '{{name}} has made excellent progress in {{subject}} this term and should be very proud of {{pronoun_possessive}} achievement.',
  },
  {
    category: 'positive',
    comment_template:
      '{{name}} consistently demonstrates a strong work ethic and positive attitude towards {{subject}}.',
  },
  {
    category: 'positive',
    comment_template:
      '{{name}} has shown real improvement in {{subject}} and is on track to achieve a strong grade.',
  },
  {
    category: 'improvement',
    comment_template:
      '{{name}} would benefit from more consistent effort in {{subject}}, particularly in completing homework and revision.',
  },
  {
    category: 'improvement',
    comment_template:
      '{{name}} has the ability to achieve a higher grade in {{subject}} with more focused independent study.',
  },
  {
    category: 'improvement',
    comment_template:
      'To improve in {{subject}}, {{name}} should attend supported study sessions and make better use of class time.',
  },
  {
    category: 'concern',
    comment_template:
      '{{name}} is currently working below expected level in {{subject}}. A conversation with {{pronoun_possessive}} guidance teacher is recommended.',
  },
  {
    category: 'concern',
    comment_template:
      "{{name}}'s attendance in {{subject}} is a concern and is impacting {{pronoun_possessive}} progress. Parental contact may be required.",
  },
  {
    category: 'general',
    comment_template: '{{name}} is a valued member of the {{subject}} class.',
  },
  {
    category: 'general',
    comment_template: '{{name}} should continue to build on the progress made this term.',
  },
]

// Default report templates. HTML is Mustache-ish; the generator replaces
// {{key}} and {{#array}}...{{/array}} block iterators at render time. The
// templates use inline styles so email clients (with ham-fisted CSS
// strippers) still render the layout correctly when the HTML is piped
// into an email body.
//
// Three flavours are seeded: Standard (grade colour backgrounds, full
// comment column); Compact (tighter rows, no background fills, designed
// for double-sided printing); Detailed (adds custom-metric columns,
// attendance, guidance contact).
export const DEFAULT_REPORT_TEMPLATE_HTML = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
  <div style="background: {{header_colour}}; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="margin: 0;">{{school_name}}</h1>
      <p style="margin: 4px 0 0;">{{cycle_name}} Report</p>
    </div>
    {{#school_logo}}<img src="{{school_logo}}" alt="" style="height: 60px;">{{/school_logo}}
  </div>
  <div style="padding: 20px;">
    <h2>{{student_name}} &mdash; {{year_group}} {{registration_class}}</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Subject</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Grade</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">On Track</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Effort</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Comment</th>
        </tr>
      </thead>
      <tbody>
        {{#subjects}}
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">{{subject_name}}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; background: {{grade_colour}};">{{working_grade}}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; background: {{on_track_colour}};">{{on_track}}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; background: {{effort_colour}};">{{effort}}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">{{comment}}</td>
        </tr>
        {{/subjects}}
      </tbody>
    </table>
    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
      Report generated on {{generated_date}}. If you have questions, please contact your child's guidance teacher.
    </p>
  </div>
</div>`

export const COMPACT_REPORT_TEMPLATE_HTML = `<div style="font-family: Arial, sans-serif; max-width: 780px; margin: 0 auto; font-size: 11.5px;">
  <div style="background: {{header_colour}}; color: white; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="margin: 0; font-size: 16px;">{{school_name}}</h1>
      <div style="font-size: 11px; opacity: 0.9;">{{cycle_name}} &middot; {{generated_date}}</div>
    </div>
    {{#school_logo}}<img src="{{school_logo}}" alt="" style="height: 36px;">{{/school_logo}}
  </div>
  <div style="padding: 12px 14px;">
    <div style="font-weight: 600; margin-bottom: 6px;">{{student_name}} &middot; {{year_group}} {{registration_class}}</div>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 4px 6px; text-align: left; border: 1px solid #d1d5db; font-size: 11px;">Subject</th>
          <th style="padding: 4px 6px; text-align: center; border: 1px solid #d1d5db; font-size: 11px;">Grd</th>
          <th style="padding: 4px 6px; text-align: center; border: 1px solid #d1d5db; font-size: 11px;">On Trk</th>
          <th style="padding: 4px 6px; text-align: center; border: 1px solid #d1d5db; font-size: 11px;">Effort</th>
          <th style="padding: 4px 6px; text-align: left; border: 1px solid #d1d5db; font-size: 11px;">Comment</th>
        </tr>
      </thead>
      <tbody>
        {{#subjects}}
        <tr>
          <td style="padding: 3px 6px; border: 1px solid #d1d5db;">{{subject_name}}</td>
          <td style="padding: 3px 6px; text-align: center; border: 1px solid #d1d5db;">{{working_grade}}</td>
          <td style="padding: 3px 6px; text-align: center; border: 1px solid #d1d5db;">{{on_track}}</td>
          <td style="padding: 3px 6px; text-align: center; border: 1px solid #d1d5db;">{{effort}}</td>
          <td style="padding: 3px 6px; border: 1px solid #d1d5db; font-size: 10.5px;">{{comment}}</td>
        </tr>
        {{/subjects}}
      </tbody>
    </table>
    <p style="margin: 10px 0 0; font-size: 10px; color: #6b7280;">Report generated on {{generated_date}}.</p>
  </div>
</div>`

export const DETAILED_REPORT_TEMPLATE_HTML = `<div style="font-family: Arial, sans-serif; max-width: 820px; margin: 0 auto;">
  <div style="background: {{header_colour}}; color: white; padding: 22px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="margin: 0;">{{school_name}}</h1>
      <p style="margin: 4px 0 0;">{{cycle_name}} &middot; Detailed Report</p>
    </div>
    {{#school_logo}}<img src="{{school_logo}}" alt="" style="height: 60px;">{{/school_logo}}
  </div>
  <div style="padding: 20px;">
    <h2 style="margin: 0 0 4px;">{{student_name}}</h2>
    <p style="margin: 0 0 12px; color: #6b7280;">Year {{year_group}} &middot; Class {{registration_class}} &middot; Attendance {{attendance_pct}}% &middot; UCAS tariff {{ucas_tariff}}</p>
    {{#guidance_teacher_name}}<p style="margin: 0 0 14px; color: #374151;">Guidance: <strong>{{guidance_teacher_name}}</strong></p>{{/guidance_teacher_name}}
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Subject</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Grade</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">On Track</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Effort</th>
          {{#custom_metrics_present}}{{#custom_metric_names}}<th style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">{{.}}</th>{{/custom_metric_names}}{{/custom_metrics_present}}
          <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Comment</th>
        </tr>
      </thead>
      <tbody>
        {{#subjects}}
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">{{subject_name}}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; background: {{grade_colour}};">{{working_grade}}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; background: {{on_track_colour}};">{{on_track}}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; background: {{effort_colour}};">{{effort}}</td>
          {{#custom_values}}<td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">{{.}}</td>{{/custom_values}}
          <td style="padding: 8px; border: 1px solid #e5e7eb;">{{comment}}</td>
        </tr>
        {{/subjects}}
      </tbody>
    </table>
    <p style="margin-top: 22px; font-size: 12px; color: #6b7280;">
      Report generated on {{generated_date}}. If you have questions, please contact {{guidance_teacher_name}} or your child&apos;s class teacher directly.
    </p>
  </div>
</div>`

export const DEFAULT_REPORT_TEMPLATES: Array<{
  name: string
  template_html: string
  is_default: boolean
}> = [
  { name: 'Standard Report', template_html: DEFAULT_REPORT_TEMPLATE_HTML, is_default: true },
  { name: 'Compact Report', template_html: COMPACT_REPORT_TEMPLATE_HTML, is_default: false },
  { name: 'Detailed Report', template_html: DETAILED_REPORT_TEMPLATE_HTML, is_default: false },
]

// Seed the three defaults (metrics, comment bank, report template) for a
// newly-created school. Idempotent: repeated calls are safe because the
// UNIQUE(school_id, metric_key) on tracking metrics prevents duplicates,
// and the comment bank / template inserts are guarded by a pre-check.
export async function seedTrackingDefaults(
  admin: SupabaseClient<Database>,
  schoolId: string,
  createdBy?: string
) {
  const metricsRows = DEFAULT_TRACKING_METRICS.map((m) => ({
    school_id: schoolId,
    metric_name: m.metric_name,
    metric_key: m.metric_key,
    scale_type: m.scale_type,
    scale_options: m.scale_options,
    colour_coding: m.colour_coding,
    applies_to_departments: null,
    sort_order: m.sort_order,
    is_active: true,
  }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('school_tracking_metrics')
    .upsert(metricsRows, { onConflict: 'school_id,metric_key' })

  // Check if comment banks already exist for this school before seeding.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: existingComments } = await (admin as any)
    .from('comment_banks')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  if ((existingComments ?? 0) === 0) {
    const commentRows = DEFAULT_COMMENT_BANK.map((c) => ({
      school_id: schoolId,
      department: null,
      category: c.category,
      comment_template: c.comment_template,
      created_by: createdBy ?? null,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('comment_banks').insert(commentRows)
  }

  // Default report templates. Insert the three canonical templates if
  // none currently exist for the school, OR add any individual template
  // (by name) that's missing (backfill for schools created before Schools-6a
  // when only the Standard template was seeded).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingTemplates } = await (admin as any)
    .from('report_templates')
    .select('name, is_default')
    .eq('school_id', schoolId)

  const existing = (existingTemplates ?? []) as Array<{ name: string; is_default: boolean }>
  const existingNames = new Set(existing.map((t) => t.name))
  const hasAnyDefault = existing.some((t) => t.is_default)

  const rowsToInsert = DEFAULT_REPORT_TEMPLATES.filter((t) => !existingNames.has(t.name)).map((t) => ({
    school_id: schoolId,
    name: t.name,
    template_html: t.template_html,
    header_colour: '#1B3A5C',
    // Only mark the Standard template as default if no other default exists
    // yet -- otherwise keep the school's existing choice.
    is_default: t.is_default && !hasAnyDefault,
  }))

  if (rowsToInsert.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('report_templates').insert(rowsToInsert)
  }
}
