// Bolder fork: the short-lived cookie that carries OAuth state, nonce and PKCE verifier
// from /api/auth/google to its callback. Signed with APP_SECRET so it cannot be forged, and
// expiring on its own so a stale cookie cannot be replayed. Nothing in it is secret from the
// browser that started the flow; the signature is what matters.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const GOOGLE_STATE_COOKIE = 'bolder_google_oauth';
export const GOOGLE_STATE_TTL_SECONDS = 600;

export type GoogleFlowState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  expiresAt: number; // epoch ms
};

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`google-oauth:${payload}`)
    .digest('base64url');
}

export function encodeFlowState(value: GoogleFlowState, secret: string): string {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

// Returns null for anything missing, tampered with or expired; callers treat all three the same.
export function decodeFlowState(
  cookie: string | undefined,
  secret: string,
  now: number = Date.now(),
): GoogleFlowState | null {
  if (!cookie) return null;
  const [payload, signature] = cookie.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (
      typeof value?.state !== 'string' ||
      typeof value?.nonce !== 'string' ||
      typeof value?.codeVerifier !== 'string' ||
      typeof value?.expiresAt !== 'number' ||
      value.expiresAt <= now
    ) {
      return null;
    }
    return value as GoogleFlowState;
  } catch {
    return null;
  }
}
