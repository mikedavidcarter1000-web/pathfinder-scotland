import { randomUUID } from 'node:crypto'

// Password that satisfies the sign-up validator in app/auth/sign-up/page.tsx:
// >= 8 chars, 1 upper, 1 lower, 1 digit. No special char required.
export const TEST_PASSWORD = 'TestPassword123!'

// Emails are routed to an RFC 2606 reserved .example.com domain so no
// accidental delivery is possible if a test ever leaked a signup.
const TEST_EMAIL_DOMAIN = 'pathfinder-test.example.com'

export function generateTestEmail(): string {
  return `e2e-${randomUUID()}@${TEST_EMAIL_DOMAIN}`
}

// TODO(Session 11c): implementation deferred until a dedicated test
// database exists. Until then, tests must not create real accounts
// against production Supabase. Calling this in Session 11a is a no-op
// that logs a warning so future-session refactors surface the gap.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function cleanupTestAccount(email: string): Promise<void> {
  // Deliberately unimplemented -- see comment above.
  if (process.env.DEBUG_E2E) {
    // eslint-disable-next-line no-console
    console.warn(
      `[e2e] cleanupTestAccount(${email}) is a stub; implementation lands in Session 11c`,
    )
  }
}
