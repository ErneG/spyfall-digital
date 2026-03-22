#!/usr/bin/env bash
# Hook: UserPromptSubmit — auto-apply pending proposals on session start.
# CRITICAL: NO set -e/-u/pipefail — non-zero exit blocks ALL user prompts.

PROPOSALS_DIR=".claude/proposals"
APPLIED_DIR="$PROPOSALS_DIR/applied"
SETTINGS=".claude/settings.json"

# Gate: Only run once per session
SESSION_MARKER="/tmp/.claude-proposals-checked-$(date +%Y%m%d)"
[ -f "$SESSION_MARKER" ] && exit 0

# Gate: Any pending proposals?
PENDING=$(find "$PROPOSALS_DIR" -maxdepth 1 -name "*.md" 2>/dev/null | head -20)
[ -z "$PENDING" ] && { touch "$SESSION_MARKER"; exit 0; }

COUNT=$(echo "$PENDING" | wc -l | tr -d ' ')
[ "$COUNT" -eq 0 ] && { touch "$SESSION_MARKER"; exit 0; }

mkdir -p "$APPLIED_DIR"

SUMMARY=""
APPLIED=0
SKIPPED=0

for PROPOSAL in $PENDING; do
  BASENAME=$(basename "$PROPOSAL")
  TYPE=$(awk '/^type:/ {print $2; exit}' "$PROPOSAL" 2>/dev/null)
  PRIORITY=$(awk '/^priority:/ {print $2; exit}' "$PROPOSAL" 2>/dev/null)
  PATTERN=$(sed -n '/^pattern:/s/^pattern: //p' "$PROPOSAL" 2>/dev/null | head -1)

  # Only auto-apply hooks
  if [ "$TYPE" != "hook" ]; then
    SKIPPED=$((SKIPPED + 1))
    SUMMARY="${SUMMARY}\n  SKIPPED (type=$TYPE, needs manual review): $BASENAME"
    continue
  fi

  HOOK_FILE=$(grep -oP '\.claude/hooks/[a-z0-9_-]+\.sh' "$PROPOSAL" 2>/dev/null | head -1)
  [ -z "$HOOK_FILE" ] && { SKIPPED=$((SKIPPED + 1)); SUMMARY="${SUMMARY}\n  SKIPPED (no hook path found): $BASENAME"; continue; }

  if [ -f "$HOOK_FILE" ]; then
    mv "$PROPOSAL" "$APPLIED_DIR/"
    SKIPPED=$((SKIPPED + 1))
    SUMMARY="${SUMMARY}\n  SKIPPED (already installed): $BASENAME"
    continue
  fi

  SCRIPT=$(awk '/^```bash$/,/^```$/{if(!/^```/)print}' "$PROPOSAL" | head -30)
  [ -z "$SCRIPT" ] && { SKIPPED=$((SKIPPED + 1)); SUMMARY="${SUMMARY}\n  SKIPPED (couldn't extract script): $BASENAME"; continue; }

  echo "$SCRIPT" > "$HOOK_FILE"
  chmod +x "$HOOK_FILE"

  # Register in settings.json
  MATCHER="Bash"
  if echo "$HOOK_FILE" | grep -q "read"; then MATCHER="Read"; fi
  if echo "$HOOK_FILE" | grep -q "glob"; then MATCHER="Glob"; fi
  if echo "$HOOK_FILE" | grep -q "env\|main-branch"; then MATCHER="Edit|Write"; fi

  PHASE="PreToolUse"
  if echo "$HOOK_FILE" | grep -q "validate"; then PHASE="PostToolUse"; fi

  if ! grep -q "$(basename "$HOOK_FILE")" "$SETTINGS" 2>/dev/null; then
    if command -v jq &>/dev/null; then
      NEW_ENTRY="{\"matcher\": \"$MATCHER\", \"hooks\": [{\"type\": \"command\", \"command\": \"bash $HOOK_FILE\", \"timeout\": 5}]}"
      jq --argjson entry "$NEW_ENTRY" ".hooks.${PHASE} += [\$entry]" "$SETTINGS" > "${SETTINGS}.tmp" && \
        mv "${SETTINGS}.tmp" "$SETTINGS"
    fi
  fi

  mv "$PROPOSAL" "$APPLIED_DIR/"
  APPLIED=$((APPLIED + 1))
  SUMMARY="${SUMMARY}\n  APPLIED [$PRIORITY]: $(basename "$HOOK_FILE") — $PATTERN"
done

touch "$SESSION_MARKER"

if [ $APPLIED -gt 0 ] || [ $SKIPPED -gt 0 ]; then
  echo "{\"additionalContext\": \"Compound learnings: $APPLIED proposals auto-applied, $SKIPPED skipped.\n$SUMMARY\nReview with: ls .claude/proposals/applied/\"}"
fi

exit 0
