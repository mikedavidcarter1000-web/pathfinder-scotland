// Centralised route constants used by every e2e spec. Tests must not
// hardcode URL strings -- route changes should update this file and
// cascade through the spec files.

export const ROUTES = {
  // Public
  landing: '/',
  careers: '/careers',
  compare: '/careers/compare',
  aiCareers: '/ai-careers',
  forParents: '/for-parents',
  forTeachers: '/for-teachers',
  forAdvisers: '/for-advisers',

  // Auth
  signUp: '/auth/sign-up',
  signIn: '/auth/sign-in',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',

  // Authenticated
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  savedComparisons: '/account/saved-comparisons',
} as const

export type RouteKey = keyof typeof ROUTES
