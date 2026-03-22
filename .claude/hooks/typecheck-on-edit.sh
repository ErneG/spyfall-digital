#!/usr/bin/env bash
# Hook: PostToolUse (matcher: Write|Edit) — periodic TypeScript type-check.
# Runs every 5th qualifying edit with a 60-second cooldown.
# CRITICAL: NO set -e/-u/pipefail — non-zero exit blocks prompts.

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || FILE=""

# Only check TypeScript files under src/
[[ "$FILE" == *.ts ]] || [[ "$FILE" == *.tsx ]] || exit 0
case "$FILE" in
  */src/*) ;;
  *) exit 0 ;;
esac

# Skip node_modules, generated
[[ "$FILE" == */node_modules/* ]] && exit 0
[[ "$FILE" == */generated/* ]] && exit 0
[ -f "$FILE" ] || exit 0

# Repo-specific prefix to avoid collisions across worktrees
REPO_HASH=$(echo "$REPO_ROOT" | md5 -q 2>/dev/null || echo "$REPO_ROOT" | md5sum 2>/dev/null | cut -c1-8 || echo "default")
REPO_HASH=${REPO_HASH:0:8}

# Counter: only run every 5th edit
COUNTER_FILE="/tmp/.claude-typecheck-counter-${REPO_HASH}"
CURRENT_COUNT=0
if [ -f "$COUNTER_FILE" ]; then
  CURRENT_COUNT=$(cat "$COUNTER_FILE" 2>/dev/null) || CURRENT_COUNT=0
fi
CURRENT_COUNT=$((CURRENT_COUNT + 1))
echo "$CURRENT_COUNT" > "$COUNTER_FILE" 2>/dev/null || true

if [ $((CURRENT_COUNT % 5)) -ne 0 ]; then
  exit 0
fi

# Cooldown: 60 seconds between runs
COOLDOWN_FILE="/tmp/.claude-typecheck-last-run-${REPO_HASH}"
NOW=$(date +%s 2>/dev/null) || NOW=0
if [ -f "$COOLDOWN_FILE" ]; then
  LAST_RUN=$(cat "$COOLDOWN_FILE" 2>/dev/null) || LAST_RUN=0
  ELAPSED=$((NOW - LAST_RUN))
  if [ "$ELAPSED" -lt 60 ]; then
    exit 0
  fi
fi
echo "$NOW" > "$COOLDOWN_FILE" 2>/dev/null || true

# Run tsc --noEmit from repo root
TSC_OUTPUT=$(cd "$REPO_ROOT" && npx tsc --noEmit 2>&1) || true
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ] && [ -n "$TSC_OUTPUT" ]; then
  ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" 2>/dev/null) || ERROR_COUNT=0
  FIRST_LINES=$(echo "$TSC_OUTPUT" | head -15 | sed 's/"/\\"/g' | tr '\n' '\\' | sed 's/\\/\\n/g')
  echo "{\"additionalContext\": \"TypeScript check: ${ERROR_COUNT} error(s) found.\\n${FIRST_LINES}\"}"
fi

exit 0
