# Social sign-in (Google / Facebook / GitHub / Microsoft)

The desktop app and website can sign in with social providers via the Worker's OAuth
routes (`src/oauth.js` + `/v1/auth/oauth/*` in `src/index.js`). A provider only appears
in the app's sign-in UI once **both** its client id and secret are set as Worker secrets
— so nothing breaks before you register the apps.

## How the desktop flow works

1. App opens `…/v1/auth/oauth/<provider>/start?cb=http://127.0.0.1:<port>/cb&nonce=…`
   in the **system browser** and listens on that loopback port.
2. Worker redirects the browser to the provider with a signed `state`.
3. Provider redirects back to the Worker callback (a single, stable HTTPS URL).
4. Worker exchanges the code, resolves the account **email**, upserts the user, issues a
   30-day `ses_…` session, and 302s to the app's loopback `cb` with `?token=…&nonce=…`.
5. App verifies the nonce, stores the token, and hydrates the account via `/v1/auth/session`.

The provider never sees the loopback URL — only the stable callback below — so the same
registration works for every user.

## Redirect URI to register with each provider

Base = your Worker origin (currently `https://attentify-cloud.ludomi2502.workers.dev`).

| Provider  | Authorized redirect URI |
|-----------|-------------------------|
| Google    | `<base>/v1/auth/oauth/google/callback` |
| Facebook  | `<base>/v1/auth/oauth/facebook/callback` |
| GitHub    | `<base>/v1/auth/oauth/github/callback` |
| Microsoft | `<base>/v1/auth/oauth/microsoft/callback` |

## Where to create the apps

- **Google** — Google Cloud Console → APIs & Services → Credentials → *OAuth client ID*
  (type: **Web application**). Add the redirect URI above. Scopes used: `openid email profile`.
- **Facebook** — developers.facebook.com → your App → *Facebook Login* → Settings →
  Valid OAuth Redirect URIs. Scopes: `email public_profile`. The app must be in **Live**
  mode (or the tester added) and request the `email` permission.
- **GitHub** — GitHub → Settings → Developer settings → *OAuth Apps* → New. Set the
  Authorization callback URL above. Scopes: `read:user user:email`.
- **Microsoft** — Entra ID → App registrations → New. Add a **Web** redirect URI above,
  create a client secret. Scopes: `openid email profile`. Use the `common` tenant (already
  wired) for personal + work accounts.

## Worker secrets to set

```sh
cd backend
# only set the providers you want; each needs BOTH values to become active
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put FACEBOOK_CLIENT_ID
npx wrangler secret put FACEBOOK_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put MICROSOFT_CLIENT_ID
npx wrangler secret put MICROSOFT_CLIENT_SECRET
# recommended: a stable random secret for signing the OAuth state (else ADMIN_TOKEN is used)
npx wrangler secret put AUTH_STATE_SECRET
```

Then `npx wrangler deploy`. Check it's live: `GET /v1/auth/providers` should list the
providers you configured. The desktop app reads that same endpoint and shows a
"Continue with …" button for each.

## Notes

- Accounts are keyed by **email**: signing in with Google and later with email+password on
  the same address resolves to one user. New social users start on the `free` tier.
- If a provider returns no email (e.g. a Facebook account with no verified email), the app
  shows a clear error and no account is created.
- `state` is an HMAC-signed, 10-minute token bound to the loopback `cb` + `nonce`; a
  tampered/expired state is rejected with a branded close page instead of a redirect.
