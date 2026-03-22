#!/bin/bash
# Hook: Pre-push quality validation
# PreToolUse for Bash — blocks push if type check or lint fails

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Only validate if this is a git push command
if [[ ! "$COMMAND" =~ git\ push ]]; then
  exit 0
fi

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

# Type check
echo "Running type check..." >&2
if ! pnpm exec tsc --noEmit 2>&1 | tail -5 >&2; then
  echo '{"block": true, "message": "Type check failed. Fix TypeScript errors before pushing."}' >&2
  exit 2
fi

# Lint check
echo "Running lint check..." >&2
LINT_ERRORS=$(pnpm exec eslint 2>&1 | grep -c " error " || true)

if [ "$LINT_ERRORS" -gt 0 ]; then
  echo '{"block": true, "message": "ESLint errors found. Fix lint issues before pushing."}' >&2
  exit 2
fi

exit 0
