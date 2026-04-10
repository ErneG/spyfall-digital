# Spyfall Digital V2 Roadmap

## Objective

Rebuild Spyfall Digital into a coherent, premium-feeling app with:

1. `Pass-and-play` as the primary product surface
2. `Library and content management` as the second pillar
3. `Online rooms` rebuilt on the same foundation after the first two are solid

This is intentionally a product rebuild, not a patch train. Existing domain logic should be preserved where it is correct, but the current mixed architecture, placeholder editing flows, and mismatched UI patterns should continue to be removed.

## Product principles

- The app should feel calm, tactile, premium, and social.
- The interface should be light-first and Apple-adjacent, not a literal Apple copy.
- The product should guide the player through one clear action at a time.
- Pass-and-play should feel private and ceremonial during handoff and reveal moments.
- The Library should be understandable without entering a room or starting a game.
- Online rooms should not be allowed to dictate the entire product structure.

## Architectural direction

The long-term code shape remains:

- `src/app`
  - route shells and page composition
- `src/features`
  - feature-owned UI and orchestration for pass-and-play, library, and online room flows
- `src/entities`
  - reusable domain-level state transformations and shared product concepts
- `src/shared`
  - UI primitives, tokens, config, helpers, and low-level hooks
- `src/domains`
  - legacy transitional area only during the revamp

Target dependency direction:

- `app -> features -> entities -> shared`
- `domains -> shared` only while legacy code still exists
- `shared` must never import upward

## Phase breakdown

### Phase 0: Engineering Guardrails

Status: `Complete`

Completed:

- ESLint was modularized and aligned with the v2 direction.
- Prettier config was added.
- `lint-staged` and pre-commit support were added.
- CI quality gates were added.
- engineering conventions were documented
- environment variables were centralized through a typed env module

Phase 0 acceptance criteria:

- correctness and architectural rules fail loudly
- style/cleanup rules warn without drowning out real errors
- the repo has durable quality gates before more product work lands

### Phase 1: Stabilization

Status: `Complete`

Completed:

- auth/bootstrap failure was fixed
- `better-auth` resolution was stabilized
- pass-and-play category defaults were corrected
- migrations replaced the risky deployment-time `db push --accept-data-loss` path
- README and setup docs were improved
- baseline lint, typecheck, test, build, and Storybook all became green

Phase 1 acceptance criteria:

- local boot works
- CI build works
- tests pass
- lint has no errors
- Docker and local setup no longer disagree on schema strategy

### Phase 2: V2 Foundation and Design System

Status: `In progress`

Completed:

- Home now points users into dedicated flows instead of overloading the landing page.
- A light-first glassmorphic shell has started replacing the old purple/dark aesthetic.
- pass-and-play, Library, collections, and room surfaces have begun moving onto a shared visual language.
- `.stitch/DESIGN.md` exists and is ready to inform Stitch generation.
- several server pages were converted back to server-first route composition where appropriate.

Remaining work:

- finish tokenizing the new visual language into a clearly reusable system
- generate and integrate higher-fidelity Stitch-backed shells and screen variants
- move more route trees to thinner server wrappers and smaller client leaves
- expand Storybook coverage around the new shell, cards, forms, reveal surfaces, and sheets

Phase 2 acceptance criteria:

- the main product surfaces visibly belong to one design system
- route files are thin and server-first by default
- shared primitives exist for cards, sheets, form groups, segmented controls, and privacy/reveal surfaces

### Phase 3: Pass-and-Play V2

Status: `In progress`

Completed:

- pass-and-play moved to its own route
- setup is no longer embedded in the home screen
- users can preview the built-in location pool before starting
- the round flow and reveal flow started moving onto the new shell

Remaining work:

- finish the dedicated pass-and-play setup state model around stable player draft objects everywhere
- deepen the guided setup sections: players, settings, source, preview
- polish the privacy handoff sequence and role reveal states
- verify restart and replay flows against all gameplay rules
- expand integration coverage for pass-and-play transitions

Phase 3 acceptance criteria:

- pass-and-play feels like a dedicated single-device product, not a room-mode adaptation
- users can always inspect what content is included before starting
- reveal, round, and result screens are calm and legible on mobile

### Phase 4: Library and Content Management V2

Status: `In progress`

Completed:

