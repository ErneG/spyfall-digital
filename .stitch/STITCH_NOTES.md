# Stitch Working State

## Active Spyfall project

- Project: `projects/14798622379269638155`
- Title: `Spyfall Digital V2`
- Baseline design system asset: `assets/9802825457640323583`

## Verified access path

Stitch is callable from this machine through the local CLI:

- binary: `stitch-mcp`
- auth health: `stitch-mcp doctor`
- auth mode that works here: short-lived OAuth access token from local gcloud

Working pattern:

```bash
ACCESS_TOKEN=$(~/.stitch-mcp/google-cloud-sdk/bin/gcloud auth print-access-token)
GOOGLE_CLOUD_PROJECT=gen-lang-client-0797685586 STITCH_ACCESS_TOKEN="$ACCESS_TOKEN" stitch-mcp tool <tool_name> -d '<json>' -o json
```

## Known CLI quirks

1. `stitch-mcp tool ... -f <file>` is broken in this environment.
   It crashes with `Bun is not defined` because the CLI file-loading path uses `Bun.file(...)`.
   Use `-d '<json>'` instead of `-f`.

2. `list_screens` returned `{}` for the active Spyfall project even after generation.
   Use the screen ID returned in the generation response, then call `get_screen` or `get_screen_code` directly.

3. `get_screen_image` returned a base64-encoded 403 HTML page instead of a usable screenshot payload.
   The reliable path here is:
   - fetch markup with `get_screen_code`
   - save the HTML locally under `.stitch/designs`
   - inspect it locally

4. On the newer responses, `get_screen_code` returns `htmlContent`, not `html`.

5. `edit_screens` created a new screen variant in this project instead of only mutating the original screen in place.

## Current saved design artifacts

### Earlier artifacts

- [home-mode-picker.html](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/home-mode-picker.html)
- [home-mode-picker-summary.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/home-mode-picker-summary.json)

### Current work-in-progress artifacts

- [7e834aa223a2453fa6c08e7f62a8c223.html](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/7e834aa223a2453fa6c08e7f62a8c223.html)
- [7e834aa223a2453fa6c08e7f62a8c223-code.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/7e834aa223a2453fa6c08e7f62a8c223-code.json)
- [d15c7f5f545248c89ab086e8c34d23c4.html](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/d15c7f5f545248c89ab086e8c34d23c4.html)
- [d15c7f5f545248c89ab086e8c34d23c4-code.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/d15c7f5f545248c89ab086e8c34d23c4-code.json)
- [5023aa51a92e46ac9ba98efa347105ee.html](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/5023aa51a92e46ac9ba98efa347105ee.html)
- [5023aa51a92e46ac9ba98efa347105ee-code.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/5023aa51a92e46ac9ba98efa347105ee-code.json)
- [home-mode-picker-v2-summary.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/home-mode-picker-v2-summary.json)
- [home-mode-picker-v2-edit-summary.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/home-mode-picker-v2-edit-summary.json)
- [pass-and-play-setup-v2-summary.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/pass-and-play-setup-v2-summary.json)

## Current screen verdicts

## User clarification that overrides the current generated direction

The current designs still do not look enough like the intended product direction.

What the user wants more explicitly:

- the overall feel should be very close to iOS quality and restraint
- not just “Apple-adjacent” in theory, but genuinely iOS-like in rounded geometry, glass layering, spacing, and polish
- clean round UI with glassmorphic elements and atmospheric backgrounds
- motion that feels native-quality and calm, designed with Framer Motion in mind
- a stronger mafia / spies / secret-society undertone in the color language and atmosphere
- no purple tones anywhere in the app
- best-practice UX and real accessibility, not just aesthetic direction

This means current Stitch outputs should be judged more strictly than before.

### Original home concept

- Screen: `e8b8a13c92f441569ef592095924bba3`
- Status: not approved
- Failure mode:
  - sci-fi/system-console copy
  - generic top-bar chrome and bottom navigation
  - wrong product language

### Home v2 generation

- Screen: `7e834aa223a2453fa6c08e7f62a8c223`
- Status: not approved
- What improved:
  - correct top-level product copy
  - calmer palette and better hierarchy
- What still failed:
  - fixed top nav
  - serif/editorial typography drift
  - footer chrome

### Home v3 edit

- Screen: `d15c7f5f545248c89ab086e8c34d23c4`
- Status: still not approved, but the closest home direction so far
- What improved:
  - no top nav
  - no footer
  - sans-only typography
  - pass-and-play more clearly primary
- What still failed:
  - secondary copy: `Connect with agents across the digital web.`
  - tertiary action drifted from `Open Library` to `Intel Repository`
  - tertiary icon drifted into `database`
  - still does not feel close enough to iOS overall polish
  - still misses the desired mafia / spy atmosphere in a clean, product-real way

### Pass-and-play setup

- Screen: `5023aa51a92e46ac9ba98efa347105ee`
- Status: not approved for direct integration, but strong reference for layout
- What improved:
  - uses Sora/Manrope correctly
  - four-section setup structure is solid
  - good guided-flow hierarchy
- What still failed:
  - unnecessary top app bar / settings chrome
  - stock-photo imagery in the included-locations list
  - more stylized than the real component system should be
  - still does not feel enough like a real iOS-quality setup flow

## Design correction for the next Stitch session

Use these as hard requirements:

- the app should feel much closer to iOS overall
- rounded UI everywhere
- soft glassmorphism and layered atmospheric backgrounds
- Framer Motion-ready transitions that feel clean and native-quality
- a coherent noir / mafia / spies palette:
  - frost
  - smoke
  - graphite
  - muted teal / steel
  - restrained oxblood red
- no purple, violet, magenta, or lavender anywhere
- no stock photography on core product surfaces
- no fake “intel”, “repository”, “database”, “protocol”, or similar metaphors
- no unnecessary top bars, bottom nav, or settings chrome on focused screens
- follow real accessibility and UX principles, not just visual style
- if a generated screen does not clearly feel like the intended iOS-inspired direction, reject it and iterate again

## Practical recommendation

Do not integrate any current Stitch screen verbatim.

Use the current home edit and pass-and-play setup screen as reference material only, then keep iterating until:

- home copy is fully product-correct
- tertiary actions are phrased like real app navigation, not fictional product modules
- setup no longer includes stock photos or settings chrome
- the overall feel is much closer to iOS polish and rounded glass UI
- the palette clearly suggests intrigue / spies / mafia tension without becoming campy
- accessibility and usability are explicit acceptance criteria
- the screens feel product-real rather than prompt-real
