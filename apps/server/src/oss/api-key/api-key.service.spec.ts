import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    insert: jest.fn(async (r: Record<string, unknown>) => ({
      id: 'new-key',
      createdAt: new Date(),
      lastUsedAt: null,
      deletedAt: null,
      ...r,
    })),
    listByCreator: jest.fn().mockResolvedValue([]),
    listByWorkspace: jest.fn().mockResolvedValue([]),
    softDelete: jest.fn().mockResolvedValue(undefined),
  };
  const tokenService = { generateApiToken: jest.fn().mockResolvedValue('signed-token') };
  const userRepo = { findById: jest.fn().mockResolvedValue(userRow ?? undefined) };
  const workspaceRepo = { findById: jest.fn().mockResolvedValue(workspaceRow ?? undefined) };
  const service = new ApiKeyService(
    apiKeyRepo as any,
    userRepo as any,
    workspaceRepo as any,
    tokenService as any,
  );
  return { service, apiKeyRepo, userRepo, workspaceRepo, tokenService };
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
    const { service, apiKeyRepo, userRepo } = build();
    await expect(service.validateApiKey(payload as any)).resolves.toEqual({ user, workspace });
    expect(userRepo.findById).toHaveBeenCalledWith('u1', 'ws1');
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

describe('ApiKeyService.validateApiKey bookkeeping', () => {
  beforeEach(() => {
    process.env.API_KEYS_ENABLED = 'true';
  });
  afterAll(() => {
    delete process.env.API_KEYS_ENABLED;
  });

  it('still authenticates when the lastUsed write fails, and logs a warning without the key id', async () => {
    const { service, apiKeyRepo } = build();
    apiKeyRepo.touchLastUsed.mockRejectedValue(new Error('db down'));
    const warn = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => undefined);
    await expect(service.validateApiKey(payload as any)).resolves.toEqual({ user, workspace });
    await new Promise((r) => setImmediate(r));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).not.toContain('k1');
  });
});

const DAY = 24 * 60 * 60 * 1000;
const member = { id: 'u1', role: 'member', workspaceId: 'ws1' } as any;
const admin = { id: 'a1', role: 'admin', workspaceId: 'ws1' } as any;
const owner = { id: 'o1', role: 'owner', workspaceId: 'ws1' } as any;

describe('ApiKeyService.create', () => {
  it('defaults to 1y', async () => {
    const { service, apiKeyRepo } = build();
    const before = Date.now();
    const res = await service.create(member, 'ws1', { name: 'laptop' });
    const exp = (apiKeyRepo.insert.mock.calls[0][0] as any).expiresAt as Date;
    expect(exp.getTime() - before).toBeGreaterThanOrEqual(365 * DAY - 1000);
    expect(exp.getTime() - before).toBeLessThan(365 * DAY + 5000);
    expect(res.expiresAt).toEqual(exp);
  });

  it.each([
    ['30d', 30],
    ['90d', 90],
    ['1y', 365],
  ] as const)('maps %s to %d days', async (choice, days) => {
    const { service, apiKeyRepo } = build();
    const before = Date.now();
    await service.create(member, 'ws1', { name: 'k', expiresIn: choice });
    const exp = (apiKeyRepo.insert.mock.calls[0][0] as any).expiresAt as Date;
    expect(Math.abs(exp.getTime() - before - days * DAY)).toBeLessThan(5000);
  });

  it('never gives expiresAt null', async () => {
    const { service, apiKeyRepo } = build();
    const res = await service.create(member, 'ws1', { name: 'k', expiresIn: 'never' });
    expect((apiKeyRepo.insert.mock.calls[0][0] as any).expiresAt).toBeNull();
    expect(res.expiresAt).toBeNull();
  });

  it('stores creator and workspace and mints with no expiresIn', async () => {
    const { service, apiKeyRepo, tokenService } = build();
    await service.create(member, 'ws1', { name: 'k' });
    expect(apiKeyRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ creatorId: 'u1', workspaceId: 'ws1', name: 'k' }),
    );
    expect(tokenService.generateApiToken).toHaveBeenCalledWith({
      apiKeyId: 'new-key',
      user: member,
      workspaceId: 'ws1',
    });
  });

  it('returns the token once and list never includes it', async () => {
    const { service, apiKeyRepo } = build();
    const created = await service.create(member, 'ws1', { name: 'k' });
    expect(created.token).toBe('signed-token');
    // Not persisted: the insert payload carries no token or hash of one.
    expect(JSON.stringify(apiKeyRepo.insert.mock.calls[0][0])).not.toContain('signed-token');

    apiKeyRepo.listByCreator.mockResolvedValue([{ ...row(), name: 'k', createdAt: new Date() }]);
    const { items } = await service.list(member, 'ws1');
    expect(items).toHaveLength(1);
    expect(JSON.stringify(items)).not.toContain('signed-token');
    expect(Object.keys(items[0]).sort()).toEqual(
      ['createdAt', 'expiresAt', 'id', 'lastUsedAt', 'name'],
    );
  });

  it('revokes the row if minting fails', async () => {
    const { service, apiKeyRepo, tokenService } = build();
    tokenService.generateApiToken.mockRejectedValue(new Error('boom'));
    await expect(service.create(member, 'ws1', { name: 'k' })).rejects.toThrow('boom');
    expect(apiKeyRepo.softDelete).toHaveBeenCalledWith('new-key');
  });
});

