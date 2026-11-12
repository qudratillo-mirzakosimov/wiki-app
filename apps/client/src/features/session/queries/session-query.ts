import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  getSessions,
  revokeSession,
  revokeAllSessions,
} from "@/features/session/services/session-service";
import { ISession } from "@/features/session/types/session.types";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/lib/api-error.ts";
import i18n from "@/i18n.ts";

export function useGetSessionsQuery(): UseQueryResult<ISession[], Error> {
  return useQuery({
    queryKey: ["session-list"],
    queryFn: () => getSessions(),
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<void, Error, { sessionId: string }>({
    mutationFn: (data) => revokeSession(data),
    onSuccess: () => {
      notifications.show({ message: t("Session revoked") });
      queryClient.invalidateQueries({ queryKey: ["session-list"] });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to revoke session"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useRevokeAllSessionsMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<void, Error, void>({
    mutationFn: () => revokeAllSessions(),
    onSuccess: () => {
      notifications.show({ message: t("All other sessions revoked") });
      queryClient.invalidateQueries({ queryKey: ["session-list"] });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to revoke sessions"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}
