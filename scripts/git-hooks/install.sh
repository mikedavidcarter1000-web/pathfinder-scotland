#!/bin/bash
# Install local git hooks from the tracked scripts/git-hooks directory
# Run once after cloning the repo

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HOOK_DIR="$SCRIPT_DIR/../../.git/hooks"

if [ ! -d "$HOOK_DIR" ]; then
  echo "Error: $HOOK_DIR does not exist. Are you in a git repo?"
  exit 1
fi

for hook in "$SCRIPT_DIR"/*; do
  hook_name=$(basename "$hook")
  if [ "$hook_name" = "install.sh" ]; then continue; fi
  if [ "$hook_name" = "README.md" ]; then continue; fi
  cp "$hook" "$HOOK_DIR/$hook_name"
  chmod +x "$HOOK_DIR/$hook_name"
  echo "Installed: $hook_name"
done

echo "Done. Hooks installed to .git/hooks/"
