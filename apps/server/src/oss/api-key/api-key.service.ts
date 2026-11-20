// Bolder fork: validation of personal API keys, so pages written through Claude carry the
// real author instead of a shared service account.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code. Core already
// signs the `api_key` JWT (TokenService.generateApiToken) and passport has verified its
// signature before this runs. This service is the second half: the JWT is only a pointer to
// an `api_keys` row, and the row is the single source of truth for revocation and expiry.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepo } from '@docmost/db/repos/user/user.repo';
import { WorkspaceRepo } from '@docmost/db/repos/workspace/workspace.repo';
import { User, Workspace } from '@docmost/db/types/entity.types';
import { JwtApiKeyPayload } from '../../core/auth/dto/jwt-payload';
import { isUserDisabled } from '../../common/helpers/utils';
import { ApiKeyRepo } from './api-key.repo';
import { isApiKeysEnabled } from './api-key.policy';

// A busy key would otherwise write to the database on every request. Five minutes keeps
// "last used" useful in the UI without turning authentication into a write path.
const LAST_USED_THROTTLE_MS = 5 * 60 * 1000;

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly apiKeyRepo: ApiKeyRepo,
    private readonly userRepo: UserRepo,
    private readonly workspaceRepo: WorkspaceRepo,
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
      this.apiKeyRepo.touchLastUsed(key.id).catch(() => undefined);
    }

    return { user, workspace };
  }
}
