import {
  acceptGoogleClaims,
  GoogleAuthRejected,
  readGoogleAuthConfig,
} from './google-auth.policy';
import { decodeFlowState, encodeFlowState } from './google-auth.state';

const domains = ['bolderapps.com'];
const ok = { email: 'Ann@BolderApps.com', email_verified: true, hd: 'bolderapps.com' };

function reason(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (e) {
    return e instanceof GoogleAuthRejected ? e.reason : 'other';
  }
  return undefined;
}

describe('readGoogleAuthConfig', () => {
  const full = {
    GOOGLE_CLIENT_ID: 'id',
    GOOGLE_CLIENT_SECRET: 'secret',
    GOOGLE_ALLOWED_DOMAINS: ' BolderApps.com , example.org ',
  };

  it('normalises the domain list', () => {
    expect(readGoogleAuthConfig(full)?.allowedDomains).toEqual([
      'bolderapps.com',
      'example.org',
    ]);
  });

  it.each(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_ALLOWED_DOMAINS'])(
    'is disabled when %s is missing',
    (key) => {
      expect(readGoogleAuthConfig({ ...full, [key]: ' ' })).toBeNull();
    },
  );
});

describe('acceptGoogleClaims', () => {
  it('returns the lower-cased email for a verified Workspace account', () => {
    expect(acceptGoogleClaims(ok, domains)).toBe('ann@bolderapps.com');
  });

  it('rejects an unverified email', () => {
    expect(reason(() => acceptGoogleClaims({ ...ok, email_verified: false }, domains))).toBe(
      'email_unverified',
    );
    // A string "true" is not the boolean Google sends.
    expect(reason(() => acceptGoogleClaims({ ...ok, email_verified: 'true' }, domains))).toBe(
      'email_unverified',
    );
  });

  it('rejects a missing email', () => {
    expect(reason(() => acceptGoogleClaims({ email_verified: true, hd: 'bolderapps.com' }, domains))).toBe(
      'email_unverified',
    );
  });

  it('rejects another domain', () => {
    expect(
      reason(() =>
        acceptGoogleClaims({ ...ok, email: 'x@evil.com', hd: 'evil.com' }, domains),
      ),
    ).toBe('domain_not_allowed');
  });

  it('rejects a personal Google account on a work address (no hd)', () => {
    const { hd, ...personal } = ok;
    expect(reason(() => acceptGoogleClaims(personal, domains))).toBe('domain_not_allowed');
  });

  it('rejects an allowed hd paired with a foreign email domain', () => {
    expect(
      reason(() => acceptGoogleClaims({ ...ok, email: 'x@gmail.com' }, domains)),
    ).toBe('domain_not_allowed');
  });
});

describe('flow state cookie', () => {
  const secret = 'test-secret';
  const flow = { state: 's', nonce: 'n', codeVerifier: 'v', expiresAt: 2_000 };

  it('round-trips', () => {
    expect(decodeFlowState(encodeFlowState(flow, secret), secret, 1_000)).toEqual(flow);
  });

  it('rejects an expired cookie', () => {
    expect(decodeFlowState(encodeFlowState(flow, secret), secret, 2_000)).toBeNull();
  });

  it('rejects a cookie signed with another secret', () => {
    expect(decodeFlowState(encodeFlowState(flow, 'other'), secret, 1_000)).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const [, sig] = encodeFlowState(flow, secret).split('.');
    const forged = Buffer.from(JSON.stringify({ ...flow, state: 'x' })).toString('base64url');
    expect(decodeFlowState(`${forged}.${sig}`, secret, 1_000)).toBeNull();
  });

  it('rejects missing and malformed values', () => {
    expect(decodeFlowState(undefined, secret)).toBeNull();
    expect(decodeFlowState('garbage', secret)).toBeNull();
  });
});
