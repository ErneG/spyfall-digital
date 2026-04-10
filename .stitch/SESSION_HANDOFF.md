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

Most important design correction from the user:

- the current generated designs still look nothing like the intended result
- the overall feel should be much closer to iOS
- think rounded UI, glassmorphic surfaces, atmospheric backgrounds, and polished calm motion
- this applies to the whole product feel, not just one settings screen
- the palette should suggest mafia / spies / secrecy / intrigue
- no purple tones anywhere in the app
- accessibility and best-practice UX are hard requirements, not polish work

What you should do next:

1. Keep iterating the home and pass-and-play setup screens until one direction is genuinely on-brief.
2. Be strict about rejecting anything that looks like generic dashboard UI, sci-fi control-panel language, stock-photo product dressing, or purple-led AI slop.
3. Be equally strict about rejecting anything that does not feel close enough to iOS-quality polish and rounded glass UI.
4. Prioritize these screens after home/setup are stable:
   - pass-and-play handoff and reveal flow
   - Library shell
   - collection editor
5. Once a direction is clearly approved, integrate it into the existing React/Next app through reusable primitives instead of copying raw generated markup.
6. Keep pages server-first by default and use client components only for interactive leaves.
7. Continue atomic commits and keep the repo green with:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build` with required env vars set
   - `pnpm build-storybook`

Design constraints:

- much closer to iOS overall feel
- light-first
- restrained glassmorphism
- rounded UI throughout
- cool neutrals and muted blue-green / steel accents with a subtle noir spy undertone
- no purple, violet, magenta, or lavender anywhere
- no gamer dashboard energy
- no `database`, `repository`, `protocol`, or similar fake-product metaphors
- motion should be calm, premium, and Framer Motion-friendly
- privacy-sensitive handoff and reveal moments
- accessibility and strong UX principles are part of the brief

If Stitch starts drifting again, document the exact drift in `.stitch/STITCH_NOTES.md` before continuing.
```
