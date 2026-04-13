import type { AnswerValue, QuizQuestion, RiasecType, Scores } from './types'

export const RIASEC_ORDER: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C']

export const RIASEC_LABELS: Record<RiasecType, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}

export const RIASEC_TAGLINES: Record<RiasecType, string> = {
  R: 'The Doer',
  I: 'The Thinker',
  A: 'The Creator',
  S: 'The Helper',
  E: 'The Persuader',
  C: 'The Organiser',
}

export const RIASEC_DESCRIPTIONS: Record<RiasecType, string> = {
  R: 'Practical and hands-on. You like building, fixing, and working with tools or the outdoors.',
  I: 'Analytical and curious. You enjoy solving puzzles, investigating ideas, and understanding how things work.',
  A: 'Creative and expressive. You love making original things and coming at problems from new angles.',
  S: 'People-focused. You thrive when helping, teaching, or working alongside others.',
  E: 'Ambitious and persuasive. You like leading, pitching ideas, and getting things off the ground.',
  C: 'Organised and precise. You work best with clear structure, accurate detail, and dependable systems.',
}

export const RIASEC_COLOURS: Record<RiasecType, string> = {
  R: '#10B981',
  I: '#6366F1',
  A: '#8B5CF6',
  S: '#F59E0B',
  E: '#EF4444',
  C: '#3B82F6',
}

export const ANSWER_OPTIONS: Array<{ value: AnswerValue; label: string; emoji: string }> = [
  { value: 5, label: 'Love it',     emoji: '💚' },
  { value: 4, label: 'Enjoy',       emoji: '🙂' },
  { value: 3, label: 'Neutral',     emoji: '😐' },
  { value: 2, label: 'Not for me',  emoji: '🙁' },
  { value: 1, label: 'Hate it',     emoji: '👎' },
]

/**
 * Convert raw Likert sums (1-5 per question, 3 questions per type) into
 * normalised 0-100 scores. Using the full dynamic range (1s -> 0, 5s -> 100)
 * rather than raw/max produces a more readable profile.
 */
export function calculateScores(
  answers: Record<string, number>,
  questions: QuizQuestion[]
): { scores: Scores; topTypes: RiasecType[] } {
  const raw: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const counts: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const q of questions) {
    const a = answers[q.id]
    if (a) {
      raw[q.riasec_type] += a
      counts[q.riasec_type] += 1
    }
  }

  const scores: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const t of RIASEC_ORDER) {
    const n = counts[t]
    if (n === 0) {
      scores[t] = 0
      continue
    }
    const min = n * 1
    const max = n * 5
    scores[t] = Math.round(((raw[t] - min) / (max - min)) * 100)
  }

  // Sort by score desc; break ties with canonical RIASEC order for stability.
  const topTypes = [...RIASEC_ORDER].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a]
    return RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b)
  }).slice(0, 3)

  return { scores, topTypes }
}

/**
 * Fisher-Yates shuffle used once per quiz session so a student sees questions
 * in a consistent order while they're answering.
 */
export function shuffleQuestions<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
