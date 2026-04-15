# GEMINI.md -- Pathfinder Scotland (Antigravity Overrides)

> Antigravity-specific rules. These take precedence over AGENTS.md.
> Shared rules live in AGENTS.md (read that first for full project context).

---

## System and execution context (Windows 10/11)

- **Terminal:** This environment uses `pwsh` (PowerShell 7+). Never use Unix commands (`ls`, `rm`, `cat`) or forward slashes for absolute paths outside Git Bash.
- **Anti-hanging protocol:** All non-interactive commands MUST use `pwsh -c "command"` to force the shell to terminate. This prevents EOF loops.
- **Path format:** Use backslashes for Windows paths: `D:\Dev\pathfinder-scotland\src\app`
- **Project path:** `D:\Dev\pathfinder-scotland`

## Agent behaviour rules

### Planning mode
- Always use Planning Mode for tasks that touch more than 2 files.
- Present the implementation plan for review before executing.
- Do not auto-approve plans. Wait for human confirmation.

### Code generation
- Run `npm run build` after every set of changes. Zero errors required before marking task complete.
- Commit after each completed task with descriptive message: `type: description`
- Stage only files changed by the current task.
- Never modify `.env.local` or environment variable files.

### Model preference
- Use Gemini 3.1 Pro for complex multi-file tasks.
- Use Gemini 3 Flash for simple single-file fixes to conserve quota.

### Testing
- After making UI changes, use the built-in browser to verify the page renders correctly.
- Navigate to `http://localhost:3000` and check the affected route.
- Take a screenshot of the result for review.

### Security
- Never include API keys, tokens, or secrets in any file that gets sent to the agent context.
- Environment variables are in `.env.local` which is gitignored. Reference them by name only.
- The Supabase `service_role` key must never appear in client-side code or `NEXT_PUBLIC_` variables.

## Supabase patterns for this project

```typescript
// Server Component data fetching
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('table').select('*')
  // Always handle null: data?.map(...) or early return on error
}
```

```typescript
// Client Component
'use client'
import { createClient } from '@/lib/supabase/client'

export function ClientComponent() {
  const supabase = createClient()
  // Use useEffect or event handlers for data fetching
}
```

## Forbidden actions

- Do NOT delete or restructure existing routes without explicit instruction.
- Do NOT install new npm packages without stating the reason first.
- Do NOT use `@supabase/auth-helpers-nextjs` (deprecated). Use `@supabase/ssr` instead.
- Do NOT reference "SQA" anywhere. The correct name is "Qualifications Scotland" (dissolved February 2026).
- Do NOT modify the navigation structure without explicit instruction.

## Known issues to be aware of

- `/universities/[id]` and `/colleges/[id]` detail pages crash due to null safety in the React component. Data and RLS are fine.
- Cookie consent banner has no "Manage Preferences" option (acceptable for pilot).
- Some residual "SQA" references may exist in page titles.
