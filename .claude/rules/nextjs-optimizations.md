---
description: Next.js optimization patterns
globs: src/app/**
---

## Route Files

- Every route group should have `loading.tsx` (skeleton UI)
- Every route group should have `error.tsx` (error boundary)
- `page.tsx` files should be THIN — import from domains, pass props, nothing else
- Prefer Server Components by default — add `"use client"` only when needed

## Data Fetching

- Use Server Components for initial data fetch (no useEffect, no useState)
- Use `Suspense` boundaries around async components
- Preload data with `preload()` pattern for parallel fetches
- Cache expensive queries with `unstable_cache` or `cache()` from React

## Client Components

- Mark interactive components with `"use client"` at the TOP of the file
- Keep client components as SMALL as possible — push logic to server
- Use `useTransition` for server action calls (shows pending state)
- Use `useOptimistic` for instant UI feedback on mutations

## Images & Assets

- Use `next/image` for all images with width/height
- Use `next/font` for fonts (already done)
- Preload critical assets with `<link rel="preload">`

## Metadata

- Export `metadata` from every page for SEO
- Use `generateMetadata` for dynamic routes
