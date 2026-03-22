#!/usr/bin/env bash
# PostToolUse hook: auto-commit when uncommitted changes pile up.
# Silent 99% of the time. When triggered, runs headless claude (haiku) to commit.

set -euo pipefail

# Gate 1: Only check every 10th invocation
COUNTER_FILE="/tmp/.claude-commit-reminder-counter"
COUNT=$(cat "$COUNTER_FILE" 2>/dev/null || echo 0)
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNTER_FILE"
[ $((COUNT % 10)) -ne 0 ] && exit 0

# Gate 2: Must have 6+ uncommitted changes
CHANGED=$(git diff --name-only HEAD 2>/dev/null | wc -l | tr -d ' ')
[ "$CHANGED" -lt 6 ] && exit 0

# Gate 3: No recent commit (5 min cooldown)
LAST_COMMIT=$(git log -1 --format=%ct 2>/dev/null || echo 0)
NOW=$(date +%s)
[ $((NOW - LAST_COMMIT)) -lt 300 ] && exit 0

# Gate 4: Don't fire twice for same changes
HASH_FILE="/tmp/.claude-commit-reminder-hash"
CURRENT_HASH=$(git diff --name-only HEAD 2>/dev/null | sort | ( md5sum 2>/dev/null || md5 -q 2>/dev/null ) | cut -d' ' -f1)
LAST_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")
[ "$CURRENT_HASH" = "$LAST_HASH" ] && exit 0
echo "$CURRENT_HASH" > "$HASH_FILE"

# All gates passed: collect context and run headless commit
DIFF_STAT=$(git diff --stat HEAD 2>/dev/null | tail -30)
DIFF_FILES=$(git diff --name-only HEAD 2>/dev/null)
RECENT_MSGS=$(git log --oneline -5 2>/dev/null)

claude -p --model haiku --allowedTools "Bash,Read" --max-turns 5 "$(cat <<PROMPT
You are a commit assistant. Commit the uncommitted changes in this repo.

Rules:
- Stage ONLY the files listed below (never .env, credentials, secrets, or untracked files)
- Group into 1-3 logical commits. One commit is fine if changes are related.
- Use conventional commit style matching these recent messages:
${RECENT_MSGS}
- Commit message: short subject line, optional body if >5 files. Focus on WHY not WHAT.
- After committing, run git status to confirm.
- Do NOT push. Do NOT amend existing commits.

Changed files:
${DIFF_FILES}

Diff summary:
${DIFF_STAT}
PROMPT
)" > /tmp/.claude-commit-reminder.log 2>&1 &

echo "Auto-commit triggered for ${CHANGED} changed files (background)."
