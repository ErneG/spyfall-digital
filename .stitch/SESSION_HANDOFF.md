# Stitch Session Handoff

Use this prompt in a new Codex session where Stitch tooling is actually available.

## Ready-to-paste prompt

```md
Continue the Spyfall Digital V2 rebuild in the existing repo and branch.

Start by reading:

1. `docs/revamp/spyfall-v2-roadmap.md`
2. `.stitch/DESIGN.md`
3. `docs/engineering/conventions.md`

Important project context:

- Branch: `feature/spyfall-v2`
- Main worktree: `/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2`
- The app is mid-revamp with pass-and-play as the main product, Library/content management second, and online rooms being converged later.
- Guardrails and stabilization are already in place.
- Stitch is now callable through `stitch-mcp` on this machine, but the CLI has a few quirks documented in `.stitch/STITCH_NOTES.md`.
- Active Stitch project: `projects/14798622379269638155`
- Active design system asset: `assets/9802825457640323583`

What is already done:

- pass-and-play moved onto a dedicated route
- a built-in location preview exists before starting a game
- Library is now a first-class route
- saved locations exist as user-owned content
- collections can import saved locations
- room custom locations use a real editor instead of placeholder values
- the app has started moving to a light-first, restrained glassmorphic shell
- room runtime moved off the old SSE path
- a first home mode picker concept was generated and saved locally, but it is not approved yet because the copy drifted into sci-fi/system-console language
- saved Stitch artifacts and working-state notes now live under `.stitch/designs` and `.stitch/STITCH_NOTES.md`

What you should do:

1. Use Stitch to generate high-fidelity screen explorations that follow `.stitch/DESIGN.md`.
   Use the working CLI pattern in `.stitch/STITCH_NOTES.md`.
2. Be strict about rejecting anything that looks like generic dashboard UI, loud purple gradients, or over-designed “AI slop”.
3. Prioritize these screens in order:
   - home mode picker
   - pass-and-play setup
   - pass-and-play handoff and reveal flow
   - Library shell
   - collection editor
4. After generation, integrate the best direction into the existing React/Next app in reusable pieces.
5. Keep pages server-first by default and use client components only for interactive leaves.
6. Preserve gameplay rules and current content-model behavior unless a change is required and justified.
7. Continue atomic commits and keep the repo green with:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
   - `pnpm build-storybook`

Design constraints:

- Apple-adjacent, not an Apple clone
- light-first
- restrained glassmorphism
- cool neutrals and muted blue-green accents
- no purple-led palette
- no gamer dashboard energy
- premium mobile-first spacing and typography
- privacy-sensitive handoff and reveal moments

Implementation priorities after Stitch generation:

1. finish the pass-and-play setup and reveal polish
2. unify Library information architecture across built-in, saved, and collection content
3. continue moving legacy `src/domains` responsibilities into `src/features`, `src/entities`, and `src/shared`
4. keep reducing remaining warnings and architectural smells in atomic commits

Before making design changes, verify Stitch is actually callable in this session. If it is still not available, do not fake it. Continue with code-driven refinement and document the tooling gap clearly.
```

## Session checklist

- confirm the Stitch tool or CLI is present before relying on it
- read `.stitch/STITCH_NOTES.md` before invoking Stitch tools
- do not commit secrets or API keys into repo files
- prefer generated direction that can be decomposed into reusable primitives
- keep product logic authoritative over generated visuals
