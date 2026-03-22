---
description: Always search for all affected files before making changes
globs: src/**
---

Before fixing any pattern (renaming, refactoring, updating an API):
1. Grep the entire codebase for the pattern you're about to change
2. Identify ALL files that reference it (imports, usages, tests)
3. Update all affected files in one pass — don't leave dangling references
