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
