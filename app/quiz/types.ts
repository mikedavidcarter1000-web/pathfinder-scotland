export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export type QuizQuestion = {
  id: string
  question_text: string
  riasec_type: RiasecType
  display_order: number
}

export type RiasecMapping = {
  id: string
  riasec_type: RiasecType
  career_area: string
  example_careers: string[]
  recommended_highers: string[] | null
  description: string | null
  display_order: number
}

export type QuizResultRow = {
  id: string
  student_id: string
  realistic_score: number
  investigative_score: number
  artistic_score: number
  social_score: number
  enterprising_score: number
  conventional_score: number
  top_types: string[]
  completed_at: string
}

export type Scores = Record<RiasecType, number>

export type AnswerValue = 1 | 2 | 3 | 4 | 5
