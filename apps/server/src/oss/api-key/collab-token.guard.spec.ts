import { ForbiddenException } from '@nestjs/common';
// AuthService pulls in @docmost/transactional (email templates), which jest cannot resolve here
// and which this test does not need: the controller only gets a stub service.
jest.mock('../../core/auth/services/auth.service', () => ({ AuthService: class {} }));

import { AuthController } from '../../core/auth/auth.controller';
import { refuseApiKeyAuth } from './refuse-api-key-auth';

describe('refuseApiKeyAuth', () => {
  it('throws 403 when the request was authenticated by an API key', () => {
    expect(() => refuseApiKeyAuth({ raw: { apiKeyId: 'k1' } })).toThrow(ForbiddenException);
  });

  it.each([{ raw: {} }, { raw: undefined }, {}])('lets a session request through (%p)', (req) => {
    expect(() => refuseApiKeyAuth(req as any)).not.toThrow();
  });
});

// The helper is only worth anything if the route calls it, and the route lives in a core file
// an upstream merge can rewrite; this is the tripwire.
describe('POST /api/auth/collab-token', () => {
  const getCollabToken = jest.fn().mockResolvedValue('collab-jwt');
  const controller = new AuthController(
    { getCollabToken } as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );
  const user = { id: 'u1' } as any;
  const workspace = { id: 'ws1' } as any;

  beforeEach(() => getCollabToken.mockClear());

  it('refuses a key-authenticated request and mints nothing', async () => {
    await expect(
      controller.collabToken(user, workspace, { raw: { apiKeyId: 'k1' } } as any),
    ).rejects.toThrow(ForbiddenException);
    expect(getCollabToken).not.toHaveBeenCalled();
  });

  it('still mints for a session request', async () => {
    await expect(controller.collabToken(user, workspace, { raw: {} } as any)).resolves.toBe(
      'collab-jwt',
    );
    expect(getCollabToken).toHaveBeenCalledWith(user, 'ws1');
  });
});
