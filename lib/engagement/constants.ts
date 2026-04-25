// Authority-3: typed constants for the platform_engagement_log table.
// Mirrors the CHECK constraints in the migration so callers cannot drift.

export const EVENT_TYPES = [
  'page_view',
  'feature_use',
  'career_explore',
  'course_save',
  'course_unsave',
  'tool_use',
  'search',
  'comparison',
  'pathway_action',
  'resource_view',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_CATEGORIES = [
  'career_sector',
  'career_role',
  'university',
  'college',
  'subject',
  'tool',
  'support',
  'blog',
  'search',
  'comparison',
  'pathway',
  'bursary',
  'entitlement',
  'results_day',
  'personal_statement',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]
