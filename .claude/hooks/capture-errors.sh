#!/bin/bash
# Hook: PostToolUseFailure — auto-capture error context for learning
# Logs every tool failure so patterns can be identified

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"' 2>/dev/null)
ERROR_MSG=$(echo "$INPUT" | jq -r '.error // "no error message"' 2>/dev/null)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

LEARNINGS_DIR=".claude/learnings"
mkdir -p "$LEARNINGS_DIR"

cat >> "$LEARNINGS_DIR/errors.log" << ENTRY
---
timestamp: $TIMESTAMP
tool: $TOOL_NAME
error: $ERROR_MSG
ENTRY

echo "{\"additionalContext\": \"Previous tool call failed: $TOOL_NAME — $ERROR_MSG. Check .claude/learnings/errors.log for pattern history.\"}"

exit 0
