# Stitch Working State

## Active Spyfall project

- Project: `projects/14798622379269638155`
- Title: `Spyfall Digital V2`
- Design system asset: `assets/9802825457640323583`
- Initial generated home screen: `projects/14798622379269638155/screens/e8b8a13c92f441569ef592095924bba3`

## Verified access path

Stitch is callable from this machine through the local CLI:

- binary: `stitch-mcp`
- auth health: `stitch-mcp doctor`
- auth mode that works here: short-lived OAuth access token from local gcloud

Working pattern:

```bash
ACCESS_TOKEN=$(~/.stitch-mcp/google-cloud-sdk/bin/gcloud auth print-access-token)
GOOGLE_CLOUD_PROJECT=gen-lang-client-0797685586 \
STITCH_ACCESS_TOKEN="$ACCESS_TOKEN" \
stitch-mcp tool <tool_name> -d '<json>' -o json
```

## Known CLI quirks

1. `stitch-mcp tool ... -f <file>` is broken in this environment.
   It crashes with `Bun is not defined` because the CLI's file-loading path uses `Bun.file(...)`.
   Use `-d '<json>'` instead of `-f`.

2. `list_screens` returned `{}` for the active Spyfall project even after generation.
   Use the screen ID returned in the generation response, then call `get_screen` or `get_screen_code` directly.

3. `get_screen_image` returned a base64-encoded 403 HTML page instead of a usable screenshot payload.
   The reliable path was:
   - fetch HTML with `get_screen_code`
   - save the HTML locally under `.stitch/designs`
   - preview it through a local web server
   - inspect it with Playwright

## Current saved design artifacts

- [home-mode-picker.html](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/home-mode-picker.html)
- [home-mode-picker-summary.json](/Users/ernestsdane/.config/superpowers/worktrees/spyfall-digital/spyfall-v2/.stitch/designs/home-mode-picker-summary.json)

## Quality verdict on first home concept

The first generated home concept is not approved for integration.

What worked:

- light-first glass layering
- softer neutral palette
- premium spacing direction

What failed:

- wrong brand and product language: `ETHEREAL`, `Select Protocol`, `Deployment Matrix`
- too much sci-fi/system-console framing instead of social game framing
- generic top-bar chrome and bottom navigation on a landing screen
- off-brief imagery and information scent

The next Stitch edit should preserve the surface treatment while correcting copy, hierarchy, and product framing.
