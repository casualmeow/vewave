# Client maintenance notes

These notes preserve the useful implementation constraints previously scattered through source comments. Paths in this guide are relative to `client/`.

## Application startup

`src/main.tsx` creates the TanStack router and Query client, registers the router type, and mounts the application into an empty `#app` element. The provider order is StrictMode, appearance, Query, authentication bootstrap, then routing.

The router preloads on intent, restores scroll, and treats preloaded data as immediately stale. Query requests retry once and do not refetch automatically on window focus. Change these policies at their shared owners rather than patching individual pages to compensate.

`src/reportWebVitals.ts` accepts an optional metrics callback. The current startup call supplies none; it does not forward measurements to an analytics service.

## Header and resizable cards

The header's interactive glass options enable pointer shine, tilt, and refraction using shared presets. Its optional scroll container chooses the source for collapse and hide-on-scroll behavior; omitting it uses document scrolling.

ResizableCard separates the animation catalog in `animations/presets.ts` from construction helpers and shared transition pieces in `animations/preset-builder.ts`. Keep preset data out of lifecycle hooks.

Its presentation, tone, size, motion strategy, and internal-part overrides have separate responsibilities. Presentation defines compact/expanded structure; tone controls appearance; size affects geometry and corners; motion controls the transition. Keep the [component reference](/admin/docs/ui/components/resizable-card) synchronized with these public props.

During pointer resizing, the hook temporarily disables body text selection and attaches move, up, and cancel listeners. Cleanup restores the previous selection behavior and removes listeners. Pointer capture and release can throw after the pointer is already released, so their empty catch blocks are deliberate. Do not turn these races into user-visible errors.

## File input and preview ownership

`src/modules/thumbnail/hooks/useFileUpload/` owns file state, validation, drag/drop handlers, and input props. It supports newly selected browser `File` objects and initial metadata records.

| Option          | Meaning                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `multiple`      | Defaults to false; controls whether the selection holds multiple files |
| `maxFiles`      | Defaults to Infinity; applies when multiple selection is enabled       |
| `maxSize`       | Maximum size in bytes; defaults to Infinity                            |
| `accept`        | Comma-separated type/extension filters; defaults to `*`                |
| `initialFiles`  | Existing file metadata used to initialize the selection                |
| `onFilesChange` | Receives the full next selection                                       |
| `onFilesAdded`  | Receives only newly accepted files                                     |

Browser-created preview URLs require cleanup. Preserve the helper that revokes object URLs when removing or clearing files. Existing metadata URLs have a different owner and must not be treated as newly created blob URLs.

## Changelog parsing

`scripts/changelog-plugin.ts` provides the virtual changelog module from the repository's Markdown and Git history. The page parser in `src/modules/changelog/changelog-page.tsx` handles Release Please output; it is not a general Markdown parser.

It recognizes a linked H2 version, an optional parenthesized date, H3 section names, and `*` or `-` list entries. Entries can include a bold scope, a commit link, and issue references. Section names select accent styles, including features, fixes, and breaking changes.

`extractEntryMeta` retains the commit URL and seven-character hash separately from the displayed subject. It removes commit-link groups and trailing issue references, then reduces remaining Markdown links to their labels. Preserve the linked version and commit formats when changing release generation.

## Profiles and browser storage

The shared forum author renderer links a display name only when a username is available. Deleted or anonymous authors remain plain text; do not construct a profile URL from a missing username.

Saved rooms are local summaries sorted by the last-opened time. Their storage key is scoped to the account. Browser storage may be unavailable or throw in restricted contexts; the write path deliberately tolerates that failure. A failed local write must not interrupt room playback or imply a successful remote save.

## Laboratory effects

Lens-spike scenarios keep publishing callbacks in stable refs through `useLatestRef`. This lets asynchronous measurements use current callbacks without restarting a scenario on each render. Preserve cancellation and cleanup when changing effect dependencies.

Measured completion, unsupported capability, and a manual preview are distinct states. Do not turn a missing result into a successful measurement just to simplify a test. See [Glass and motion](glass-motion.md) and [Testing and troubleshooting](testing.md).

## Generated source policy

REST documentation stays in the backend schemas and OpenAPI served at `/openapi`; generated TypeScript is a consumer of that contract. Orval disables headers and schema JSDoc, then invokes `scripts/source-comments.mjs` after writing files to remove remaining generated prose.

The route generator and Vite's generated-source plugin apply the same cleanup to `src/routeTree.gen.ts`. The router's watcher ignores this output file so cleanup cannot trigger a regeneration loop; route-source changes still reach the generator. Keep generator changes in these hooks rather than hand-editing output. Type-check the resulting route tree along with the application.

The cleanup parses TypeScript syntax so URLs, regular expressions, and text containing comment-like characters remain intact. Required third-party notices are preserved. Markdown documentation and standalone license files are not source comments and remain in place.
