# Glass and motion

Glass is a user-selectable material system with shared optical and interaction rules. A blur declaration alone does not describe the supported rendering behavior.

## Ownership and entrypoints

| System                              | Entry point                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Semantic surface                    | `src/shared/ui/glass-surface.tsx`                                                |
| Optical recipe                      | `src/shared/lib/glass-material.ts`                                               |
| Shared interaction state            | `src/shared/lib/glass-interaction.ts`                                            |
| DOM interaction scope               | `src/shared/lib/glass-interaction-scope.tsx`                                     |
| Selection lenses and backend policy | `src/components/fluid-glass/`                                                    |
| Shared scene and local normal field | `src/components/glass-scene/`                                                    |
| Modal filtering and presence        | `src/shared/lib/modal-glass.ts`, `modal-glass-fluid.ts`, `modal-glass-motion.ts` |
| Global material tokens              | `src/styles.css` and `src/shared/theme/`                                         |

These paths are relative to `client/`. `DESIGN.md` defines visual rules and semantic surface choices.

## Choose a semantic surface

Use `GlassSurface` and declare a surface role such as shell, navigation, dialog, form, sheet, menu, control, or media. Material, thickness, elevation, and tone determine the recipe; individual components should not invent blur and white-opacity values.

The default surface follows appearance preferences. Explicit solid or glass requests are deliberate overrides. Use `asChild` when composing native elements or Radix content so focus, refs, portals, and hit areas remain intact.

Media chrome uses its media tone; it must remain readable over video. Changing a color preset must not silently change the user's surface or background choices.

## Rendering and fallback policy

The resolver distinguishes solid, CSS glass without backdrop filtering, CSS approximation, native SVG refraction, controlled-source SDF rendering, and experimental transmission.

A controlled readable texture can be sampled by a scene renderer. Arbitrary live DOM is not automatically available as a WebGL texture. DOM surfaces use their supported native or CSS path; do not claim scene refraction for a CSS fallback.

Default lens activation follows appearance. Solid mode resolves to a solid body. Explicit always-on activation is for intentional independent glass surfaces or demonstrations. Reduced transparency takes priority even over that activation.

Fallback capability, source readability, renderer health, and scene ownership are separate inputs. Keep the resolved backend and reason truthful; a refused renderer is a fallback, not a successful shader comparison.

## Keep geometry separate from material

The fallback carrier owns measured position, size, radius, and visibility. Its nested material body owns fill, filter, shadows, rim, and sheen.

Measure target rectangles relative to the group's padding-box origin. Applying border offsets twice makes the selected lens drift. Layout and resize changes must trigger remeasurement.

Animate the decorative body while keeping labels, controls, and hit targets stable. Tests for geometry inspect the carrier; tests for optical style inspect the material body.

## Shared motion lifecycle

The interaction controller produces finite responses to pointer contact, press, focus, and retargeting. Adapters consume the shared snapshot through their existing frame clocks. Stop scheduling work after settling or when motion is disabled.

The scene uses a reusable 128 by 128 half-float normal patch to alter a local edge field. The reading core and semantic geometry remain stable. Dispose textures, subscriptions, observers, frame callbacks, and scope ownership when their owner unmounts.

Respect reduced motion and reduced transparency independently. Reduced motion removes travel and deformation; it does not mean the user requested an opaque theme.

## Theme and optical consistency

Material colors come from theme tokens. Avoid fixed white fills that make dark or Mono glass look washed out. Rim, internal reflection, shadow, scattering, and saturation should remain part of one recipe.

When testing CSS declarations unsupported by jsdom, inspect serialized render output. Keep opacity bounds and material relationships meaningful rather than restoring old markup to satisfy a test.

Experimental transmission is a laboratory path. Its orthographic view vector, local-space thickness, and sRGB handling must agree with scene geometry and the backdrop. Keep strict neutral and isolation views free of supporting reflections or shadows. These are renderer contracts, not reasons to bypass production capability checks.

## CanvasUI and authentication artwork

`src/components/canvas-ui/` contains canvas object, SVG model, and frame-loop utilities used by artwork. Authentication rendering lives in `src/modules/auth/rendering/`, with a dither source and shared scene adapters.

Canvas decoration is not the form's accessibility tree. Native form controls remain responsible for semantics and input. Preserve the two-part logo and keep artwork failure independent from authentication.

Retain `src/components/canvas-ui/LICENSE.md` and its required attribution. Do not remove third-party notices during comment cleanup.

## Validation

Start with unit tests under `components/fluid-glass`, `components/glass-scene`, and `shared/lib`. Preserve shader source parity between authored GLSL and runtime templates. Browser optical tests require actual browser execution; unit tests do not prove visual refraction quality.

See [Testing and troubleshooting](testing.md) for the validation boundary and [Appearance preferences](appearance.md) for saved motion settings.
