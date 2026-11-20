# `oss/` — Bolder fork additions

## `ee-shim/`

Upstream Docmost keeps its Enterprise features in `src/ee/`, licensed under the
Docmost Enterprise License (production use requires a paid subscription). This fork
deletes that directory entirely, so the shipped bundle contains no Enterprise code.

Core files still `import ... from "@/ee/..."`. Rather than edit ~40 core files (and
fight every upstream merge), `vite.config.ts` and `tsconfig.json` alias `@/ee/*` to
`src/oss/ee-shim/*`. Every file here is original code written for this fork under
AGPL-3.0, exposing only the names core imports:

- feature flags always report "not licensed" (`useHasFeature` → `false`);
- routed Enterprise pages redirect to `/home`;
- Enterprise widgets render nothing; mutations are inert.

Two exceptions do real work:

- `page-permission/index.ts` maps `PageShareModal` to the core
  `features/share/components/share-modal.tsx`. Upstream moved the Community
  "Share → Publish to web" button inside the Enterprise modal (commit `59e94556`) but
  left the original core modal in the tree, unused.
- `api-key/` re-exports the personal API key screens and `getApiKeys` from
  `oss/api-key/` (own code, backed by `apps/server/src/oss/api-key/`). The pages and
  sidebar entries only appear when the server runs with `API_KEYS_ENABLED=true`.

**Never copy code from upstream `src/ee/` into this directory.** Write it fresh.

### When merging upstream

1. Delete `apps/client/src/ee`, `packages/ee`, `apps/server/src/ee` and `.gitmodules` again.
2. `pnpm --filter client exec tsc --noEmit` — a missing shim shows up as TS2307.
3. Grep core for relative imports (`from "../../ee/`) — the alias cannot catch those.
4. **Bolder fork core touch points.** The personal API keys feature edits these core files, so
   an upstream merge can silently overwrite them. Re-check each against `oss/api-key/`:
   - server: `core/auth/strategies/jwt.strategy.ts` (calls `ApiKeyService.validateApiKey`, sets
     `req.raw.apiKeyId`), `core/auth/services/token.service.ts` (dedicated no-`exp` signer for key
     tokens), `core/auth/auth.module.ts` (imports `ApiKeyModule`), `core/auth/auth.controller.ts`
     (collab-token refuses keys), `integrations/static/static.module.ts` (`API_KEYS_ENABLED` in
     `window.CONFIG`);
   - client: `components/settings/settings-sidebar.tsx`, `lib/config.ts`.

   Then run `pnpm --filter server exec jest src/oss/api-key` after every upstream merge (it
   catches a returned 90-day `exp` and a dropped collab-token refusal).
