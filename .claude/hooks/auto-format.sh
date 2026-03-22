#!/bin/bash
# Hook: Auto-format files after Write/Edit
# PostToolUse — always exit 0 (informational, never blocks)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format supported file types
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx|json|css|md|yaml|yml)$'; then
  pnpm exec prettier --write "$FILE_PATH" 2>/dev/null
fi

exit 0
