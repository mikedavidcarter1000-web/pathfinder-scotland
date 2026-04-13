import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { QuizClient } from './quiz-client'
import type { QuizQuestion, QuizResultRow, RiasecMapping } from './types'

export const metadata: Metadata = {
  title: 'Career interests quiz',
  description:
    'Discover careers that match your interests with this 3-minute RIASEC quiz, adapted for Scottish secondary school students. See recommended Highers for every top match.',
  openGraph: {
    title: 'Career interests quiz | Pathfinder Scotland',
    description:
      'Answer 18 quick questions to uncover careers that match your interests — with Scottish career areas and Highers that fit.',
  },
  alternates: {
    canonical: '/quiz',
  },
}

export default async function QuizPage() {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [questionsRes, mappingsRes, userRes] = await Promise.all([
    sb
      .from('quiz_questions')
      .select('id, question_text, riasec_type, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    sb
      .from('riasec_career_mapping')
      .select('id, riasec_type, career_area, example_careers, recommended_highers, description, display_order')
      .order('riasec_type', { ascending: true })
      .order('display_order', { ascending: true }),
    supabase.auth.getUser(),
  ])

  const questions: QuizQuestion[] = (questionsRes.data ?? []) as QuizQuestion[]
  const mappings: RiasecMapping[] = (mappingsRes.data ?? []) as RiasecMapping[]
  const user = userRes.data.user

  let previousResult: QuizResultRow | null = null
  if (user) {
    const { data } = await sb
      .from('quiz_results')
      .select('*')
      .eq('student_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    previousResult = (data ?? null) as QuizResultRow | null
  }

  return (
    <QuizClient
      questions={questions}
      mappings={mappings}
      isLoggedIn={!!user}
      previousResult={previousResult}
    />
  )
}
