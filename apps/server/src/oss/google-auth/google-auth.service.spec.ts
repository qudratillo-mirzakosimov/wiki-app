// The part after Google: member lookup and session creation. openid-client is mocked, so
// this covers our rules, not Google's token validation (that is the library's job).
const claims = jest.fn();
const authorizationCodeGrant = jest.fn();
jest.mock(
  'openid-client',
  () => ({
    discovery: jest.fn().mockResolvedValue({}),
    authorizationCodeGrant: (...args: unknown[]) => authorizationCodeGrant(...args),
  }),
  { virtual: true },
);

import { GoogleAuthService } from './google-auth.service';

const workspace = { id: 'ws1' } as any;
const flow = { state: 's', nonce: 'n', codeVerifier: 'v', expiresAt: Date.now() + 60_000 };
const callback = new URL('http://localhost/api/auth/google/callback?code=c&state=s');

function build(user: Record<string, unknown> | undefined) {
  const userRepo = {
    findByEmail: jest.fn().mockResolvedValue(user),
    updateLastLogin: jest.fn(),
  };
  const sessionService = { createSessionAndToken: jest.fn().mockResolvedValue('jwt') };
  const audit = { log: jest.fn() };
  const env = { getAppUrl: () => 'http://localhost' };
  const service = new GoogleAuthService(env as any, sessionService as any, userRepo as any, audit as any);
  return { service, userRepo, sessionService, audit };
}

async function reasonOf(p: Promise<unknown>) {
  try {
    await p;
  } catch (e: any) {
    return e.reason ?? e.message;
  }
  return 'resolved';
}

beforeAll(() => {
  process.env.GOOGLE_CLIENT_ID = 'id';
  process.env.GOOGLE_CLIENT_SECRET = 'secret';
  process.env.GOOGLE_ALLOWED_DOMAINS = 'bolderapps.com';
});

beforeEach(() => {
  claims.mockReturnValue({ email: 'Ann@bolderapps.com', email_verified: true, hd: 'bolderapps.com' });
  authorizationCodeGrant.mockResolvedValue({ claims });
});

it('signs in an active member and passes state, nonce and PKCE to the library', async () => {
  const { service, userRepo, sessionService, audit } = build({ id: 'u1', workspaceId: 'ws1' });
  await expect(service.finish(callback, flow, workspace)).resolves.toBe('jwt');
  expect(authorizationCodeGrant).toHaveBeenCalledWith(expect.anything(), callback, {
    pkceCodeVerifier: 'v',
    expectedState: 's',
    expectedNonce: 'n',
    idTokenExpected: true,
  });
  expect(userRepo.findByEmail).toHaveBeenCalledWith('ann@bolderapps.com', 'ws1');
  expect(sessionService.createSessionAndToken).toHaveBeenCalled();
  expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ metadata: { source: 'google' } }));
});

it('refuses someone who is not a member, without creating anything', async () => {
  const { service, sessionService } = build(undefined);
  expect(await reasonOf(service.finish(callback, flow, workspace))).toBe('not_a_member');
  expect(sessionService.createSessionAndToken).not.toHaveBeenCalled();
});

it.each(['deactivatedAt', 'deletedAt'])('refuses a member with %s set', async (field) => {
  const { service, sessionService } = build({ id: 'u1', [field]: new Date() });
  expect(await reasonOf(service.finish(callback, flow, workspace))).toBe('not_a_member');
  expect(sessionService.createSessionAndToken).not.toHaveBeenCalled();
});

it('refuses a foreign domain before looking anyone up', async () => {
  claims.mockReturnValue({ email: 'x@gmail.com', email_verified: true });
  const { service, userRepo } = build({ id: 'u1' });
  expect(await reasonOf(service.finish(callback, flow, workspace))).toBe('domain_not_allowed');
  expect(userRepo.findByEmail).not.toHaveBeenCalled();
});

it('maps a library failure (bad code, state mismatch, bad token) to "failed"', async () => {
  authorizationCodeGrant.mockRejectedValue(new Error('unexpected state'));
  const { service, userRepo } = build({ id: 'u1' });
  expect(await reasonOf(service.finish(callback, flow, workspace))).toBe('failed');
  expect(userRepo.findByEmail).not.toHaveBeenCalled();
});
