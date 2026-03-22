#!/bin/bash
# Hook: Block edits on main/master branch
# PreToolUse for Edit|Write — exit 2 to block

BRANCH=$(git branch --show-current 2>/dev/null)

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  mkdir -p .claude/learnings
  echo "$(date '+%Y-%m-%d %H:%M:%S') BLOCKED by guard-main-branch: attempted edit on $BRANCH branch" >> .claude/learnings/blocks.log
  echo '{"block": true, "message": "Cannot edit on main/master branch. Create a feature branch first: git checkout -b feature/your-feature"}' >&2
  exit 2
fi

exit 0
