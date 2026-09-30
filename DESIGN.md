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

`Mono` (saved ID `noir`) is the neutral preset: paper in Light; a `#000000` canvas in Dark with graphite
cards, soft white text, and silver actions. Error, warning, and success remain semantic colors.
The solid shell uses the black canvas rather than the card token, so reading panels keep their
own elevation. Glass continues to respect the user's material, motion, and background choices;
its theme palette stays neutral down to the shader's black endpoint. Custom backgrounds remain
custom. Select Dark and Solid, or Glass with Background set to None, for a plain black backdrop.
The preset is available in Settings and Theme Studio and uses the same account persistence as
the other presets. Changing it does not change the user's mode or reset custom overrides.

`Pearl` supplies cool white surfaces with graphite text in Light and neutral dark equivalents.
The **White Glass** action in Settings → Appearance → Glass selects Pearl, Light, and Glass together and disables custom
theme overrides without deleting them. Background, intensity, motion, and logo preferences stay
intact. Settings saves this action through the account appearance flow. The color studio keeps
the ordinary Pearl color preset, which only changes the palette.

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

Glass is a user-selectable surface style (`Appearance → Glass → Surface style: Solid | Glass`), not a
default decoration. The optical recipe lives in `src/shared/lib/glass-material.ts`; `src/styles.css`,
the DOM refraction adapters, and the shared Three scene consume it through `GlassSurface`
and `GlassSceneHost`. Use `asChild` for native
elements and Radix content so refs, focus, portals, and hit areas remain intact.
Never hand-tune blur values on a component; declare what the surface is:

- `surface: auto | solid | glass` — whether the pane is material at all: `auto` (default)
  resolves from the user's `surfaceStyle`; `glass`/`solid` force one. Resolution is CSS-level
  via `data-surface-style`, so flipping the setting restyles every auto surface at once.
- `role: shell | header | navigation | dialog | form | sheet | menu | control | media` — the semantic recipe: the
  conventional token the pane falls back to when solid (shell → card, header → header, navigation → sidebar, dialog/sheet/menu →
  popover, control → control fill, media → media chrome) plus role adjustments (the shell's native
  fallback skips DOM filtering; a scene host supplies its outer optical pane).
- `material: glass | liquidGlass` — both use clear scattering and supported edge displacement;
  `liquidGlass` adds a pointer-aware rim and press response and is selected automatically for
  glass surfaces. Small controls on chrome use `.glass-control`,
  which resolves through `--glass-control-*` tokens — never local alpha fills.
- `thickness: thin | regular | thick` — pane size drives scattering (menus are thin, bars and
  docks regular, dialogs/sheets/app shell thick).
- `elevation: embedded | raised | floating` — float height drives shadow depth.
- `tone: neutral | media` — media tone is for chrome over video: dark fill, light foreground,
  independent of the app theme.
- `interaction: static | control` — pressable glass responds with light; Fluid may compress its decorative layer by 1.5%. Labels and hit areas remain stationary.
- `motion: auto | off | subtle | fluid` — resolves through the saved motion policy and device/input constraints; it does not change the material or hit rectangle.
- `presence: none | dialog | popover | sheet` — declares the overlay entrance/exit family. Page frames use `none`; popovers use their Radix transform origin.
- `backdropTone: auto | light | dark | media` — callers declare what sits behind the pane; no
  automatic DOM luminance analysis is claimed.

`backdropSource="dom"` is the default: supported Chromium browsers refract the live backdrop
through measured SVG maps; other browsers keep CSS scattering and directional reflections.
`backdropSource="scene"` is reserved for outer panes over an explicitly owned background.
Inside `GlassSceneHost`, those panes register their measured geometry with one Three renderer
and share its transmission texture, neutral environment, IOR, roughness, and attenuation.
Native refraction disables only after the scene has painted that pane; missing hosts, failed
WebGL, reduced transparency, and forced fallback retain the native/opaque path. Never process
the same pane through both adapters. HTML text, focus rings, and controls stay outside all optics.

Intensity supplies one recipe to both adapters:

