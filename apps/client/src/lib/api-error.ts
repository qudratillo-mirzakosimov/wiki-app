import { isAxiosError } from "axios";
import i18n from "i18next";

// The server's error messages fall into three kinds, and only one of them is
// fit to show a person:
//   1. Specific, readable domain messages ("Group name already exists",
//      "Email or password does not match"): shown as they are.
//   2. Bare HTTP reason phrases from an exception thrown without a message
//      ("Forbidden", "Bad Request"): they say what failed, never why.
//   3. Developer-facing text: DTO validation ("spaceId is required",
//      "email must be an email"), unknown routes ("Cannot POST /api/x"),
//      throttler and database internals.
// Kinds 2 and 3 are replaced by an explanation keyed on the HTTP status, or by
// the caller's fallback, which names the action that failed.

const GENERIC_PHRASES = new Set([
  "bad request",
  "unauthorized",
  "forbidden",
  "forbidden resource",
  "not found",
  "conflict",
  "payload too large",
  "request entity too large",
  "too many requests",
  "internal server error",
  "service unavailable",
  "bad gateway",
  "gateway timeout",
  "an error occurred",
  "error",
]);

const TECHNICAL_PATTERNS: RegExp[] = [
  /\b[a-z]+Ids?\b/, // camelCase identifiers: spaceId, pageId, userIds
  /\b(must|should) (not )?(be|contain|match|have)\b/i, // class-validator
  /\bis required\b/i,
  /\bcannot (get|post|put|patch|delete) \//i, // unknown route
  /exception|\bundefined\b|\bnull\b|\bnan\b/i,
  /\b(sql|relation|constraint|duplicate key|violates|ECONN\w*|ETIMEDOUT)\b/i,
  /\binvalid [a-z ]*\bid\b/i,
];

// i18n.t returns undefined until i18next has initialised (and in tests); an
// error toast must never lose its text for that, so fall back to the English.
function tr(key: string): string {
  return i18n.t(key) || key;
}

function isShowable(message: string): boolean {
  const m = message.trim();
  if (!m) return false;
  if (GENERIC_PHRASES.has(m.toLowerCase())) return false;
  return !TECHNICAL_PATTERNS.some((re) => re.test(m));
}

function statusMessage(status: number | undefined): string | null {
  if (status === undefined) {
    return tr("Can't reach the server. Check your connection and try again.");
  }
  if (status === 401) {
    return tr("Your session has expired. Please sign in again.");
  }
  if (status === 403) {
    return tr(
      "You don't have permission to do this. Ask a workspace admin if you need access.",
    );
  }
  if (status === 404) {
    return tr(
      "We couldn't find that. It may have been deleted, or you may not have access to it.",
    );
  }
  if (status === 413) return tr("That file is too large to upload.");
  if (status === 429) {
    return tr("Too many attempts. Please wait a minute and try again.");
  }
  if (status >= 500) {
    return tr(
      "Something went wrong on our side. Please try again in a moment.",
    );
  }
  return null;
}

/**
 * A message fit to show a person for a failed API call. `fallback` should name
 * the action ("Failed to create space"); it is used when the server's message
 * is generic or technical and the status alone explains nothing better.
 */
export function getApiErrorMessage(error: unknown, fallback?: string): string {
  const generic = fallback ?? tr("Something went wrong. Please try again.");
  if (!isAxiosError(error)) return generic;

  const status = error.response?.status;
  // No response (network down, server unreachable), throttling and server
  // faults never carry text a person can act on.
  if (!error.response || status === 429 || status >= 500) {
    return statusMessage(status) ?? generic;
  }

  const raw = error.response.data?.message;
  const messages = (Array.isArray(raw) ? raw : [raw]).filter(
    (m): m is string => typeof m === "string",
  );
  // Licence checks survive in a few server paths with Enterprise removed.
  if (messages.some((m) => /requires a valid license/i.test(m))) {
    return tr("This feature isn't available on this wiki.");
  }

  const showable = messages.filter(isShowable);
  if (showable.length) return showable.join(", ");

  // A bare 401/403/404/413 is better explained by its status than by the
  // caller's "Failed to ...": it says why, not only what.
  if (status === 401 || status === 403 || status === 404 || status === 413) {
    return statusMessage(status) ?? generic;
  }
  return generic;
}
