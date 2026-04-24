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

// Default report template. HTML is Mustache-ish; the generator replaces
// {{key}} and {{#array}}...{{/array}} block iterators at render time. The
// template purposely uses inline styles so email clients (with ham-fisted
// CSS strippers) still render the layout correctly when the HTML is piped
// into an email body.
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

  // Default report template (only if none exist for the school).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: existingTemplates } = await (admin as any)
    .from('report_templates')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  if ((existingTemplates ?? 0) === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('report_templates').insert({
      school_id: schoolId,
      name: 'Standard Termly Report',
      template_html: DEFAULT_REPORT_TEMPLATE_HTML,
      header_colour: '#1B3A5C',
      is_default: true,
    })
  }
}
