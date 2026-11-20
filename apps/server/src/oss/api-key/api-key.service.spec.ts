import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

const payload = { sub: 'u1', workspaceId: 'ws1', apiKeyId: 'k1', type: 'api_key' } as const;
const user = { id: 'u1', workspaceId: 'ws1', deactivatedAt: null, deletedAt: null };
const workspace = { id: 'ws1' };

function row(over: Record<string, unknown> = {}) {
  return {
    id: 'k1',
    creatorId: 'u1',
    workspaceId: 'ws1',
    expiresAt: null,
    lastUsedAt: null,
    deletedAt: null,
    ...over,
  };
}

// `null` means "the repo finds nothing" (a default parameter would swallow `undefined`).
function build(
  keyRow: Record<string, unknown> | null = row(),
  userRow: Record<string, unknown> | null = user,
  workspaceRow: Record<string, unknown> | null = workspace,
) {
  const apiKeyRepo = {
    findById: jest.fn().mockResolvedValue(keyRow ?? undefined),
    touchLastUsed: jest.fn().mockResolvedValue(undefined),
  };
  const userRepo = { findById: jest.fn().mockResolvedValue(userRow ?? undefined) };
  const workspaceRepo = { findById: jest.fn().mockResolvedValue(workspaceRow ?? undefined) };
  const service = new ApiKeyService(apiKeyRepo as any, userRepo as any, workspaceRepo as any);
  return { service, apiKeyRepo, userRepo, workspaceRepo };
}

describe('ApiKeyService.validateApiKey', () => {
  const original = process.env.API_KEYS_ENABLED;
  beforeEach(() => {
    process.env.API_KEYS_ENABLED = 'true';
  });
  afterAll(() => {
    if (original === undefined) delete process.env.API_KEYS_ENABLED;
    else process.env.API_KEYS_ENABLED = original;
  });

  it('accepts a live key', async () => {
    const { service, apiKeyRepo } = build();
    await expect(service.validateApiKey(payload as any)).resolves.toEqual({ user, workspace });
    expect(apiKeyRepo.touchLastUsed).toHaveBeenCalledTimes(1);
    expect(apiKeyRepo.touchLastUsed).toHaveBeenCalledWith('k1');
  });

  it('does not touch lastUsed within 5 minutes', async () => {
    const { service, apiKeyRepo } = build(row({ lastUsedAt: new Date(Date.now() - 60_000) }));
    await service.validateApiKey(payload as any);
    expect(apiKeyRepo.touchLastUsed).not.toHaveBeenCalled();
  });

  it('touches lastUsed once it is older than 5 minutes', async () => {
    const { service, apiKeyRepo } = build(row({ lastUsedAt: new Date(Date.now() - 6 * 60_000) }));
    await service.validateApiKey(payload as any);
    expect(apiKeyRepo.touchLastUsed).toHaveBeenCalledTimes(1);
  });

  it('rejects when switch is off', async () => {
    delete process.env.API_KEYS_ENABLED;
    const { service, apiKeyRepo } = build();
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
    expect(apiKeyRepo.findById).not.toHaveBeenCalled();
  });

  it('rejects a missing row', async () => {
    const { service } = build(null);
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a revoked key', async () => {
    const { service } = build(row({ deletedAt: new Date() }));
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an expired key', async () => {
    const { service } = build(row({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('accepts a key that expires in the future', async () => {
    const { service } = build(row({ expiresAt: new Date(Date.now() + 60_000) }));
    await expect(service.validateApiKey(payload as any)).resolves.toBeDefined();
  });

  it('accepts expiresAt null', async () => {
    const { service } = build(row({ expiresAt: null }));
    await expect(service.validateApiKey(payload as any)).resolves.toBeDefined();
  });

  it('rejects creator mismatch', async () => {
    const { service } = build(row({ creatorId: 'someone-else' }));
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects workspace mismatch', async () => {
    const { service } = build(row({ workspaceId: 'ws2' }));
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a deactivated user', async () => {
    const { service } = build(row(), { ...user, deactivatedAt: new Date() });
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a deleted user', async () => {
    const { service } = build(row(), { ...user, deletedAt: new Date() });
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an unknown user', async () => {
    const { service } = build(row(), null);
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an unknown workspace', async () => {
    const { service } = build(row(), user, null);
    await expect(service.validateApiKey(payload as any)).rejects.toThrow(UnauthorizedException);
  });

  it('does not touch lastUsed for a rejected key', async () => {
    const { service, apiKeyRepo } = build(row({ deletedAt: new Date() }));
    await expect(service.validateApiKey(payload as any)).rejects.toThrow();
    expect(apiKeyRepo.touchLastUsed).not.toHaveBeenCalled();
  });
});
