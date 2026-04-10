# Spyfall Digital V2 Design Direction

## Product intent

Spyfall Digital should feel calm, premium, and tactile. The core experience is social tension and secret knowledge, not a loud gamer dashboard.

Pass-and-play is the primary surface. The design needs to support private handoff moments, quick setup, readable role reveals, and confident round control on a single shared device.

The overall feel should be much closer to modern iOS than the current generated concepts. This does not mean copying Apple screens literally, but it does mean the product should inherit the same level of restraint, rounded geometry, translucency, layering, motion quality, and interface clarity that people associate with iOS.

## Visual language

- very close to the overall feel of iOS without cloning system screens
- clean rounded UI throughout the product, with hardware-soft corners and calm spacing
- restrained glassmorphism with soft blur, layered translucency, and subtle edge highlights
- light-first surfaces with atmospheric depth behind them, not flat white or dashboard gray
- cool neutral palette with deep graphite, smoke, frost, and muted blue-green accents
- a subtle noir / mafia / spy undertone in the palette and atmosphere, not cartoon spy styling
- absolutely avoid purple anywhere in the app
- avoid generic SaaS cards, neon gamer chrome, and “vibe-coded” gradients with no hierarchy

## Color and atmosphere

- backgrounds should feel atmospheric, not flat:
  - smoked frost base
  - layered mist, steel, and desaturated teal glows
  - subtle noir tension rather than cheery app-store brightness
  - restrained contrast, but still readable
- surfaces should look like frosted panes over depth
- the palette should suggest secrecy, intrigue, and social tension:
  - frost / off-white
  - smoke / silver-blue gray
  - graphite / charcoal
  - muted teal or steel-blue accents
  - restrained oxblood or warning red only for danger, spy-state emphasis, or critical actions
- no purple, magenta, lavender, or violet accents anywhere
- no stock-photo atmosphere tricks; mood should come from color, composition, blur, and motion

## Typography

- premium, clean, system-adjacent typography
- strong hierarchy with generous spacing
- typography should feel crisp and modern, closer to iOS product polish than magazine editorial styling
- avoid literary serif drift in generated screens unless there is an exceptionally good reason
- body copy should stay quiet and compact
- labels and controls should feel native-quality, never gimmicky

## Layout principles

- mobile-first
- large touch targets
- spacing should feel intentional, airy, and native-quality
- setup screens should feel guided, not form-heavy
- pass-and-play moments should create privacy through spacing, focus, and reduced clutter
- keep one primary action per view
- avoid unnecessary app chrome on focused flows: no random settings bars, faux nav bars, or filler footer areas

## Motion

- motion should be designed with Framer Motion in mind
- subtle stagger and panel rise on load
- gentle blur, opacity, and scale transitions
- shared-layout transitions should feel spatial and calm
- handoff and reveal moments should feel ceremonial, private, and polished
- avoid bouncy novelty motion
- support reduced-motion preferences from the start
- motion should support handoff, reveal, confirmation, and mode transitions without becoming decorative noise

## Accessibility and UX requirements

- the app must follow strong mainstream UI/UX principles, not just a visual vibe
- maintain clear information hierarchy and obvious next actions
- meet WCAG AA contrast expectations for real text and controls
- do not rely on color alone to communicate state
- preserve large touch targets and forgiving tap areas on mobile
- ensure keyboard reachability and clear visible focus states
- ensure toggles, selections, and previews have readable labels and semantics
- support reduced motion for animation-heavy surfaces
- keep copy concrete, friendly, and product-real
- avoid hidden affordances, mystery-meat icons, or fictional product metaphors

## Explicit rejections

- the current generated directions are not close enough to the intended result
- no designs that feel “nothing like what we wanted”
- no fake enterprise, intelligence-agency, or sci-fi product language
- no purple-first branding
- no purple anywhere in the app
- no bright cyan-magenta gradients
- no default dashboard cards with generic icons and pill badges everywhere
- no crowded gamer UI
- no arbitrary shadows or overdone glass just because “glassmorphism” was requested
- no editorial-serif drift that makes the app feel like a magazine instead of a premium iOS-like product
- no stock photography for core product surfaces
- no tertiary actions renamed into things like `database`, `repository`, `protocol`, or similar off-brief metaphors

## Core screens to generate first

1. Home mode picker with pass-and-play primary
2. Pass-and-play setup with players, settings, source, and preview
3. Pass-and-play reveal flow
4. Library browser for built-in and custom locations
5. Collection editor with role chips and location previews
