## Purpose

Vewave should feel deliberate, broadcast-adjacent, and product-specific. The interface should not
look like a generic starter template with expensive effects layered on top.

Use this document as the source of truth for visual hierarchy, interaction tone, product imagery,
icon treatment, and visual regression review.

## Design Principles

### State Before Style

Persistent navigation, publish state, room status, and active settings must be understood in under
one second. If an effect competes with state recognition, reduce or remove the effect.

Navigation selected states must include a stable visible marker. Do not rely on hover-only color,
pointer glow, drag, or motion to communicate the current route.

### Real Product Over Synthetic Mock

Landing pages, docs, and promotional surfaces should use captured product screens from real routes
before using invented dashboard placeholders.

Approved capture targets:

- `/studio`
- `/studio/home`
- `/studio/content-manager`
- `/studio/channel-settings`
- live room surfaces when available

Do not ship fake dashboard bars, empty skeleton cards, or generic abstract blocks as final marketing
artwork.

### Controlled Motion

Motion should confirm transitions, focus, disclosure, and spatial relationship. It should not act as
ambient decoration.

Rules:

- Honor `prefers-reduced-motion`.
- Do not make persistent navigation draggable.
- Do not depend on magnetic controls, pointer-reactive light, or continuous blob movement for core
  affordances.
- Use `motion="soft"` or `motion="none"` for app shells unless the surface is an explicit component
  showcase or an expressive one-off.

### Hierarchy By Contrast And Spacing

Each layer needs a distinct role:

- page background
- primary panel
- secondary panel
- status pill
- actionable control

Do not apply the same radius, contrast, and border treatment to every surface. Cards may use
`rounded-lg`; compact controls may use smaller radii; pills should be reserved for statuses,
filters, and short command-like controls.

### Brand Ownership

Do not use sample/demo assets in product UI, including starter avatars, placeholder logos, default
demo copy, or generic dashboard filler.

Use Lucide for low-risk utility actions. Identity-bearing surfaces, hero marks, and primary
navigation icons should move toward Vewave-specific assets as they become available.

## Color

Use neutral surfaces with one primary brand action color and semantic state colors. Accent colors
must clarify function; they should not be added as decorative lights.

Check contrast for text, focus rings, and selected states in both light and dark modes.

## Typography

Use the current system UI stack for product UI unless a deliberate brand type direction is added.
Avoid oversized display type inside compact panels, cards, sidebars, dialogs, and settings surfaces.

Use uppercase tracking sparingly for short labels only.

## Effects

Glass, blur, and gradients are permitted when they support material separation. They are not the
primary brand idea.

Rules:

- Maximum one decorative effect family per component.
- Avoid stacked radial lights in persistent shells.
- Avoid animated glow fields in selected navigation states.
- Avoid shadow values that make cards look like detached marketing tiles in dense product areas.

### Glass Material System

Glass is a user-selectable surface style (`Appearance → Surface style: Solid | Glass`), not a
default decoration. The material is defined once in `src/styles.css` (`.glass-surface` layers) and
consumed through the semantic API in `src/shared/ui/glass-surface.tsx` (`glassSurfaceVariants`).
Never hand-tune blur values on a component; declare what the surface is:

- `surface: auto | solid | glass` — whether the pane is material at all: `auto` (default)
  resolves from the user's `surfaceStyle`; `glass`/`solid` force one. Resolution is CSS-level
  via `data-surface-style`, so flipping the setting restyles every auto surface at once.
- `role: shell | dialog | sheet | menu | control | media` — the semantic recipe: the
  conventional token the pane falls back to when solid (shell → card, dialog/sheet/menu →
  popover, control → control fill, media → media chrome) plus role adjustments (the shell skips
  scattering — it sits over the static environment only, keeping one filtered layer under the
  header).
- `material: glass | liquidGlass` — the rendering backend: `glass` is the stable production
  frost; `liquidGlass` opts into the pointer-aware rim highlight, press response, and (behind
  the experimental flag) edge displacement. Small controls on chrome use `.glass-control`,
  which resolves through `--glass-control-*` tokens — never local alpha fills.
- `thickness: thin | regular | thick` — pane size drives scattering (menus are thin, bars and
  docks regular, dialogs/sheets/app shell thick).
- `elevation: embedded | raised | floating` — float height drives shadow depth.
- `tone: neutral | media` — media tone is for chrome over video: dark fill, light foreground,
  independent of the app theme.
- `interaction: static | control` — pressable glass responds with light, never movement.
- `backdropTone: auto | light | dark | media` — callers declare what sits behind the pane; no
  automatic DOM luminance analysis is claimed.

An experimental Chromium-only refraction backend (`src/shared/lib/liquid-glass.ts` +
`useLiquidGlassRefraction`) replaces blur-only scattering with SDF-derived edge displacement on
selected surfaces, behind feature detection and the "Edge refraction" appearance flag. The CSS
material stays the production backend; verify optical distortion with
`node scripts/glass-verify.mjs`.

Surface assignment (glass style):

| Surface                       | Material                | Notes                          |
| ----------------------------- | ----------------------- | ------------------------------ |
| App background                | Environment layer       | near-monochrome token wash     |
| App content shell             | thick / embedded        | via `data-glass-shell-*` hooks |
| Shell header                  | thin bar                | content scrolls underneath it  |
| Sidebar, mobile dock          | existing glass variants | token-driven                   |
| Dialogs, sheets               | thick / floating        | materialize on open            |
| Dropdowns, selects            | thin / raised           |                                |
| Player chrome                 | thin / media tone       |                                |
| Cards, tables, inputs, toasts | solid — always          | reading surfaces stay opaque   |
| Video/media content           | never processed         |                                |

Hard rules:

- Reading surfaces stay solid in both styles; glass is chrome, not content.
- No nested glass-on-glass beyond one overlay above the shell.
- Every glass surface must survive three fallbacks unchanged in meaning: no `backdrop-filter`
  support, `prefers-reduced-transparency`, and `prefers-reduced-motion`.
- The appearance "glass intensity" setting is the only blur/alpha tuning knob; per-component
  overrides are a regression.
- Component-level `design: glass | liquidGlass` variants (sidebar, mobile dock) are
  implementations of the same material family: they read the shared `--glass-*` tokens and
  `--glass-blur-base`, so intensity reaches them too. `liquidGlass` is an expressive showcase
  variant only — never a production shell.
- Inside a glass pane, panels must tint with translucent washes (`bg-foreground/[0.04]`,
  `bg-background/75`), never opaque `bg-muted`/`bg-card` fills that mask the material. Dense
  `bg-card` stays correct for actual reading/input rows.

## Imagery

Primary marketing imagery should show real product state. Screenshots should be captured at useful
inspection sizes, with predictable filenames under `public/marketing`.

Current approved public capture:

- `public/marketing/studio-dashboard-settings.png`

## Icons

Icons should name actions or product areas. Do not use icons only because a surface needs visual
filler.

Use consistent sizing:

- 16px for compact navigation and inline labels
- 20px for primary buttons and feature cards
- larger sizes only for intentional brand marks or illustrations

## Definition Of Visual Regressions

A change is a regression if it:

- makes the current navigation item harder to identify;
- increases reliance on hover-only state;
- adds decorative glow or blob effects to persistent shells;
- replaces real product imagery with synthetic placeholders;
- uses sample assets in production UI;
- reduces keyboard focus visibility;
- ignores reduced-motion expectations.
