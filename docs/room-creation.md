# Room creation and first-room guidance

The creation feature owns the draft, link validation, and successful handoff to the room. The room feature owns playback, personal viewing preferences, and its introduction. Route files only mount these features.

## Creation workspace

`src/modules/watch-together/create-room/` contains the full-page workspace and the compact form used by the New menu. Both use `useCreateRoom` for creation and navigation, and `createVideoQueue` for media parsing.

The queue accepts up to 20 unique HTTP(S) links. Entries have stable identities and loading, ready, or error states. Editing assigns a new identity so a late metadata response cannot replace the edited item. Successful metadata requests are cached within the draft; failures can be retried. Selection changes the preview only. Queue order determines the initial video and playlist order sent to the API.

The preview does not create a room, load a video player, or start realtime connections. YouTube currently has an embedded player; Vimeo and TikTok links remain accepted but need an external site for playback. Keep both the preview and public README honest about this distinction.

Viewing layout is a local draft initialized from the existing account-scoped browser preferences. Apply it only after the room is created. Creation responses are retained across navigation failures, so retrying Open your room cannot create another room. Changes of account clear the draft and prevent stale responses from navigating or saving preferences for another user.

## First-room guide

New password, OAuth, and passkey accounts receive `appConfig.roomGuide = { version: 1, status: 'pending' }` at registration. Missing or unrecognized records mean manual-only guidance; do not infer eligibility from empty room history, local storage, or account age.

After successful creation, the client holds an account-and-room-specific handoff in memory. Once the room snapshot is ready, it refreshes the current profile and opens the guide only if the server still reports pending. Direct joins do not start it. Help and Room guide allow manual replay in both room layouts.

The three steps explain playback, invitations, and queue/chat. They never send playback commands. During the guide, controls stay visible and the panel can be temporarily revealed without saving that view change. Guide popovers are non-modal dialogs, not interactive tooltips. Escape and Skip dismiss; Done completes. Both stop automatic introductions.

## Account persistence

`PATCH /api/profile/me/room-guide` accepts `{ status: 'completed' | 'dismissed' }` and returns `{ roomGuide: { version: 1, status } }`. It requires the normal bearer session. The record remains private inside the authenticated account configuration; public profiles do not expose it.

The repository changes only the `roomGuide` JSONB key. Ordinary profile configuration writes preserve the stored guide key atomically, ignoring any incoming copy of it. This prevents stale appearance saves from resetting guide progress, without changing how other configuration keys are saved. No database migration is needed. Ship the endpoint before the client consumes it and regenerate the client from OpenAPI.

Failed guide saves retain an account-scoped local pending outcome and offer Retry. Visiting a room retries that write without reopening the introduction. Abort requests on account change and check ownership again before updating the auth store. The room stays usable while progress is unsynced.

## Focused verification

Queue tests cover order, duplicates, limits, stale parsing, and retries. Creation tests cover duplicate submission, account switches, and navigation failure after success. Guide tests cover eligibility, account sync, manual replay, keyboard dismissal, and preservation of appearance configuration. Validate responsive composition in mobile, desktop, and ultrawide layouts, with solid/glass and reduced motion.
