import bytes from "bytes";
import { castToBoolean } from "@/lib/utils.tsx";
import { AvatarIconType } from "@/features/attachments/types/attachment.types.ts";
import { sanitizeUrl } from "@docmost/editor-ext";

declare global {
  interface Window {
    CONFIG?: Record<string, string>;
  }
}

// Bolder fork: the name comes from the server's APP_NAME (window.CONFIG), so one image can
// serve differently named instances. Keep the fallback in sync with apps/server/src/oss/brand.ts.
export function getAppName(): string {
  return getConfigValue("APP_NAME") || "Bolder Wiki";
}

// AGPL-3.0 §13 source offer; empty when the deployment has not set SOURCE_CODE_URL.
export function getSourceCodeUrl(): string | undefined {
  return getConfigValue("SOURCE_CODE_URL") || undefined;
}

// Bolder fork: true when the server has GOOGLE_CLIENT_ID/SECRET/ALLOWED_DOMAINS set.
export function isGoogleAuthEnabled(): boolean {
  return castToBoolean(getConfigValue("GOOGLE_AUTH_ENABLED"));
}

export function getAppUrl(): string {
  return `${window.location.protocol}//${window.location.host}`;
}

export function getServerAppUrl(): string {
  return getConfigValue("APP_URL");
}

export function getBackendUrl(): string {
  return getAppUrl() + "/api";
}

export function getCollaborationUrl(): string {
  const baseUrl =
    getConfigValue("COLLAB_URL") ||
    (import.meta.env.DEV ? process.env.APP_URL : getAppUrl());

  const collabUrl = new URL("/collab", baseUrl);
  collabUrl.protocol = collabUrl.protocol === "https:" ? "wss:" : "ws:";
  return collabUrl.toString();
}

export function getSubdomainHost(): string {
  return getConfigValue("SUBDOMAIN_HOST");
}

export function isCloud(): boolean {
  return castToBoolean(getConfigValue("CLOUD"));
}

export function getAvatarUrl(
  avatarUrl: string,
  type: AvatarIconType = AvatarIconType.AVATAR,
) {
  if (!avatarUrl) return null;
  if (avatarUrl?.startsWith("http")) return avatarUrl;

  return getBackendUrl() + `/attachments/img/${type}/` + encodeURI(avatarUrl);
}

export function getSpaceUrl(spaceSlug: string) {
  return "/s/" + spaceSlug;
}

export function getFileUrl(src: string) {
  if (!src) return src;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/api/")) {
    // Remove the '/api' prefix
    return getBackendUrl() + src.substring(4);
  }
  if (src.startsWith("/files/")) {
    return getBackendUrl() + src;
  }
  return sanitizeUrl(src);
}

export function getFileUploadSizeLimit() {
  const limit = getConfigValue("FILE_UPLOAD_SIZE_LIMIT", "50mb");
  return bytes(limit);
}

export function getFileImportSizeLimit() {
  const limit = getConfigValue("FILE_IMPORT_SIZE_LIMIT", "200mb");
  return bytes(limit);
}

export function getDrawioUrl() {
  return getConfigValue("DRAWIO_URL", "https://embed.diagrams.net");
}

export function getBillingTrialDays() {
  return getConfigValue("BILLING_TRIAL_DAYS");
}

export function getPostHogHost() {
  return getConfigValue("POSTHOG_HOST");
}

export function isPostHogEnabled(): boolean {
  return Boolean(getPostHogHost() && getPostHogKey());
}

export function getPostHogKey() {
  return getConfigValue("POSTHOG_KEY");
}

function getConfigValue(key: string, defaultValue: string = undefined): string {
  const rawValue = import.meta.env.DEV
    ? process?.env?.[key]
    : window?.CONFIG?.[key];
  return rawValue ?? defaultValue;
}
