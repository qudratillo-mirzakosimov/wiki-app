# Personal API keys

Written for this fork (AGPL-3.0). No Enterprise code is used or copied; core already ships the
`api_keys` table and signs the `api_key` JWT, and this module supplies the missing validation
and the endpoints.

## What it does

A workspace member can mint personal API keys. A request authenticated by a key acts as that
member, so pages written through an MCP connector or script show the real author instead of a
shared service account.

## The switch

`API_KEYS_ENABLED=true` (after trimming) is the only "on" value. `1`, `yes`, `TRUE` and unset all
mean off (`api-key.policy.ts`).

- Off: the controller is not registered, so every `/api/api-keys*` path is a plain 404, and any
  key token is rejected with 401 by `ApiKeyService.validateApiKey`.
- On: the controller is registered and `window.CONFIG.API_KEYS_ENABLED` is `true` for the client.

The controller list is fixed at boot, so changing the switch needs a restart.

## Endpoints

All are `POST`, behind `JwtAuthGuard`, and answer 200.

| Path | Body | Result |
|---|---|---|
| `/api/api-keys` | none | `{ items: ApiKeyView[] }`, the caller's own live keys |
| `/api/api-keys/create` | `{ name, expiresIn? }` | `ApiKeyView & { token }` |
| `/api/api-keys/revoke` | `{ apiKeyId }` | `{ success: true }` |
| `/api/api-keys/workspace` | none | `{ items: (ApiKeyView & { creator })[] }`, admin/owner only |

`ApiKeyView = { id, name, createdAt, lastUsedAt, expiresAt }`; `creator = { id, name, email }`.

Rules:

- `name` is trimmed, 1 to 100 characters.
- `expiresIn` is `30d`, `90d`, `1y` (default) or `never`.
- The token is returned once, by `create`. It is not stored and not logged, and no list ever
  includes it. A lost token means revoking the key and minting another.
- Revoke is allowed for the key's creator, or a workspace `admin`/`owner` for any key in the
  workspace; anyone else gets 403. An unknown id, an already revoked key, or a key in another
  workspace is 404.
- Every endpoint answers 403 when the request itself was authenticated by a key
  (`req.raw.apiKeyId`, set by `JwtStrategy`), so a leaked key cannot mint or revoke keys.
- `POST /api/auth/collab-token` is refused (403) for a key-authenticated request
  (`refuseApiKeyAuth`, `refuse-api-key-auth.ts`, called from `auth.controller.ts`). The
  collaboration JWT it mints lives 24h and Hocuspocus never re-checks the `api_keys` row, so a
  key allowed to mint one would keep editing for a day after revocation. Nothing a key can mint
  may outlive the key. `collab-token.guard.spec.ts` guards the call.

## How a key is checked

The JWT is only a pointer to an `api_keys` row. `JwtStrategy` verifies the signature, then
`ApiKeyService.validateApiKey` loads the row and rejects it (bare 401) when it is missing,
revoked, expired, or when its creator or workspace do not match the signed claims, or when the
creator is deactivated or deleted. `last_used_at` is updated at most every five minutes.

## Expiry lives in the row only

Key tokens are minted with no `exp` claim; `api_keys.expires_at` is the single expiry.
`TokenService.generateApiToken` signs with a dedicated `JwtService` for this reason: the shared
one inherits `JWT_TOKEN_EXPIRES_IN` (90 days by default) and `@nestjs/jwt` offers no per-call way
to drop it, which would silently end `1y` and `never` keys at 90 days. `api-key.token.spec.ts`
guards this.

## Files

- `api-key.policy.ts`: the switch.
- `api-key.repo.ts`: queries on `api_keys`.
- `api-key.service.ts`: validation, create, list, revoke.
- `api-key.controller.ts`, `dto/api-key.dto.ts`: the endpoints.
- `refuse-api-key-auth.ts`: 403 helper for core routes that must not accept a key.
- `api-key.module.ts`: wiring, imported by `AuthModule` (which `CoreModule` imports, so the
  controller is registered once).

Tests: `pnpm --filter server exec jest src/oss/api-key`.
