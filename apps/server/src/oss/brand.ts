// Bolder fork: the single server-side source for user-visible branding.
//
// Read from the environment rather than baked into the image so the internal and client
// instances can carry different names from one build. process.env is used directly (not
// EnvironmentService) because the React email templates are plain functions with no DI.

// Placeholder until the product name is decided; set APP_NAME per instance to override.
export const DEFAULT_APP_NAME = 'Bolder Wiki';

export function getBrandName(): string {
  return process.env.APP_NAME?.trim() || DEFAULT_APP_NAME;
}

// Big text on the sign-in panel. The layout appends the closing period itself so every instance
// ends on one; a value that already carries periods would render "GUIDE.." — strip them (and any
// whitespace between or after them, so "GUIDE. ." is "GUIDE") here.
export const DEFAULT_LOGIN_HEADLINE = 'EVERYTHING WE KNOW';

export function getLoginHeadline(): string {
  const value = process.env.LOGIN_HEADLINE?.trim().replace(/[.\s]+$/, '');
  return value || DEFAULT_LOGIN_HEADLINE;
}

// AGPL-3.0 §13: users interacting with a modified version over a network must be offered
// its source. Unset hides the link — acceptable for local dev, not for production.
export function getSourceCodeUrl(): string | undefined {
  return process.env.SOURCE_CODE_URL?.trim() || undefined;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Bolder fork: puts window.CONFIG into index.html. Several values are operator-set free text
// (APP_NAME, LOGIN_HEADLINE), so two things must not be left to chance:
//  - String.replace treats $', $`, $& and $$ in a *string* replacement specially (LOGIN_HEADLINE
//    "WE SAVE $' FOR YOU" would copy the rest of index.html into the script), so a function is used.
//  - JSON.stringify leaves "</script>" intact, which would end the tag early; every "<" is written as the six
//    characters backslash-u-0-0-3-c, which JSON.parse reads back as "<".
export function injectWindowConfig(
  html: string,
  marker: string,
  config: Record<string, unknown>,
): string {
  const json = JSON.stringify(config).replace(/</g, '\\u003c');
  const script = `<script>window.CONFIG=${json};</script>`;
  return html.replace(marker, () => script);
}
