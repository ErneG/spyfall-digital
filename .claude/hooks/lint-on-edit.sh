#!/bin/bash
# PostToolUse hook: run ESLint on edited .ts/.tsx files
# Fast per-file lint — catches issues immediately

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Only lint TypeScript files
[[ "$FILE" == *.ts ]] || [[ "$FILE" == *.tsx ]] || exit 0

# Skip node_modules, generated files
[[ "$FILE" == */node_modules/* ]] && exit 0
[[ "$FILE" == */generated/* ]] && exit 0

# Skip if file doesn't exist (was deleted)
[ -f "$FILE" ] || exit 0

# Run ESLint on the single file
OUTPUT=$(./node_modules/.bin/eslint "$FILE" --no-warn-ignored --format compact 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ] && [ -n "$OUTPUT" ]; then
  ERROR_COUNT=$(echo "$OUTPUT" | grep -c " Error -" 2>/dev/null || echo "0")
  WARN_COUNT=$(echo "$OUTPUT" | grep -c " Warning -" 2>/dev/null || echo "0")
  SUMMARY="ESLint: ${ERROR_COUNT} errors, ${WARN_COUNT} warnings in $(basename "$FILE")"
  ISSUES=$(echo "$OUTPUT" | grep -E "(Error|Warning) -" | head -5 | sed 's/"/\\"/g' | tr '\n' ' ')
  echo "{\"additionalContext\": \"${SUMMARY}\\n${ISSUES}\"}"
fi

exit 0
