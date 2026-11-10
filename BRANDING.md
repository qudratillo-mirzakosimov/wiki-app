# Branding (Bolder fork)

Everything a user sees as "the product" comes from these places. Nothing else should
hardcode a name, logo or brand colour.

| What | Where | When it applies |
|---|---|---|
| Product name | `APP_NAME` env var (server) | Runtime. Per instance, no rebuild. |
| AGPL source link | `SOURCE_CODE_URL` env var (server) | Runtime. Shown next to the version in Settings. |
| Logo, favicons, app icons | `apps/client/public/brand/` | Build time, or mount a directory over `/app/apps/client/dist/brand` at runtime. |
| Brand colour | `apps/client/src/oss/brand/palette.ts` | Build time. |
| Email sender name | `MAIL_FROM_NAME`, falls back to `APP_NAME` | Runtime. |

Placeholder values until the real brand arrives: name **Bolder Wiki**, a blue "B" mark,
upstream Docmost's blue. Defaults live in `apps/server/src/oss/brand.ts` and
`apps/client/src/lib/config.ts` (`getAppName`) — keep the two in sync.

## Swapping in the real assets

Replace these files and keep their names:

- `logo.svg`: square mark, used in the header, the login page and as the SVG favicon
- `favicon-16x16.png`, `favicon-32x32.png`
- `app-icon-192x192.png`, `app-icon-512x512.png`: PWA and apple-touch icon

For the colour, Mantine needs ten shades. Index 6 is the main shade in light mode.
Generate them from the single brand hex (e.g. mantine.dev/colors-generator) and replace
`primary` in `palette.ts`.

## How the name reaches each surface

- **Server** (email subjects, invitation body, email footer, mail sender): `getBrandName()`.
- **Browser**: `static.module.ts` puts `APP_NAME` into `window.CONFIG`, replaces
  `__APP_NAME__` in `index.html` (tab title, iOS home-screen title) and rewrites
  `manifest.json` at boot. Client code calls `getAppName()`.
- **Dev server**: a small Vite plugin in `vite.config.ts` does the `__APP_NAME__` swap.

## Deliberately not changed

- JWT `issuer: 'Docmost'` (`token.module.ts`). Users never see it, and changing it would
  sign everyone out.
- `readDocmostMetadata` and the `@docmost/*` package names. These are internal identifiers.
- Locale strings that mention Docmost. Only the Enterprise AI/MCP messages use it, and
  the fork no longer renders them.