describe('ApiKeyService.revoke', () => {
  it('lets the creator revoke their own key', async () => {
    const { service, apiKeyRepo } = build(row({ creatorId: 'u1' }));
    await expect(service.revoke(member, 'ws1', 'k1')).resolves.toEqual({ success: true });
    expect(apiKeyRepo.softDelete).toHaveBeenCalledWith('k1');
  });

  it("member cannot revoke another member's key", async () => {
    const { service, apiKeyRepo } = build(row({ creatorId: 'someone-else' }));
    await expect(service.revoke(member, 'ws1', 'k1')).rejects.toThrow(ForbiddenException);
    expect(apiKeyRepo.softDelete).not.toHaveBeenCalled();
  });

  it.each([admin, owner])('admin/owner can revoke any workspace key', async (u) => {
    const { service, apiKeyRepo } = build(row({ creatorId: 'someone-else' }));
    await expect(service.revoke(u, 'ws1', 'k1')).resolves.toEqual({ success: true });
    expect(apiKeyRepo.softDelete).toHaveBeenCalledWith('k1');
  });

  it('revoke of a key in another workspace is 404, even for an admin', async () => {
    const { service, apiKeyRepo } = build(row({ workspaceId: 'ws2' }));
    await expect(service.revoke(admin, 'ws1', 'k1')).rejects.toThrow(NotFoundException);
    expect(apiKeyRepo.softDelete).not.toHaveBeenCalled();
  });

  it('unknown id is 404', async () => {
    const { service } = build(null);
    await expect(service.revoke(admin, 'ws1', 'nope')).rejects.toThrow(NotFoundException);
  });

  it('an already revoked key is 404', async () => {
    const { service } = build(row({ deletedAt: new Date() }));
    await expect(service.revoke(member, 'ws1', 'k1')).rejects.toThrow(NotFoundException);
  });
});

describe('ApiKeyService.listWorkspace', () => {
  it('is admin/owner only', async () => {
    const { service, apiKeyRepo } = build();
    await expect(service.listWorkspace(member, 'ws1')).rejects.toThrow(ForbiddenException);
    expect(apiKeyRepo.listByWorkspace).not.toHaveBeenCalled();
    await expect(service.listWorkspace(admin, 'ws1')).resolves.toEqual({ items: [] });
    await expect(service.listWorkspace(owner, 'ws1')).resolves.toEqual({ items: [] });
  });

  it('includes the creator and never a token', async () => {
    const { service, apiKeyRepo } = build();
    apiKeyRepo.listByWorkspace.mockResolvedValue([
      { ...row(), name: 'k', createdAt: new Date(), creator: { id: 'u1', name: 'U', email: 'u@x.io' } },
    ]);
    const { items } = await service.listWorkspace(admin, 'ws1');
    expect(items[0].creator).toEqual({ id: 'u1', name: 'U', email: 'u@x.io' });
    expect(items[0]).not.toHaveProperty('token');
  });
});

describe('ApiKeyService refuses key-authenticated requests', () => {
  it('on every management method', async () => {
    const { service, apiKeyRepo } = build();
    await expect(service.list(admin, 'ws1', 'k9')).rejects.toThrow(ForbiddenException);
    await expect(service.create(admin, 'ws1', { name: 'k' }, 'k9')).rejects.toThrow(ForbiddenException);
    await expect(service.revoke(admin, 'ws1', 'k1', 'k9')).rejects.toThrow(ForbiddenException);
    await expect(service.listWorkspace(admin, 'ws1', 'k9')).rejects.toThrow(ForbiddenException);
    expect(apiKeyRepo.insert).not.toHaveBeenCalled();
    expect(apiKeyRepo.softDelete).not.toHaveBeenCalled();
  });
});
