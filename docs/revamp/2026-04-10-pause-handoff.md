# Pause Handoff — 2026-04-10

## Branch and workspace

- Branch: `feature/spyfall-v2`
- Worktree: `/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2`

## Latest completed commits

- `e4b6e59` `refactor: move pass-and-play setup into feature modules`
- `f7555e3` `refactor: use stable player drafts in pass-and-play setup`
- `dd52c8a` `docs: capture stitch working state and home concept`

## What was completed in this session

### Code and architecture

- Verified that Stitch is callable in this environment through `stitch-mcp` with OAuth access-token auth from local gcloud.
- Moved the pass-and-play setup stack out of legacy `src/app` ownership and into feature/shared ownership:
  - `src/features/pass-and-play/components/*`
  - `src/features/pass-and-play/hooks/*`
  - `src/shared/ui/category-picker*`
- Kept the route shell thin by pointing [`src/app/play/pass-and-play/page.tsx`](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/src/app/play/pass-and-play/page.tsx) at the feature-owned setup client.
- Updated the Library route to consume the shared category picker rather than `@/app` internals.
- Cleaned up the accidental untracked feature files from the main checkout so the real work remains isolated in the worktree branch.

### Verification completed

These passed during this session on the worktree branch:

- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `DATABASE_URL='postgresql://postgres:postgres@localhost:5432/spyfall' BETTER_AUTH_SECRET='0123456789abcdef0123456789abcdef' BETTER_AUTH_URL='http://localhost:3000' pnpm build`

Note: plain `pnpm build` still fails in a bare shell without required env vars because the typed env guard is working as intended.

## Stitch status

### Active project

- Project: `projects/14798622379269638155`
- Title: `Spyfall Digital V2`
- Baseline design system asset: `assets/9802825457640323583`

### Most useful current screens

1. Home v2 generation

- Screen: `projects/14798622379269638155/screens/7e834aa223a2453fa6c08e7f62a8c223`
- Local artifacts:
  - `.stitch/designs/7e834aa223a2453fa6c08e7f62a8c223-code.json`
  - `.stitch/designs/7e834aa223a2453fa6c08e7f62a8c223.html`
  - `.stitch/designs/home-mode-picker-v2-summary.json`
- Verdict:
  - Much better copy than the original sci-fi concept.
  - Still not approved because it kept a fixed top nav, serif/editorial typography, and footer chrome.

2. Home v3 edit

- Screen: `projects/14798622379269638155/screens/d15c7f5f545248c89ab086e8c34d23c4`
- Local artifacts:
  - `.stitch/designs/d15c7f5f545248c89ab086e8c34d23c4-code.json`
  - `.stitch/designs/d15c7f5f545248c89ab086e8c34d23c4.html`
  - `.stitch/designs/home-mode-picker-v2-edit-summary.json`
- What improved:
  - top nav removed
  - footer removed
  - sans-only typography
  - pass-and-play made more visually primary
- What is still wrong:
  - secondary copy still drifts: `Connect with agents across the digital web.`
  - tertiary action drifted from `Open Library` to `Intel Repository`
  - tertiary icon drifted into a `database` metaphor
  - still not approved for direct integration

3. Pass-and-play setup generation

- Screen: `projects/14798622379269638155/screens/5023aa51a92e46ac9ba98efa347105ee`
- Local artifacts:
  - `.stitch/designs/5023aa51a92e46ac9ba98efa347105ee-code.json`
  - `.stitch/designs/5023aa51a92e46ac9ba98efa347105ee.html`
  - `.stitch/designs/pass-and-play-setup-v2-summary.json`
- What worked:
  - uses the intended Sora/Manrope direction
  - follows the requested four-section setup structure
  - correctly frames pass-and-play as a guided setup flow
- What is still wrong:
  - adds an unnecessary top app bar with a settings affordance
  - uses stock-photo image tiles in the included-locations list
  - over-stylizes some controls relative to the real app’s current component model
  - not approved for direct integration yet, but it is a strong reference for layout and section hierarchy

### Important Stitch behavior discovered

- `edit_screens` creates a new screen variant rather than necessarily mutating the visible prior one.
- `get_screen_code` currently returns `htmlContent`, not `html`, in the response payload for these newer screens.
- Stitch still tends to invent its own design-system asset and product language unless the prompt is extremely explicit.

## What is left

### 1. Finish the Stitch design loop before heavy visual integration

Priority order:

1. Get one approved home screen direction.
2. Get one approved pass-and-play setup direction.
3. Generate pass-and-play handoff and reveal screens.
4. Generate a cleaner Library shell and collection editor shell.

Acceptance bar:

- no sci-fi or “agent network” language
- no `database`, `repository`, `protocol`, or similar metaphors
- no stock photography for the core product surfaces
- no unnecessary top bars, bottom nav, or settings chrome on focused screens
- design should feel Apple-adjacent, calm, social, and product-realistic

### 2. Continue pass-and-play product polish

- Keep the setup flow feature-owned and continue reducing legacy `src/app` coupling.
- Polish the actual reveal and handoff flow so it feels ceremonial and private.
- Reconcile the current React UI with the strongest Stitch layout ideas once a screen is approved.
- Expand integration coverage around pass-and-play setup and transitions.

### 3. Continue Library and content-management cleanup

- Unify the built-in catalog, saved locations, and collections into a cleaner information architecture.
- Improve collection-backed source selection and preview inside pass-and-play.
- Tighten copy and affordances in the Library so it no longer describes collections as “upcoming”.

### 4. Continue online-room convergence

- Keep moving room/runtime concerns toward `features/entities/shared`.
- Continue simplifying resume/session behavior and shared runtime state.
- Bring room gameplay surfaces up to the same v2 shell quality as pass-and-play.

### 5. Storybook and test coverage

Add or expand coverage around:

- pass-and-play setup screen sections
- reveal / handoff flow
- shared category picker and preview surfaces
- Library shell and collection selection affordances
- any major UI integrated from Stitch-approved directions

## Recommended next actions

1. Read `.stitch/STITCH_NOTES.md` and `.stitch/SESSION_HANDOFF.md`.
2. Continue iterating the home screen from `d15c7f5f545248c89ab086e8c34d23c4` until the copy and tertiary action are on-brief.
3. Edit the pass-and-play setup screen `5023aa51a92e46ac9ba98efa347105ee` to remove the top app bar, remove stock imagery, and simplify the list treatment.
4. Once one screen is clearly approved, start integrating that design direction into reusable React primitives rather than copying raw generated markup.

## Working tree state at pause

At the time of this handoff, the only remaining uncommitted work should be the current Stitch artifacts and doc updates describing them.
