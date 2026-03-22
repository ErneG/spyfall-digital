#!/usr/bin/env bash
# Hook: Stop — analyze session errors and propose permanent preventions.
# Spawns headless `claude -p --model sonnet` to review error patterns.
# Fire-and-forget — runs in background so it doesn't block session exit.

set -euo pipefail

ERRORS_LOG=".claude/learnings/errors.log"
PROPOSALS_DIR=".claude/proposals"

# Gate: Skip if no errors this session
if [ ! -f "$ERRORS_LOG" ]; then
  exit 0
fi

# Only look at errors from the last 3 hours
CUTOFF_TS=$(( $(date +%s) - 10800 ))
CUTOFF=$(date -r "$CUTOFF_TS" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d "@$CUTOFF_TS" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "2000-01-01 00:00:00")
SESSION_ERRORS=$(awk -v cutoff="$CUTOFF" '
  /^timestamp:/ { ts = substr($0, 12) }
  ts >= cutoff { print }
' "$ERRORS_LOG" 2>/dev/null)

# Skip if fewer than 2 errors (not a pattern)
ERROR_COUNT=$(echo "$SESSION_ERRORS" | grep -c "^timestamp:" 2>/dev/null || echo 0)
[ "$ERROR_COUNT" -lt 2 ] && exit 0

# Don't run if we already proposed today
TODAY=$(date '+%Y-%m-%d')
if ls "$PROPOSALS_DIR"/"$TODAY"_*.md 1>/dev/null 2>&1; then
  exit 0
fi

mkdir -p "$PROPOSALS_DIR"

RECENT_COMMITS=$(git log --oneline -10 --since="3 hours ago" 2>/dev/null || echo "none")
EXISTING_HOOKS=$(ls .claude/hooks/*.sh 2>/dev/null | xargs -I{} basename {} .sh | tr '\n' ', ')

claude -p --model sonnet --allowedTools "Read,Write,Glob,Grep,Bash" --max-turns 10 "$(cat <<PROMPT
You are a developer tooling engineer. Analyze the errors from this Claude Code session and propose permanent preventions.

## Session Errors
${SESSION_ERRORS}

## Recent Commits
${RECENT_COMMITS}

## Existing Hooks
${EXISTING_HOOKS}

## Your Task

For each error pattern:
1. Check if already prevented by existing hooks
2. Root cause analysis
3. False positive audit — grep codebase for matches
4. Only propose if pattern will recur

Write proposals to ${PROPOSALS_DIR}/${TODAY}_<name>.md with:
- type: hook|eslint-rule|claude-md-rule
- priority: high|medium|low
- Problem, Research, Proposed Fix, How to Apply sections

Rules:
- Only propose for REAL recurring patterns (2+ occurrences)
- Don't duplicate existing hooks
- Prefer cheapest enforcement (ESLint > hook > doc)
PROMPT
)" > /tmp/.claude-compound-learnings.log 2>&1 &

echo "Analyzing session errors for prevention opportunities (background)."
