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
