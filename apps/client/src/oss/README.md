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

One exception does real work: `page-permission/index.ts` maps `PageShareModal` to
the core `features/share/components/share-modal.tsx`. Upstream moved the Community
"Share → Publish to web" button inside the Enterprise modal (commit `59e94556`) but
left the original core modal in the tree, unused.

**Never copy code from upstream `src/ee/` into this directory.** Write it fresh.

### When merging upstream

1. Delete `apps/client/src/ee`, `packages/ee`, `apps/server/src/ee` and `.gitmodules` again.
2. `pnpm --filter client exec tsc --noEmit` — a missing shim shows up as TS2307.
3. Grep core for relative imports (`from "../../ee/`) — the alias cannot catch those.