| Intensity | Center blur | Edge blur | Bevel | Maximum edge refraction | Maximum body refraction |
| --------- | ----------- | --------- | ----- | ----------------------- | ----------------------- |
| Subtle    | 2px         | 0.5px     | 18px  | 6px                     | 2px                     |
| Balanced  | 4px         | 0.75px    | 24px  | 10px                    | 3.5px                   |
| Strong    | 6px         | 1px       | 30px  | 14px                    | 5px                     |

Glass uses IOR 1.5, a neutral white reflection, role-derived tint, and limited dispersion.
Optical tint is only 6-12%; reading regions receive a separate theme-colored veil. Its opacity
is computed against both black and white backdrops for foreground and adjusted helper text,
with minimums of 72% in Light and 78% in Dark. This preserves a clear material without allowing
backgrounds to obscure controls. Mono keeps its neutral palette; white reflections never become
a white wash across the dark body. Role, thickness, and elevation select the shared recipe;
components must not add their own optical colors or blur numbers.

Dialog/form DOM adapters use the same material with a fourth-power convex profile and a
continuous transition into the reading veil. Their cached geometry maps and bounded Canvas2D
height/velocity field retain live backdrop refraction without capturing HTML or opening a modal
WebGL context. The field uses at most 8,192 pixels and 30 updates per second while disturbed,
then clears and stops. It is a damped height-field approximation, not a full fluid solver.
Regular dialogs use 20px corners; Settings uses 24px. Native modals have no generic border,
radial glow, or inset outline. Solid and reduced-transparency modes retain opaque reading surfaces.
DOM geometry maps are capped at 750,000 pixels per texture. Dialogs cache up to eight geometry
sets within a two-million-pixel geometry budget; each set supplies displacement, mask, and height
maps. The edge-only adapter has a separate two-million-pixel cache of up to 32 displacement maps.

Surface assignment (glass style):

| Surface                       | Material            | Notes                         |
| ----------------------------- | ------------------- | ----------------------------- |
| App / Studio background       | Shared scene source | one canvas per active layout  |
| App / Studio content shell    | thick / embedded    | shared scene transmission     |
| Shell header                  | thin bar            | content scrolls underneath it |
| Sidebar, mobile dock          | navigation recipe   | scene outer pane; DOM lens    |
| Dialogs                       | modal / floating    | fluid body, convex perimeter  |
| Sheets                        | thick / floating    | clear materialize on open     |
| Dropdowns, selects            | thin / raised       |                               |
| Page action / form frames     | form / embedded     | readable veil; native content |
| Room drawers and invite menu  | sheet / menu        | same overlay material family  |
| Player chrome                 | thin / media tone   | explicit room preferences     |
| Settings segmented controls   | one selection lens  | fixed native button targets   |
| Cards, tables, inputs, toasts | stable reading fill | no global Card restyling      |
| Video/media content           | never processed     |                               |

`AppBackdrop` wraps App and Studio content in the shared host; it does not open a second production
background renderer. Background None still supplies a flat theme source for optical panes.
Solid, reduced transparency, and forced fallback disable the host while keeping its children.
The separate settings preview retains its small rendering budget. Production scenes use at most
two million output pixels and 30 active frames per second, with a shared transmission target at
75% resolution per dimension. Video remains outside the sampled source.

Hard rules:

- Scrims and drop shadows use neutral black independently of text color. Scrim opacity is 20% in light mode and 36% in dark mode, with no blur. White is reserved for a restrained rim or inset highlight.
- Text, inputs, tables, and media remain stable. Page-level action and form frames may use the contrast-derived reading veil; nested data cards do not receive another optical layer.
- No nested glass-on-glass beyond one overlay above the shell.
- Every glass surface must survive three fallbacks unchanged in meaning: no `backdrop-filter`
  support, `prefers-reduced-transparency`, and `prefers-reduced-motion`.
- The appearance "glass intensity" setting is the only blur/alpha tuning knob; per-component
  overrides are a regression. The existing room overlay opacity/blur/outline controls are an
  explicit user preference: their CSS media material retains those values while Solid and
  reduced-transparency fallbacks keep authority over the actual fill and filtering.
