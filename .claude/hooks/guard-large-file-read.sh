#!/bin/bash
# Hook: Block reading large files without limit/offset
# PreToolUse for Read — exit 2 to block

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
LIMIT=$(echo "$INPUT" | jq -r '.tool_input.limit // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0
[ -n "$LIMIT" ] && exit 0
[ -f "$FILE" ] || exit 0
LINE_COUNT=$(wc -l < "$FILE" 2>/dev/null)
[ -z "$LINE_COUNT" ] && exit 0
if [ "$LINE_COUNT" -gt 400 ]; then
  echo "{\"block\": true, \"message\": \"File has $LINE_COUNT lines — will hit token limit. Add limit/offset params, or use Grep.\"}" >&2
  exit 2
fi
exit 0
