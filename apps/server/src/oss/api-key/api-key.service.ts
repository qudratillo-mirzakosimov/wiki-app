// Bolder fork: validation of personal API keys, so pages written through Claude carry the
// real author instead of a shared service account.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code. Core already
// signs the `api_key` JWT (TokenService.generateApiToken) and passport has verified its
// signature before this runs. This service is the second half: the JWT is only a pointer to
// an `api_keys` row, and the row is the single source of truth for revocation and expiry.
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepo } from '@docmost/db/repos/user/user.repo';
import { WorkspaceRepo } from '@docmost/db/repos/workspace/workspace.repo';
import { ApiKey, User, Workspace } from '@docmost/db/types/entity.types';
import { JwtApiKeyPayload } from '../../core/auth/dto/jwt-payload';
import { isUserDisabled } from '../../common/helpers/utils';
import { UserRole } from '../../common/helpers/types/permission';
import { TokenService } from '../../core/auth/services/token.service';
import { ApiKeyExpiry, CreateApiKeyDto } from './dto/api-key.dto';
import { ApiKeyRepo, ApiKeyWithCreator } from './api-key.repo';
import { isApiKeysEnabled } from './api-key.policy';

// A busy key would otherwise write to the database on every request. Five minutes keeps
// "last used" useful in the UI without turning authentication into a write path.
const LAST_USED_THROTTLE_MS = 5 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRY_DAYS: Record<Exclude<ApiKeyExpiry, 'never'>, number> = {
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

// What the UI may see. Deliberately has no token, hash or creator id.
export type ApiKeyView = {
  id: string;
  name: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
};

function toView(key: ApiKey): ApiKeyView {
  return {
    id: key.id,
    name: key.name,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
  };
}

function isWorkspaceAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN || user.role === UserRole.OWNER;
}

// A key-authenticated request must not manage keys: a leaked key could otherwise mint
// replacements for itself or revoke the owner's other keys.
function refuseKeyAuth(apiKeyId?: string): void {
  if (apiKeyId) {
    throw new ForbiddenException('API keys cannot be managed with an API key');
  }
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    private readonly apiKeyRepo: ApiKeyRepo,
    private readonly userRepo: UserRepo,
    private readonly workspaceRepo: WorkspaceRepo,
    private readonly tokenService: TokenService,
  ) {}

  // Every failure is the same bare 401: the caller must not learn whether a key id exists,
  // is revoked or expired.
  async validateApiKey(
    payload: JwtApiKeyPayload,
  ): Promise<{ user: User; workspace: Workspace }> {
    if (!isApiKeysEnabled()) throw new UnauthorizedException();

    const key = await this.apiKeyRepo.findById(payload.apiKeyId);
    if (!key || key.deletedAt) throw new UnauthorizedException();

    // The JWT carries no `exp`; the row decides, so expiry is judged in one place.
    if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException();
    }

    // Both ids on the row must agree with the signed claims, so a token cannot be replayed
    // against a different user's or workspace's key row.
    if (key.creatorId !== payload.sub || key.workspaceId !== payload.workspaceId) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepo.findById(payload.sub, payload.workspaceId);
    if (!user || isUserDisabled(user)) throw new UnauthorizedException();

    const workspace = await this.workspaceRepo.findById(payload.workspaceId);
    if (!workspace) throw new UnauthorizedException();

    if (
      !key.lastUsedAt ||
      Date.now() - key.lastUsedAt.getTime() > LAST_USED_THROTTLE_MS
    ) {
      // Bookkeeping must never fail an otherwise valid request.
      // The message carries only the error text: never the key id or anything token-like.
      this.apiKeyRepo.touchLastUsed(key.id).catch((err: unknown) => {
        this.logger.warn(
          `Could not record API key usage: ${err instanceof Error ? err.message : 'unknown error'}`,
        );
      });
    }

    return { user, workspace };
  }

  async list(user: User, workspaceId: string, apiKeyId?: string): Promise<{ items: ApiKeyView[] }> {
    refuseKeyAuth(apiKeyId);
    const keys = await this.apiKeyRepo.listByCreator(user.id, workspaceId);
    return { items: keys.map(toView) };
  }

  // The signed token is returned here and nowhere else: it is not stored, not logged, and
  // listing never includes it. Losing it means revoking the key and minting another.
  async create(
    user: User,
    workspaceId: string,
    dto: CreateApiKeyDto,
    apiKeyId?: string,
  ): Promise<ApiKeyView & { token: string }> {
    refuseKeyAuth(apiKeyId);

    const choice: ApiKeyExpiry = dto.expiresIn ?? '1y';
    const expiresAt =
      choice === 'never' ? null : new Date(Date.now() + EXPIRY_DAYS[choice] * DAY_MS);

    const key = await this.apiKeyRepo.insert({
      name: dto.name,
      creatorId: user.id,
      workspaceId,
      expiresAt,
    });

    try {
      // No expiresIn: the row's expires_at is the only expiry (see TokenService).
      const token = await this.tokenService.generateApiToken({
        apiKeyId: key.id,
        user,
        workspaceId,
      });
      return { ...toView(key), token };
    } catch (err) {
      // Do not leave a live row whose token nobody ever received.
      await this.apiKeyRepo.softDelete(key.id);
      throw err;
    }
  }

  async revoke(
    user: User,
    workspaceId: string,
    id: string,
    apiKeyId?: string,
  ): Promise<{ success: true }> {
    refuseKeyAuth(apiKeyId);

    // Another workspace's key is indistinguishable from a missing one.
    const key = await this.apiKeyRepo.findById(id);
    if (!key || key.deletedAt || key.workspaceId !== workspaceId) {
      throw new NotFoundException('API key not found');
    }
    if (key.creatorId !== user.id && !isWorkspaceAdmin(user)) {
      throw new ForbiddenException();
    }

    await this.apiKeyRepo.softDelete(key.id);
    return { success: true };
  }

  async listWorkspace(
    user: User,
    workspaceId: string,
    apiKeyId?: string,
  ): Promise<{ items: (ApiKeyView & { creator: ApiKeyWithCreator['creator'] })[] }> {
    refuseKeyAuth(apiKeyId);
    if (!isWorkspaceAdmin(user)) throw new ForbiddenException();

    const keys = await this.apiKeyRepo.listByWorkspace(workspaceId);
    return { items: keys.map((k) => ({ ...toView(k), creator: k.creator })) };
  }
}
