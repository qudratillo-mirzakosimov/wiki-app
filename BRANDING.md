# Branding (Bolder fork)

Everything a user sees as "the product" comes from these places. Nothing else should
hardcode a name, logo or brand colour.

| What | Where | When it applies |
|---|---|---|
| Product name | `APP_NAME` env var (server) | Runtime. Per instance, no rebuild. |
| AGPL source link | `SOURCE_CODE_URL` env var (server) | Runtime. Shown next to the version in Settings. |
| Logo, favicons, app icons | `apps/client/public/brand/` | Build time, or mount a directory over `/app/apps/client/dist/brand` at runtime. |
| Brand colour, fonts | `apps/client/src/oss/brand/palette.ts` | Build time. |
| Email sender name | `MAIL_FROM_NAME`, falls back to `APP_NAME` | Runtime. |
| Email layout, colours | `apps/server/src/integrations/transactional/{css/styles.ts,partials/partials.tsx}` | Build time. |
| Email images | `apps/client/public/brand/email/`, loaded from `APP_URL` | Build time; `APP_URL` at runtime. |

Source of truth: the **Bolder Brand Standards** Figma file
(`figma.com/design/yhqhkdtO3fdeTrCJj0ESDX`), imported 2026-11-11.

| Item | From Figma | Here |
|---|---|---|
| Mark | Assets → `Logo/Tile` | `public/brand/logo.svg` (header, login, SVG favicon) |
| Lockups | Assets → `Logo/Horizontal/White`, `/Black` | `public/brand/logo-horizontal-{white,black}.svg` (not used in the UI yet) |
| Favicon | "35 · App icon": flat tile, no gradient | `favicon-16x16.png`, `favicon-32x32.png` (tile minimum is 16 px, "30 · Minimum size") |
| App icon | "35 · App icon": tile on black | `app-icon-{192,512}.png`, tile at about 60% width. The Ember gradient behind it is left out. |
| Colour | "41 · Tints": orange 50..900 | `src/oss/brand/palette.ts`, one-to-one onto Mantine's ten shades |
| Type | "45 · Typefaces": Montserrat Bold headlines, Inter body/UI | `@fontsource-variable/*`, self-hosted, SIL OFL |

The exported Figma SVGs carry a `#F5F5F5` frame background; it is stripped. PNGs are
rendered from the SVGs with headless Chrome (16/32/512) and `sips` (192).

**Contrast.** White on Bolder Orange (500) is 3.4:1, which "43 · Accessible pairings"
limits to large text. Filled buttons therefore use shade 600 (`#E0381A`, 4.4:1) in both
modes, and body-text links in light mode use 700 (`#B32B12`, 6.4:1). Dark-mode links use
Mantine's shade 4 (`#FF6A51`, 5.5:1 on the dark background).

## Email ("Ember" layout)

All 15 transactional emails share one layout in `partials.tsx`: a black hero with the
Ember gradient ("42 · Gradients"), the white lockup top right, a CAPS Montserrat headline
with one orange period ("46", "47"), a 4px Horizon band, a white body with cream context
panels, and a Bolder Orange pill button. Templates pass only words and links.

- **Images are PNG/JPEG, not SVG.** Gmail and Outlook do not render SVG. `logo-horizontal-white.png`
  (2x, shown at 114 × 18) and `hero-ember.jpg` (1120 × 520) are rendered with headless
  Chrome from the lockup SVG and a CSS radial gradient. The glow sits low on the right so
  neither the orange half of the logo tile nor the orange period lands on orange.
- **URLs are absolute, built from `APP_URL`.** Each instance serves its own copy, so the
  client instance never loads images from the internal one. Without `APP_URL` the hero
  falls back to plain black and the logo to the word "Bolder".
- **Outlook on Windows drops background images**; the hero shows its black base there.
- **The button is Bolder Orange (500), not 600 as in the app**, because its label is 18px
  bold: "43 · Accessible pairings" allows white on Bolder Orange for buttons at that size.
- **No `rgba()` or `opacity`.** Several clients drop both, so the guide's 60% eyebrow is
  pre-mixed into solid colours.
- **Fonts.** Only Apple Mail and iOS load the Google Fonts link; everyone else sees Arial
  (Arial Black for headlines), so check designs in Arial too.

Defaults for the name live in `apps/server/src/oss/brand.ts` and
`apps/client/src/lib/config.ts` (`getAppName`) — keep the two in sync.

## Swapping assets

Replace the files and keep their names:

- `logo.svg`: square mark, used in the header, the login page and as the SVG favicon
- `favicon-16x16.png`, `favicon-32x32.png`
- `app-icon-192x192.png`, `app-icon-512x512.png`: PWA and apple-touch icon

For the colour, Mantine needs ten shades. Replace `primary` in `palette.ts` and recheck
the contrast notes above.

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
