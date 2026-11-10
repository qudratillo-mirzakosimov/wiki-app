# Google sign-in (Bolder fork)

"Continue with Google" on the login page. Original code for this fork; it does not use
Docmost's Enterprise SSO or its `auth_providers` table.

## Rules

- **Members only.** Google proves who someone is; it does not create accounts. The person
  must already be an active workspace member (invited, invitation accepted). Anyone else
  lands back on `/login` with "This Google account has no access here".
- **Company accounts only.** Both the email domain and Google's `hd` claim must be in
  `GOOGLE_ALLOWED_DOMAINS`. `hd` exists only for Google Workspace accounts, so a personal
  Google account registered on a work address is refused.
- **Password login stays.** The gateway service accounts sign in with a password.
- Deactivated or deleted users are refused, the same as password login.
- Throttled with password login (10 requests/min/IP).

## Configuration (per instance, runtime)

| Variable | Example |
|---|---|
| `GOOGLE_CLIENT_ID` | `1234-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud, keep in the env file only |
| `GOOGLE_ALLOWED_DOMAINS` | `bolderapps.com` (comma-separated) |

All three must be set or the feature is off: no button, `/api/auth/google` returns 404.
An empty domain list never means "any account".

`APP_URL` must be the public URL, because the redirect URI is built from it:
`<APP_URL>/api/auth/google/callback`.

## Google Cloud setup (once per instance)

1. Google Cloud console → **APIs & Services → OAuth consent screen**. User type
   **Internal** (only accounts in the Bolder Google Workspace can even see it).
2. **Credentials → Create credentials → OAuth client ID**, type **Web application**.
3. Authorised redirect URI, exactly: `https://<domain>/api/auth/google/callback`
   (for local testing also `http://localhost:3000/api/auth/google/callback`).
4. Put the client ID and secret into the instance's env file and recreate the container.

## Flow

1. `GET /api/auth/google` creates state, nonce and a PKCE verifier, stores them in a
   10-minute cookie signed with `APP_SECRET`, and redirects to Google.
2. `GET /api/auth/google/callback` checks the cookie, exchanges the code with
   `openid-client` (which validates the ID token signature, issuer, audience, expiry,
   nonce, state and PKCE), applies the rules above and sets the normal `authToken` cookie.
   Any failure redirects to `/login?google_error=<reason>`.

The callback URL is redacted in request logs because it carries the one-time code.
