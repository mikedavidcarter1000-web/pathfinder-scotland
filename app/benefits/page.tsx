import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BenefitsClient } from './benefits-client'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: 'Student Benefits & Discounts in Scotland',
  description:
    'Every free entitlement and discount for Scottish students. Free bus travel, free tuition, £10,000+ in free software, and hundreds of retail discounts.',
  openGraph: {
    title: 'Student Benefits & Discounts in Scotland | Pathfinder Scotland',
    description:
      'Every free entitlement and discount for Scottish students. Free bus travel, free tuition, £10,000+ in free software, and hundreds of retail discounts.',
  },
  alternates: {
    canonical: '/benefits',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do Scottish students pay tuition fees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Eligible Scottish-domiciled students studying a full-time undergraduate course in Scotland pay no tuition fees. SAAS pays up to £1,820 per year directly to your university or college on your behalf. Students from the rest of the UK and international students still pay tuition fees.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Young Scot card?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The Young Scot National Entitlement Card (NEC) is a free card for 11–25 year olds in Scotland. It acts as proof of age, bus pass, library card, and key to hundreds of discounts through Young Scot Rewards — including 50% off ScotRail fares, free National Trust for Scotland membership, and free bus travel for under-22s.",
      },
    },
    {
      '@type': 'Question',
      name: 'What discounts do school pupils get in Scotland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Scottish school pupils get free bus travel (under-22s), free NHS prescriptions, free eye tests, free period products, a Young Scot card unlocking hundreds of discounts, and — for pupils from lower-income households — the Education Maintenance Allowance (£30/week) and the School Clothing Grant (£120–£225 per year). Commercial discounts via Student Beans and UNiDAYS are generally limited to 16+.",
      },
    },
  ],
}

export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  // Resolve logged-in student (if any) for personalisation.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let student: Tables<'students'> | null = null
  let studentSubjectIds: string[] = []
  if (user) {
    const [{ data: s }, { data: grades }] = await Promise.all([
      supabase.from('students').select('*').eq('id', user.id).single(),
      supabase.from('student_grades').select('subject_id').eq('student_id', user.id),
    ])
    student = s
    studentSubjectIds = (grades ?? [])
      .map((g) => g.subject_id)
      .filter((v): v is string => !!v)
  }

  const [{ data: benefits }, { data: categories }, subjectRows] = await Promise.all([
    supabase
      .from('student_benefits')
      .select('*')
      .eq('is_active', true)
      .order('priority_score', { ascending: false }),
    supabase.from('benefit_categories').select('*').order('display_order', { ascending: true }),
    studentSubjectIds.length > 0
      ? supabase.from('subjects').select('id, name').in('id', studentSubjectIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string | null }> }),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BenefitsClient
        benefits={benefits ?? []}
        categories={categories ?? []}
        student={student}
        studentSubjectNames={(subjectRows.data ?? [])
          .map((s) => s.name)
          .filter((v): v is string => !!v)}
        initialCategory={params.category ?? null}
        initialFilter={params.filter ?? null}
      />
    </>
  )
}
