// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import type { ApiKeyExpiry } from "./api-key-service";

// "1y" matches the server's default (api-key dto): long enough not to re-mint constantly.
export const DEFAULT_EXPIRY: ApiKeyExpiry = "1y";

// The edit MCP server lives on the same host behind Caddy (`/gateway/*`). The token goes in
// the path because claude.ai connectors cannot send headers, which makes this URL a credential.
export function buildConnectorUrl(origin: string, token: string): string {
  return `${origin}/gateway/mcp-edit/${token}`;
}

export function isExpired(expiresAt: string | null, now: number = Date.now()) {
  return expiresAt !== null && new Date(expiresAt).getTime() <= now;
}