- Library is now a first-class route
- built-in locations can be browsed and previewed
- saved locations exist as a user-owned content model
- collections can import saved locations
- room custom locations now use a real editor instead of placeholder content

Remaining work:

- finish the Library information architecture so built-in, saved, and collection content all feel unified
- add stronger search, filtering, duplicate, and delete affordances
- tighten collection editing and preview UX
- validate legacy-to-v2 data parity more thoroughly
- expose collection-backed source selection more elegantly inside pass-and-play setup

Phase 4 acceptance criteria:

- users can create and edit saved locations with explicit role rows
- collections feel reusable and inspectable
- built-in content is explorable even without saving or starting a game

### Phase 5: Online Room Convergence and Hardening

Status: `Partially started`

Completed:

- the old SSE-based room update path was removed
- room state now leans on direct query polling
- the session model has started moving toward a clearer discriminated shape
- room lobby visuals have been moved closer to the v2 shell

Remaining work:

- continue moving room state and UI onto the same feature/entity/shared foundation as pass-and-play
- simplify resume/session behavior
- continue removing legacy room setup and editing surfaces
- harden polling, focus/refetch behavior, and cache boundaries
- bring room gameplay screens up to the same standard as pass-and-play

Phase 5 acceptance criteria:

- online rooms no longer feel like a separate app
- runtime state is simpler and easier to reason about
- legacy route/hook/action duplication is removed

## Known remaining workstreams

### 1. Warning cleanup and code smell reduction

At the time of writing, the app has moved from a red baseline to a warning-only baseline, but the warning backlog still needs to be reduced further in atomic cleanup commits. Prioritize:

- duplicate-string cleanup in legacy server actions
- remaining unnecessary-condition warnings
- test typing cleanup in room action tests
- seed logging cleanup
- any React or async-safety warnings that still indicate real fragility

### 2. Legacy architecture extraction

The app still contains meaningful legacy code under `src/domains`. Continue extracting stable concepts into `src/features`, `src/entities`, and `src/shared` while leaving working behavior intact.

Target order:

1. pass-and-play feature ownership
2. library feature ownership
3. room/runtime feature ownership

### 3. UX consistency review

As the rebuild continues, continue auditing for:

- multiple ways to perform the same action
- mismatched terminology between home, library, collections, rooms, and gameplay
- controls that still look like old dark-theme leftovers
- mobile spacing issues
- flows that require hidden knowledge of where content lives

### 4. Storybook and test coverage

Continue adding coverage around:

- pass-and-play setup
- location preview surfaces
- saved-location editor
- collection editor
- room custom-location editor
- reveal and round transitions

## Current validated commands

These commands should remain green as the rebuild continues:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm build-storybook`

## Current branch history highlights

Recent major commits on `feature/spyfall-v2`:

- `22d1763 feat: stabilize foundation and add pass-and-play v2 shell`
- `a97be58 feat: add saved location library and collection imports`
- `6e27ae9 feat: add collection-backed pass-and-play sources`
- `2cb1ba2 feat: refresh app shell and room runtime`
- `56d7ef0 feat: finish v2 collection and room overhaul`
- `74374c8 chore: clean shared i18n and auth warnings`
- `09aba8c chore: clean react warning hotspots`

## Stitch-specific continuation plan

The next session that has Stitch available should focus on design generation and integration, not rediscovering product direction.

Immediate Stitch tasks:

1. generate upgraded visual concepts for the home mode picker
2. generate a premium pass-and-play setup screen with preview and guided sections
3. generate the pass-and-play handoff and reveal flow
4. generate a Library shell for built-in, saved, and collection content
5. generate a refined collection editor with clearer hierarchy and preview behavior

Generation constraints:

- obey `.stitch/DESIGN.md`
- reject purple-led palettes
- reject generic SaaS dashboards
- reject over-busy glassmorphism
- keep the result mobile-first and premium

Integration expectations after generation:

- generated work must be adapted to the real component and route structure
- generated UI must be checked against current gameplay and editing requirements
- generated screens should be decomposed into reusable primitives instead of pasted in as monoliths

## Handoff rule

When a new session picks this up, it should first read:

1. `docs/revamp/spyfall-v2-roadmap.md`
2. `.stitch/DESIGN.md`
3. `.stitch/SESSION_HANDOFF.md`

Then it should confirm Stitch tooling is actually callable before attempting any design generation.
