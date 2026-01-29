import { GRADE_VALUES, UCAS_POINTS } from './constants'

export type QualificationType = 'higher' | 'advanced_higher' | 'national_5' | 'a_level' | 'btec'
export type HigherGrade = 'A' | 'B' | 'C' | 'D'
export type AdvancedHigherGrade = 'A' | 'B' | 'C' | 'D'
export type National5Grade = 'A' | 'B' | 'C' | 'D'
export type ALevelGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E'
export type BTECGrade = 'D*' | 'D' | 'M' | 'P'

export interface Grade {
  subject: string
  grade: string
  qualification_type: QualificationType
  year?: number
  predicted?: boolean
}

/**
 * Calculate grade string from a list of grades (e.g., "AAABB")
 */
export function calculateGradeString(
  grades: Grade[],
  qualificationType: QualificationType = 'higher',
  limit = 5
): string {
  const relevantGrades = grades
    .filter((g) => g.qualification_type === qualificationType)
    .map((g) => g.grade)
    .sort((a, b) => {
      const values = GRADE_VALUES[qualificationType] as Record<string, number>
      return (values[b] || 0) - (values[a] || 0)
    })
    .slice(0, limit)

  return relevantGrades.join('')
}

/**
 * Calculate total UCAS points from grades
 */
export function calculateUCASPoints(grades: Grade[]): number {
  return grades.reduce((total, grade) => {
    const qualType = grade.qualification_type as keyof typeof UCAS_POINTS
    const points = UCAS_POINTS[qualType] as Record<string, number> | undefined
    if (points && points[grade.grade]) {
      return total + points[grade.grade]
    }
    return total
  }, 0)
}

/**
 * Get grade value for comparison
 */
export function getGradeValue(grade: string, qualificationType: QualificationType): number {
  const values = GRADE_VALUES[qualificationType] as Record<string, number>
  return values[grade] || 0
}

/**
 * Compare two grade strings (e.g., "AAABB" vs "AABBB")
 * Returns: positive if grades1 > grades2, negative if grades1 < grades2, 0 if equal
 */
export function compareGradeStrings(grades1: string, grades2: string): number {
  const gradeOrder = ['A', 'B', 'C', 'D', 'E']

  for (let i = 0; i < Math.max(grades1.length, grades2.length); i++) {
    const g1 = grades1[i] || 'Z'
    const g2 = grades2[i] || 'Z'

    const idx1 = gradeOrder.indexOf(g1)
    const idx2 = gradeOrder.indexOf(g2)

    if (idx1 !== idx2) {
      return idx2 - idx1 // Lower index = better grade
    }
  }

  return 0
}

/**
 * Check if student grades meet entry requirements
 */
export function meetsRequirements(
  studentGrades: string,
  requiredGrades: string,
  considerWidening = false
): 'eligible' | 'possible' | 'below' {
  // If considering widening access, reduce requirement by 1 grade per subject
  const adjustedRequired = considerWidening
    ? adjustGradesForWidening(requiredGrades)
    : requiredGrades

  const comparison = compareGradeStrings(studentGrades, adjustedRequired)

  if (comparison >= 0) return 'eligible'

  // Check if within 2 grades of meeting requirements
  const gap = calculateGradeGap(studentGrades, adjustedRequired)
  if (gap <= 2) return 'possible'

  return 'below'
}

/**
 * Calculate the "gap" between two grade strings
 */
function calculateGradeGap(studentGrades: string, requiredGrades: string): number {
  const gradeOrder = ['A', 'B', 'C', 'D', 'E']
  let gap = 0

  for (let i = 0; i < requiredGrades.length; i++) {
    const studentGrade = studentGrades[i] || 'E'
    const requiredGrade = requiredGrades[i]

    const studentIdx = gradeOrder.indexOf(studentGrade)
    const requiredIdx = gradeOrder.indexOf(requiredGrade)

    if (studentIdx > requiredIdx) {
      gap += studentIdx - requiredIdx
    }
  }

  return gap
}

/**
 * Adjust required grades for widening access (typically 1 grade lower per subject)
 */
export function adjustGradesForWidening(requiredGrades: string, reduction = 1): string {
  const gradeOrder = ['A', 'B', 'C', 'D']

  return requiredGrades
    .split('')
    .map((grade) => {
      const idx = gradeOrder.indexOf(grade)
      if (idx === -1) return grade
      const newIdx = Math.min(idx + reduction, gradeOrder.length - 1)
      return gradeOrder[newIdx]
    })
    .join('')
}

/**
 * Format grades for display
 */
export function formatGrades(grades: Grade[], qualificationType: QualificationType): string {
  const gradeString = calculateGradeString(grades, qualificationType)
  const count = grades.filter((g) => g.qualification_type === qualificationType).length

  if (!gradeString) return 'No grades'

  return `${gradeString} (${count} subject${count !== 1 ? 's' : ''})`
}

/**
 * Parse a grade string into individual grades
 */
export function parseGradeString(gradeString: string): string[] {
  // Handle A* grades
  return gradeString.replace(/A\*/g, 'A*,').split(',').filter(Boolean)
}

/**
 * Get the display label for a qualification type
 */
export function getQualificationLabel(qualificationType: QualificationType): string {
  const labels: Record<QualificationType, string> = {
    higher: 'Higher',
    advanced_higher: 'Advanced Higher',
    national_5: 'National 5',
    a_level: 'A-Level',
    btec: 'BTEC',
  }
  return labels[qualificationType]
}

/**
 * Get available grades for a qualification type
 */
export function getAvailableGrades(qualificationType: QualificationType): string[] {
  const gradesByType: Record<QualificationType, string[]> = {
    higher: ['A', 'B', 'C', 'D'],
    advanced_higher: ['A', 'B', 'C', 'D'],
    national_5: ['A', 'B', 'C', 'D'],
    a_level: ['A*', 'A', 'B', 'C', 'D', 'E'],
    btec: ['D*', 'D', 'M', 'P'],
  }
  return gradesByType[qualificationType]
}

/**
 * Check if a grade is passing
 */
export function isPassingGrade(grade: string, qualificationType: QualificationType): boolean {
  const passingGrades: Record<QualificationType, string[]> = {
    higher: ['A', 'B', 'C'],
    advanced_higher: ['A', 'B', 'C'],
    national_5: ['A', 'B', 'C'],
    a_level: ['A*', 'A', 'B', 'C', 'D', 'E'],
    btec: ['D*', 'D', 'M', 'P'],
  }
  return passingGrades[qualificationType].includes(grade)
}
