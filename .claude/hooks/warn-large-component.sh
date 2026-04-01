#!/bin/bash
# Hook: Warn when editing component/page files that already exceed size limits
# PreToolUse for Edit|Write — warns (doesn't block) to decompose first

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0
[ -f "$FILE" ] || exit 0

# Only check component and page files
case "$FILE" in
  */components/*.tsx|*/app/*.tsx) ;;
  *) exit 0 ;;
esac

# Skip UI/shared component library files
case "$FILE" in
  */shared/ui/*|*/components/ui/*) exit 0 ;;
esac

LINE_COUNT=$(wc -l < "$FILE" 2>/dev/null | tr -d ' ')
[ -z "$LINE_COUNT" ] && exit 0

if [ "$LINE_COUNT" -gt 180 ]; then
  echo "⚠️  $FILE has $LINE_COUNT lines (limit: 200). DECOMPOSE before adding more code — extract hooks/subcomponents per .claude/rules/component-decomposition.md"
  exit 0
fi

exit 0
