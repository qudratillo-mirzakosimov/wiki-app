// Bolder fork: routes that hand out a longer-lived credential must not be reachable with an API
// key. The collaboration JWT minted by POST /api/auth/collab-token lives 24h and Hocuspocus never
// re-checks it against the api_keys row, so a key allowed to mint one would keep editing for a
// day after revocation (spec: nothing may outlive revocation).
//
// `req.raw.apiKeyId` is set by JwtStrategy only for `api_key` tokens.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code.
import { ForbiddenException } from '@nestjs/common';

// `raw` is typed loosely because Fastify's IncomingMessage has no `apiKeyId`; JwtStrategy adds it.
export function refuseApiKeyAuth(req: { raw?: object }): void {
  if ((req.raw as { apiKeyId?: string } | undefined)?.apiKeyId) {
    throw new ForbiddenException('This action is not available to API keys');
  }
}
