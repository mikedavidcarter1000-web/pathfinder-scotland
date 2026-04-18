# Git hooks for Pathfinder Scotland

Local hooks to support the Pathfinder workflow. Hooks live here (tracked) 
and must be copied to .git/hooks/ (not tracked) once per clone.

## Install

From the repo root:

    bash scripts/git-hooks/install.sh

## Hooks

- post-commit -- Nudges the developer to capture learnings in 
  docs/session-learnings.md on commits that look like session-closing 
  commits (subject starts with session|feat|refactor|chore and mentions 
  session|sprint|round).
