#!/bin/bash
# Hook: Stop — Quality sentinel checks for type errors before Claude stops
# Runs tsc on changed .ts/.tsx files. Exit 2 to keep Claude working if errors found.

INPUT=$(cat)

# Prevent infinite loops
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# Only check if there are uncommitted TS changes
CHANGED_TS=$(git diff --name-only --diff-filter=ACMR HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | grep -v '\.d\.ts$' | grep -v 'node_modules/' || true)
STAGED_TS=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E '\.(ts|tsx)$' | grep -v '\.d\.ts$' | grep -v 'node_modules/' || true)

ALL_CHANGED="$CHANGED_TS$STAGED_TS"

if [ -z "$ALL_CHANGED" ]; then
  exit 0
fi

TSC_OUTPUT=$(pnpm exec tsc --noEmit 2>&1 | head -30)
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ]; then
  HAS_RELEVANT_ERROR=false
  while IFS= read -r file; do
    if echo "$TSC_OUTPUT" | grep -q "$file"; then
      HAS_RELEVANT_ERROR=true
      break
    fi
  done <<< "$ALL_CHANGED"

  if [ "$HAS_RELEVANT_ERROR" = "true" ]; then
    echo "Type errors found in changed files. Please fix before stopping:" >&2
    echo "$TSC_OUTPUT" >&2
    exit 2
  fi
fi

exit 0
