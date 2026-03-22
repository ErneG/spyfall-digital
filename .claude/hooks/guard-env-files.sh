#!/bin/bash
# Hook: Block edits to .env files
# PreToolUse for Edit|Write — exit 2 to block

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

if echo "$FILE_PATH" | grep -qE '\.env($|\.)'; then
  mkdir -p .claude/learnings
  echo "$(date '+%Y-%m-%d %H:%M:%S') BLOCKED by guard-env-files: attempted edit of $FILE_PATH" >> .claude/learnings/blocks.log
  echo '{"block": true, "message": "Cannot edit .env files via Claude. Edit manually."}' >&2
  exit 2
fi

exit 0
