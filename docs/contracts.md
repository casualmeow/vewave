# API and realtime contracts

OpenAPI is the source of truth for REST clients. Room synchronization has an explicit event contract shared by the API and browser.

## REST generation

Edit route schemas in the owning server module. Start the API with the updated code, then run from `client/`:

```bash
npm run api:gen
```

Orval writes `src/core/api/generated/`. Never patch these generated files to compensate for a schema mismatch. Shared Axios behavior belongs in `src/core/api/http/`.

## Session transport

REST requests authenticate with `Authorization: Bearer <accessToken>`. Refresh tokens stay in the backend HTTP-only cookie. The client transport uses `withCredentials: true` so refresh requests can include it.

CORS permits an exact list of client origins. Local HTTP development uses non-secure cookies; production requires HTTPS and secure refresh cookies.

Keep session-refresh coordination in the shared HTTP layer. Feature queries must not implement independent refresh loops.

## Realtime ownership

The server schema lives in `server/src/modules/realtime/realtime.schemas.ts`; browser adapters live under `client/src/modules/watch-together/room/realtime/`.

The gateway maintains canonical room events and enforces permissions. Browser media controls consume snapshots and updates while provider players handle actual media playback.

The API synchronizes state only. It does not proxy, download, transcode, or re-stream provider media.

## Changing an event

Update both sides of the event envelope together, including validation, event handling, and contract tests. Cover successful commands, permission rejection, and the snapshot seen by a late joiner when those behaviors change.

Use the server realtime integration tests and focused client room tests. Do not rely on a client-side permission check as the only authorization boundary.

## Errors and compatibility

Services use shared `AppError` codes; route schemas document response shapes. Preserve the error envelope so transport and feature error states remain predictable.

Account configuration can contain unrelated keys. Appearance updates must preserve those keys rather than replacing the entire object. See [Appearance preferences](appearance.md).

The `roomGuide` configuration key is server-managed: ordinary profile writes cannot overwrite it. Save its outcome through `PATCH /api/profile/me/room-guide`, which updates that key atomically. New accounts receive pending eligibility; existing accounts without the key remain manual-only. See [Room creation and first-room guidance](room-creation.md).
