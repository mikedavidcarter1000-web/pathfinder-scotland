'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { LinkedChild } from '@/hooks/use-parent-link'
import { Skeleton } from '@/components/ui/loading-skeleton'

const STAGE_COPY: Record<string, { headline: string; body: string; next: string[] }> = {
  s2: {
    headline: 'Subject choices are coming up',
    body: "The subjects your child picks in S2-S3 will affect which university courses they can apply for in S5 and S6. It's worth looking at three or four careers they might be interested in and checking the recommended subjects for each.",
    next: [
      'Look through the Discover or Careers pages together to see 2-3 paths of interest',
      'Check which Highers are recommended for those paths',
      'Attend the school\'s subject-choice parents\' evening with a short list of questions',
    ],
  },
  s3: {
    headline: 'National 5 selection is now',
    body: "National 5 subjects are usually picked at the end of S3. These become the foundation for S5 Highers. Universities look at a strong set of National 5 results as the first signal that Highers will go well.",
    next: [
      'Pick a balanced N5 set: English, Maths, a science or tech, a humanity, and a language or arts',
      'Review the Pathways tool for routes that interest them',
      'Build a rough "career shortlist" of 3 options',
    ],
  },
  s4: {
    headline: 'National 5 exams this spring',
    body: "National 5 results in August determine which Highers your child can comfortably take in S5. A B or better at National 5 is the typical minimum for taking the Higher in the same subject.",
    next: [
      'Study timetable for exam preparation',
      'Short-list Higher subjects based on realistic N5 predictions',
      'Check if any summer widening-access programmes (SWAP, Top-Up, Reach) apply',
    ],
  },
  s5: {
    headline: 'The busiest year for applications',
    body: "S5 is when Highers are sat. UCAS applications open in September for entry the following year. Personal-statement drafting typically starts over the summer. SAAS funding applications open in April.",
    next: [
      'Shortlist 5 universities / courses by October',
      'Draft personal statement over summer',
      'Check Medicine / Dentistry / Vet: deadline is 15 October',
      'Apply to SAAS from April for funding starting in September',
    ],
  },
  s6: {
    headline: 'Application year',
    body: 'UCAS deadline is 29 January (15 October for Medicine, Dentistry, Veterinary). SAAS guarantee deadline is 30 June. Results day is in early August.',
    next: [
      'Submit UCAS by 29 January',
      'Apply to SAAS by 30 June for the on-time guarantee',
      'Check course acceptance emails after results day',
      'Accommodation applications usually open January-March',
    ],
  },
  college: {
    headline: 'HNC / HND to university',
    body: "If your child is studying an HNC or HND, many Scottish universities accept articulation: they can transfer into Year 2 (from HNC) or Year 3 (from HND) of a degree. This is one of the most efficient routes into university.",
    next: [
      'Ask their college about articulation partners',
      'Check each university\'s articulation pages for minimum grades',
      'Apply via UCAS in the year of intended entry',
    ],
  },
  mature: {
    headline: 'Mature student pathways',
    body: 'Mature students often enter via SWAP or direct routes based on prior learning and work experience. SAAS funding is available in similar form.',
    next: [
      'Explore SWAP (Scottish Wider Access Programme) routes',
      'Check university-specific mature-entry policies',
      'Apply to SAAS for funding',
    ],
  },
}

export function ParentKeyDatesCard({ child }: { child: LinkedChild }) {
  const supabase = getSupabaseClient()

  const { data: checklistData, isLoading } = useQuery({
    queryKey: ['parent-checklist', child.student_id],
    queryFn: async () => {
      const [itemsRes, progressRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('starting_uni_checklist_items')
          .select('id, title, category')
          .eq('is_active', true),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('student_checklist_progress')
          .select('checklist_item_id')
          .eq('student_id', child.student_id),
      ])
      const total = (itemsRes.data as { id: string }[] | null)?.length ?? 0
      const completed = (progressRes.data as { checklist_item_id: string }[] | null)?.length ?? 0
      return { total, completed }
    },
  })

  const stage = child.school_stage
  const copy = stage ? STAGE_COPY[stage] : null
  const percentComplete =
    checklistData && checklistData.total > 0
      ? Math.round((checklistData.completed / checklistData.total) * 100)
      : 0

  return (
    <section className="pf-card" aria-labelledby="parent-dates-heading">
      <h2 id="parent-dates-heading" style={{ marginBottom: '4px' }}>
        Key dates and next steps
      </h2>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '14px' }}>
        Where {child.first_name || 'your child'} is right now, and what&apos;s coming up.
      </p>

      {copy ? (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{copy.headline}</h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-700)', marginBottom: '10px' }}>
            {copy.body}
          </p>
          <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
            {copy.next.map((item) => (
              <li key={item} style={{ marginBottom: '4px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
          School stage is not set. Ask {child.first_name || 'your child'} to update their
          profile so we can show stage-specific guidance.
        </p>
      )}

      {/* Starting Uni progress */}
      <div
        className="rounded-lg"
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--pf-blue-50)',
          border: '1px solid var(--pf-blue-100)',
          marginTop: '14px',
        }}
      >
        <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>
          Starting Uni checklist
        </p>
        {isLoading ? (
          <Skeleton width="60%" height={14} rounded="sm" />
        ) : (
          <>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-700)', margin: '4px 0' }}>
              {checklistData?.completed ?? 0} of {checklistData?.total ?? 0} steps completed
            </p>
            <div
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--pf-grey-200)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '6px',
              }}
            >
              <div
                style={{
                  width: `${percentComplete}%`,
                  height: '100%',
                  backgroundColor: 'var(--pf-blue-700)',
                }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
