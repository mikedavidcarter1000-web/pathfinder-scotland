# Prompt templates

Starter templates for common Claude Code session shapes, extracted from 
patterns that worked during Round 1 career expansion and subsequent 
cleanup sessions.

Templates are not meant to be pasted verbatim. They are starting skeletons: 
fill in session-specific context, task lists, and stop-gate content for 
each new session. When a template is used, copy it to a working file, 
edit, then use that file as the Claude Code prompt.

## Templates

- data-expansion.md -- Used for sessions that add rows to a single table 
  with research + CSV stop-point + migration. Shape of Round 1 sessions 1-8.
- data-cleanup.md -- Used for sessions that fix data quality across 
  multiple tables with a single bundled migration. Shape of Round 1 
  end-of-session cleanup.
- housekeeping.md -- Used for small-batch sessions bundling 3-5 unrelated 
  small fixes. Kept deliberately terse.

## Conventions

Every prompt:
- Starts with Phase 0 orientation requirement
- Names the model (Opus) and effort level (usually high)
- States what's out of scope explicitly
- Uses STOP gates for any irreversible data change
- Ends with a final output section listing required deliverables
- Ends with "Clear Claude Code context after this session completes."