- Component-level `design: glass | liquidGlass` variants (sidebar, mobile dock) are
  implementations of the same material family: they read the shared `--glass-*` tokens and
  `--glass-blur-base`, so intensity reaches them too. `liquidGlass` is an expressive showcase
  variant only — never a production shell.
- Inside a glass pane, panels must tint with translucent washes (`bg-foreground/[0.04]`,
  `bg-background/75`), never opaque `bg-muted`/`bg-card` fills that mask the material. Dense
  `bg-card` stays correct for actual reading/input rows.

### Authentication Composition

Sign-in and sign-up share `AuthPageLayout`: one responsive composition over stationary tonal dither,
with a crisp two-color W/V SVG and native HTML controls above the artwork. The material tapers into
the scene without a closed CSS outline, elevated shadow, separate logo lens, or nested form card.
Keep Back to home beside the composition and omit detached wordmarks and appearance controls.

The auth renderer is an adapter to the same shared scene used by outer app panes. Its source
shader draws dither and the opaque Solid print; the shared physical material owns all glass optics.
Do not restore the former independent analytical glass pass. A native reading veil blends into
the form region over 140px using the common material's contrast-derived opacity and helper text.
Solid and fallback materials keep an opaque center with tapered edges. Both pages inherit saved
theme, material, intensity, and motion without changing the account's background preference.

Keep the SVG visible independently of canvas readiness or failure. Decorative rendering is capped
at two million pixels and 30 active frames per second, and stops when settled or hidden. Within
40px of the rounded boundary, pointer movement locally compresses and ripples the dither in both
Solid and Glass. The shared response settles in 300ms (Fluid) or 180ms (Subtle), including while the pointer
rests on the edge; the quiet hover deformation remains until exit. Texture displacement fades
out before the form's content inset. Keyboard, Off, and reduced motion disable the response.
Mobile, reduced transparency, forced fallback, and WebGL failure retain static SVG dither and
opaque material behind the controls. Ultrawide layouts expand the artwork at a readable form width;
narrow layouts become a single column and short viewports scroll naturally.

### Glass Motion And Settings

`Settings → Appearance → Glass → Glass motion` persists independently of intensity: **Off** snaps. For selection lenses, **Subtle** slides for 180ms without stretching, and **Fluid** travels for 225ms with at most 5% stretch / 2% compression and settles within 300ms. Surface edges use the same preferences, with Subtle at one quarter of the Fluid response. Fluid is the default for glass; solid surfaces use Subtle. `FluidGlassGroup motion="auto"` follows this policy. Explicit profiles are for previews. Reduced motion and keyboard navigation override every profile to Off. Coarse pointers never drive pointer-following highlights.

Selection follows the committed route or tab, while hover stays local. Retarget from the displayed position; stop requesting frames when settled. Only the decorative lens moves. Production navigation uses `motion="none"` on the legacy sidebar wrapper, with the shared lens supplying selection motion. Expressive legacy presets remain confined to showcases.

All production sidebar rows, including recent rooms and servers, opt into selection only. Fine
pointer hover fades a stationary 6% foreground wash in 100ms. It never takes the shared selection
lens away from the current route. Focus stays on the HTML control; keyboard, Off, and reduced
motion remove the hover transition.

Product App, Studio, and authentication layouts share one `GlassInteractionScope`. It routes
pointer input to the nearest registered surface, including portalled overlays, so parent and
child panes do not react together. Fine pointers disturb only a 40px perimeter band. Fluid may
bend the decorative edge by at most 3px and settles within 300ms; Subtle gives a quieter response
and settles within 180ms. Touch uses bounded contact feedback rather than hover tracking.
Keyboard navigation, editing fields, Off, and reduced motion suppress material movement.
Scrolling, hidden tabs, cancelled pointers, and loss of window focus reset the response.

