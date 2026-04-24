#!/bin/bash
# Apply a migration and auto-rename the local file if the remote timestamp differs.
#
# Supabase sometimes assigns a different version timestamp than the local filename
# (observed consistently when using the MCP apply_migration tool). This script
# applies the migration via `supabase db push`, queries the actual remote version,
# and renames the local file to match -- eliminating the manual rename step.
#
# Usage:
#   ./scripts/apply-migration.sh <migration_filename>
#   ./scripts/apply-migration.sh 20260424171731_schools_dyw_cpd.sql

set -euo pipefail

MIGRATION_DIR="supabase/migrations"

if [ -z "${1:-}" ]; then
  echo "Usage: ./scripts/apply-migration.sh <migration_filename>"
  echo "Example: ./scripts/apply-migration.sh 20260424171731_schools_dyw_cpd.sql"
  exit 1
fi

LOCAL_FILE="$MIGRATION_DIR/$1"
if [ ! -f "$LOCAL_FILE" ]; then
  echo "Error: $LOCAL_FILE not found"
  exit 1
fi

# Extract the 14-digit timestamp prefix and the descriptive suffix
LOCAL_TIMESTAMP=$(echo "$1" | grep -oE '^[0-9]{14}')
if [ -z "$LOCAL_TIMESTAMP" ]; then
  echo "Error: filename does not start with a 14-digit timestamp: $1"
  exit 1
fi
SUFFIX=$(echo "$1" | sed "s/^${LOCAL_TIMESTAMP}//")

echo "Applying migration: $1"
npx supabase db push

# Query the remote for the latest applied migration version.
# --agent no suppresses the JSON envelope that the CLI adds in agent-detected contexts.
REMOTE_TIMESTAMP=$(npx supabase db query --linked --agent no --output csv \
  "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;" \
  2>/dev/null | tail -n 1 | grep -oE '[0-9]{14}' | head -1)

if [ -z "$REMOTE_TIMESTAMP" ]; then
  echo "Warning: Could not retrieve remote timestamp. Run manually:"
  echo "  npx supabase db query --linked --agent no --output csv \"SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;\""
  exit 0
fi

if [ "$LOCAL_TIMESTAMP" = "$REMOTE_TIMESTAMP" ]; then
  echo "Timestamps match. No rename needed."
else
  NEW_FILENAME="${REMOTE_TIMESTAMP}${SUFFIX}"
  NEW_FILE="$MIGRATION_DIR/$NEW_FILENAME"
  mv "$LOCAL_FILE" "$NEW_FILE"
  echo "Renamed: $1 -> $NEW_FILENAME"
  echo "Remember to git add the renamed file before committing."
fi
