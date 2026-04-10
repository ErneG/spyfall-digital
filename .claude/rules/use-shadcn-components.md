---
description: Always use shadcn/ui components instead of raw HTML elements
globs: src/components/**,src/app/**
---

Never use raw HTML elements when a shadcn/ui component exists:

- `<button>` → `<Button>` from `@/components/ui/button`
- `<input>` → `<Input>` from `@/components/ui/input`
- `<dialog>` → `<Dialog>` from `@/components/ui/dialog`
- `<div class="card">` → `<Card>` from `@/components/ui/card`

Install new shadcn components with: `npx shadcn@latest add <component>`