Dialog, popover, and sheet presence is declared independently from optical material. Text and
hit rectangles stay fixed; only decorative layers respond to pointer pressure. Resting surfaces
do not request frames. Scrims remain unblurred. A CSS-only room media surface preserves saved
overlay opacity, blur, outline, and radius without adding another renderer or processing video.

Manual material acceptance covers Light/Pearl and Dark/Noir with Off, Subtle, Fluid, and Solid:
open Settings and a nested select, switch segments rapidly, approach the rounded modal edges,
and press/release with mouse or touch. Check `/create`, projects, server details, room controls,
sign-in and sign-up at 390px, 1440px and 2560×1080. Foreground text, focus and hit targets must
remain stable over flat, patterned and high-contrast backgrounds. Repeat with reduced motion,
reduced transparency and forced CSS fallback; check that an open overlay leaves underlying
panes still and that room media preferences survive. These are manual review scenarios, not a
claim that browser rendering has been verified.

App and Studio compose `SettingsDialogContent` inside one Radix Dialog root. Desktop uses a 13rem rail in a dialog capped at 58rem wide and `min(80dvh,42rem)` high, with 1rem viewport gutters. Mobile uses a horizontally scrolling tab rail. Content scrolls independently. Tabs have at least 40px targets (44px on coarse pointers), arrow-key navigation, and visible focus. Shared Appearance and Account sections live under `modules/settings`; Appearance contains Colors, Glass, and Background tabs; Studio links its existing channel settings page. Search matches setting labels and keywords across sections and inner tabs, opens the result, and focuses its control. Escape clears search before closing Settings. Inner tab selection survives navigation. One footer owns appearance saving and stays mounted through navigation and search only while the dialog is open. Navigation and each segmented track own one selected lens. Segments retain native buttons and `aria-pressed`; hover never changes the selection, keyboard changes snap, and Solid/reduced transparency retain a visible opaque selection. Background remains configurable in Solid mode with an explicit Use Glass action.

Product coverage starts with `/create`, Rooms, server details, Studio's existing editor/chrome,
authentication, and Settings. Use shared form frames for primary actions, remove duplicate outer
boxes, and use media roles for room-card labels. Preserve opaque thumbnails, video, fields, and
dense data. Landing, Community, and admin/docs styling are separate work; do not invent missing
Studio screens to demonstrate the material.

### Glass Backgrounds

`AppBackdrop` mounts once in App or Studio. Glass defaults to still Ribbons with theme colors at
28% brightness; None, Silk, and Contours are alternatives. Saved choices remain intact. The shaders
use domain-warped noise, broad folds, and matte relief; theme colors stay in one hue family rather
than borrowing contrasting chart colors. Animation is opt-in, with slow drift and constant exposure.
Settings and the appearance editor expose Theme/Custom palette, two colors, brightness, speed,
and Animated/Still. Four named scene buttons replace simulated thumbnails; selecting None unmounts
the preview and hides scene controls. One `BackdropPreview` canvas shares the scene renderer at a
100,000-pixel budget. Controls remain accessible HTML. Palette endpoints are constrained
against theme text colors; shaders use convex interpolation without additive white glow. Dense
reading surfaces keep their tint.

Appearance is scoped by account in local storage and restored from that account's `appConfig` on
sign-in. An empty account starts from its own cache or defaults, never the guest or previous account.
Settings automatically saves theme and background together through the existing profile endpoint,
coalescing edits for 600ms and serializing requests. Closing flushes the final edit; changing accounts
discards pending edits and aborts the old request. Failures keep the current local choice and expose
Retry. Guests retain a separate device preference. The dedicated color editor keeps its explicit
draft/save flow. Missing fields migrate additively. Solid mode retains the background choice but
unmounts the renderer.
The Three.js renderer loads lazily, caps rendering at 30fps, DPR at 1.5, and the scene buffer at 800,000
pixels. Hidden tabs stop requesting frames; reduced motion, Still, and room routes render a static
frame. Background motion is independent of glass motion. Unmount releases the context and resources;
initialization, shader, or context failures leave a matching static CSS scene. DOM capture and
per-control WebGL contexts are not part of this system.

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
