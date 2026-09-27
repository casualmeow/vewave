# Appearance preferences

Appearance belongs to the account when signed in. The provider resolves theme tokens immediately while the account save flow persists preferences.

## Contract and resolution

`client/src/shared/theme/contract.ts` defines appearance modes, preset IDs, surface style, glass intensity, motion, and background settings. Presets supply semantic tokens; the resolver applies the selected mode and supported overrides.

The provider applies root theme attributes and CSS variables. Components consume these tokens through shared material recipes instead of maintaining private light and dark color systems.

Persistence sanitizes unknown or invalid input. Background brightness and speed are bounded, colors are normalized, and unrelated account configuration keys are preserved.

## Account saves

`useAccountAppearanceSave` in `src/modules/appearance/` observes Settings changes and queues ordered writes through the generated profile API.

The save owner is captured per account. Closing Settings flushes its final change. Switching accounts cancels queued work and aborts an in-flight request owned by the previous user. Successful saves update the auth store and invalidate the profile query.

Failures expose an error state and retry action. Do not remove this feedback or let a failed background save appear permanently successful.

The Theme Studio color editor has a separate explicit draft flow. Keep its apply/save behavior distinct from Settings autosave.

## Settings organization

Feature sections live under `src/modules/settings/`; dialog navigation and filtering live under `src/components/settings-dialog/`. Appearance, glass, and background controls should remain grouped by what the user wants to change.

Adding a preference requires a contract value, defaults, sanitization, token or renderer consumption, UI control, and persistence coverage. Avoid storing the same preference independently in a component.

## Named looks and backgrounds

Mono uses the saved preset ID `noir`; Pearl provides the neutral white palette. Display names and persisted identifiers have different compatibility responsibilities.

White Glass selects Pearl, Light, and Glass together. It disables custom overrides without deleting them and preserves background, intensity, motion, and logo preferences.

Background settings contain the selected procedural pattern, palette, custom colors, brightness, animation state, and speed. Preserve them across theme changes. A background is a scene source, not a reason to animate an otherwise reduced-motion interface.

## Validation

Use the appearance save-queue, account-isolation, persistence, theme, and settings tests. Cover rapid changes, dialog close, account switch, failed save and retry, invalid persisted data, and preservation of unrelated configuration.

For renderer behavior, continue with [Glass and motion](glass-motion.md).
