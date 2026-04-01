#!/bin/bash
# Hook: Block creating new API route files
# PreToolUse for Write — exit 2 to block

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0

# Only check Write tool (new file creation)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
[ "$TOOL" != "Write" ] && exit 0

# Check if file is in api/ directory
case "$FILE" in
  */src/app/api/*)
    # Allow the existing SSE route
    case "$FILE" in
      */rooms/*/events/route.ts) exit 0 ;;
    esac
    echo '{"block": true, "message": "Do NOT create new API routes. Use server actions in domains/*/actions.ts instead. Only SSE (streaming) requires an API route. See .claude/rules/no-api-routes.md"}' >&2
    exit 2
    ;;
esac

exit 0
