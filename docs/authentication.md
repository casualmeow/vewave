# Authentication

Sign-in and registration share page composition and artwork, while native forms own validation, submission, and accessible input.

## Page composition

Thin routes under `client/src/routes/(auth)/` delegate to pages in `src/modules/auth/components/`. `auth-page-layout.tsx` owns the shared layout, and the sign-in and sign-up pages supply their respective forms.

Keep navigation back to the product visible. Preserve responsive form placement and the user's existing appearance; authentication should not acquire an independent theme switcher.

## Forms and providers

The login and registration forms use their module schemas, React Hook Form, and generated auth clients. Preserve labels, autocomplete, password visibility controls, validation errors, pending states, and keyboard submission.

OAuth buttons and callback handling belong to the auth module. Passkey flows use the existing browser and server verification contract. Do not create a second token-storage or redirect system inside page components.

## Bootstrap and protected routes

The auth store tracks bootstrapping, anonymous, and authenticated state. The shared refresh mechanism obtains an access token from the HTTP-only refresh cookie; the current-user request establishes the authenticated user.

`requireAuthRoute` resolves the session before allowing protected content and redirects anonymous users to sign-in with the intended destination. `requireAdminRoute` adds the administrator check.

The documentation route inherits this admin guard. Adding a handbook page must not bypass it or create a public duplicate unintentionally.

## Artwork boundaries

`sign-in-artwork.tsx` and `src/modules/auth/rendering/` own the decorative scene and dither source. CanvasUI utilities support object and SVG handling; the form remains native DOM.

Use the same appearance and motion preferences as the application. Release rendering resources and callbacks on unmount. An unsupported or failed renderer must not prevent account access.

See [Glass and motion](glass-motion.md) for material ownership and reduced-motion behavior.

## Making changes safely

Test validation failures, successful submission, pending controls, provider and passkey actions, route guards, and sign-in/sign-up parity when those areas change. Artwork tests cover lifecycle and fallback contracts separately from authentication behavior.

Session transport and cookies are documented in [API and realtime contracts](contracts.md).
