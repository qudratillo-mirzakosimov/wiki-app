import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../core/auth/services/token.service';

// Reproduces the production wiring: TokenModule gives JwtService a default expiresIn
// (JWT_TOKEN_EXPIRES_IN, 90d out of the box). A key minted through generateApiToken without an
// explicit expiry must still carry no `exp`, or passport (ignoreExpiration: false) would kill
// "never" and "1y" keys at 90 days. api_keys.expires_at is the only expiry.
describe('TokenService.generateApiToken', () => {
  const SECRET = 'test-secret-test-secret-test-secret';
  const jwt = new JwtService({
    secret: SECRET,
    signOptions: { expiresIn: '90d', issuer: 'Docmost' },
  });
  const env = { getAppSecret: () => SECRET, getJwtTokenExpiresIn: () => '90d' };
  const tokens = new TokenService(jwt, env as any);
  const user = { id: 'u1', deactivatedAt: null, deletedAt: null } as any;

  it('mints a token with no exp even though JwtService defaults to 90d', async () => {
    const token = await tokens.generateApiToken({ apiKeyId: 'k1', user, workspaceId: 'ws1' });
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded).toMatchObject({ sub: 'u1', apiKeyId: 'k1', workspaceId: 'ws1', type: 'api_key' });
    expect(decoded).not.toHaveProperty('exp');
    // The signature still verifies (sanity: the token is real, not just decodable).
    expect(() => jwt.verify(token)).not.toThrow();
  });

  it('still honours an explicit expiresIn', async () => {
    const token = await tokens.generateApiToken({
      apiKeyId: 'k1',
      user,
      workspaceId: 'ws1',
      expiresIn: '1h',
    });
    expect(jwt.decode(token)).toHaveProperty('exp');
  });
});
