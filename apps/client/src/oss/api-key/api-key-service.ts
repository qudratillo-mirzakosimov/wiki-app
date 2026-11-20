// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import api from "@/lib/api-client";

export type ApiKeyExpiry = "30d" | "90d" | "1y" | "never";

export interface IApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

// The admin overview. `creator` is null when the creator's user row is gone.
export interface IWorkspaceApiKey extends IApiKey {
  creator: { id: string; name: string; email: string } | null;
}

// Only `create` returns the token, and only once.
export interface ICreatedApiKey extends IApiKey {
  token: string;
}

export interface ICreateApiKey {
  name: string;
  expiresIn?: ApiKeyExpiry;
}

// The response interceptor already returns the body, so `.data` is the server's envelope
// payload (same as features/share/services/share-service.ts).
export async function getApiKeys(params?: {
  adminView?: boolean;
}): Promise<{ items: IWorkspaceApiKey[] }> {
  const req: any = await api.post(
    params?.adminView ? "/api-keys/workspace" : "/api-keys",
  );
  return req.data;
}

export async function createApiKey(
  data: ICreateApiKey,
): Promise<ICreatedApiKey> {
  const req: any = await api.post("/api-keys/create", data);
  return req.data;
}

export async function revokeApiKey(apiKeyId: string): Promise<void> {
  await api.post("/api-keys/revoke", { apiKeyId });
}
