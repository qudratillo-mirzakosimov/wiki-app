// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/lib/api-error.ts";
import {
  getApiKeys,
  IWorkspaceApiKey,
  revokeApiKey,
} from "@/oss/api-key/api-key-service";

// Same keys the sidebar's prefetch handlers use (components/settings/settings-queries.tsx).
export const apiKeyListKey = (adminView: boolean) =>
  ["api-key-list", adminView ? { adminView: true } : {}] as const;

export function useApiKeysQuery(
  adminView = false,
): UseQueryResult<{ items: IWorkspaceApiKey[] }, Error> {
  return useQuery({
    queryKey: apiKeyListKey(adminView),
    queryFn: () => getApiKeys({ adminView }),
  });
}

// Creation is deliberately NOT a useMutation: a mutation keeps its result (here the one-time
// token) in the mutation cache until garbage collection. The create modal calls createApiKey
// directly and holds the token only in its own state.
export function useRevokeApiKeyMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (apiKeyId) => revokeApiKey(apiKeyId),
    onSuccess: () => {
      notifications.show({ message: t("API key revoked") });
    },
    onError: (error) => {
      notifications.show({
        message: getApiErrorMessage(error, t("Failed to revoke API key")),
        color: "red",
      });
    },
    // Also on error: re-revoking an already revoked key is a 404, and the list is stale then.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-key-list"] });
    },
  });
}
