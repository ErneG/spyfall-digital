# Stitch Session Handoff

Use this prompt in a new Codex session to resume from the current pause point.

## Ready-to-paste prompt

```md
Continue the Spyfall Digital V2 rebuild in the existing repo and branch.

Start by reading:

1. `docs/revamp/2026-04-10-pause-handoff.md`
2. `docs/revamp/spyfall-v2-roadmap.md`
3. `.stitch/DESIGN.md`
4. `.stitch/STITCH_NOTES.md`
5. `docs/engineering/conventions.md`

Important project context:

- Branch: `feature/spyfall-v2`
- Main worktree: `/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2`
- The app is mid-revamp with pass-and-play as the main product, Library/content management second, and online rooms converging later.
- Stitch is callable in this environment through `stitch-mcp` and the working auth pattern is documented in `.stitch/STITCH_NOTES.md`.
- Active Stitch project: `projects/14798622379269638155`
- Baseline design system asset: `assets/9802825457640323583`

What is already done:

- pass-and-play moved onto a dedicated route
- the pass-and-play setup stack now lives under `src/features/pass-and-play` instead of `src/app`
- a built-in location preview exists before starting a game
- Library is now a first-class route
- saved locations exist as user-owned content
- collections can import saved locations
- room custom locations use a real editor instead of placeholder values
- the app has started moving to a light-first, restrained glassmorphic shell
- room runtime moved off the old SSE path

Current Stitch status:

- `7e834aa223a2453fa6c08e7f62a8c223`: improved home screen with correct copy but wrong nav/footer/serif treatment
- `d15c7f5f545248c89ab086e8c34d23c4`: improved home edit with no nav/footer and sans-only type, but still wrong secondary and tertiary product language
- `5023aa51a92e46ac9ba98efa347105ee`: strong pass-and-play setup reference with the right structure, but still too much chrome and stock imagery
- none of these are approved for direct integration yet

What you should do next:

1. Keep iterating the home and pass-and-play setup screens until one direction is genuinely on-brief.
2. Be strict about rejecting anything that looks like generic dashboard UI, sci-fi control-panel language, stock-photo product dressing, or purple-led AI slop.
3. Prioritize these screens after home/setup are stable:
   - pass-and-play handoff and reveal flow
   - Library shell
   - collection editor
4. Once a direction is clearly approved, integrate it into the existing React/Next app through reusable primitives instead of copying raw generated markup.
5. Keep pages server-first by default and use client components only for interactive leaves.
6. Continue atomic commits and keep the repo green with:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build` with required env vars set
   - `pnpm build-storybook`

Design constraints:

- Apple-adjacent, not an Apple clone
- light-first
- restrained glassmorphism
- cool neutrals and muted blue-green accents
- no purple-led palette
- no gamer dashboard energy
- no `database`, `repository`, `protocol`, or similar fake-product metaphors
- privacy-sensitive handoff and reveal moments

If Stitch starts drifting again, document the exact drift in `.stitch/STITCH_NOTES.md` before continuing.
```
