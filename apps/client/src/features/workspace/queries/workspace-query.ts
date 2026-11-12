import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  changeMemberRole,
  getInvitationById,
  getPendingInvitations,
  getWorkspaceMembers,
  createInvitation,
  resendInvitation,
  revokeInvitation,
  getWorkspace,
  getWorkspacePublicData,
  getAppVersion,
  deleteWorkspaceMember,
  deactivateWorkspaceMember,
  activateWorkspaceMember,
} from "@/features/workspace/services/workspace-service";
import { IPagination, QueryParams } from "@/lib/types.ts";
import { notifications } from "@mantine/notifications";
import {
  ICreateInvite,
  IInvitation,
  IPublicWorkspace,
  IVersion,
  IWorkspace,
} from "@/features/workspace/types/workspace.types.ts";
import { IUser } from "@/features/user/types/user.types.ts";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/lib/api-error.ts";
import i18n from "@/i18n.ts";

export function useWorkspaceQuery(): UseQueryResult<IWorkspace, Error> {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: () => getWorkspace(),
  });
}

export function useWorkspacePublicDataQuery(): UseQueryResult<
  IPublicWorkspace,
  Error
> {
  return useQuery({
    queryKey: ["workspace-public"],
    queryFn: () => getWorkspacePublicData(),
  });
}

export function useWorkspaceMembersQuery(
  params?: QueryParams,
): UseQueryResult<IPagination<IUser>, Error> {
  return useQuery({
    queryKey: ["workspaceMembers", params],
    queryFn: () => getWorkspaceMembers(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteWorkspaceMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      userId: string;
    }
  >({
    mutationFn: (data) => deleteWorkspaceMember(data),
    onSuccess: (data, variables) => {
      notifications.show({ message: "Member deleted successfully" });
      queryClient.invalidateQueries({
        queryKey: ["workspaceMembers"],
      });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to delete member"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useDeactivateWorkspaceMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      userId: string;
    }
  >({
    mutationFn: (data) => deactivateWorkspaceMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaceMembers"],
      });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to deactivate member"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useActivateWorkspaceMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      userId: string;
    }
  >({
    mutationFn: (data) => activateWorkspaceMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaceMembers"],
      });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to activate member"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useChangeMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (data) => changeMemberRole(data),
    onSuccess: (data, variables) => {
      notifications.show({ message: "Member role updated successfully" });
      queryClient.refetchQueries({
        queryKey: ["workspaceMembers"],
      });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to change member role"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useWorkspaceInvitationsQuery(
  params?: QueryParams,
): UseQueryResult<IPagination<IInvitation>, Error> {
  return useQuery({
    queryKey: ["invitations", params],
    queryFn: () => getPendingInvitations(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateInvitationMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ICreateInvite>({
    mutationFn: (data) => createInvitation(data),
    onSuccess: (data, variables) => {
      notifications.show({ message: t("Invitation sent") });
      queryClient.refetchQueries({
        queryKey: ["invitations"],
      });
    },
    onError: (error) => {
      // Only workspace Admins/Owners may invite; the server answers a bare
      // "Forbidden". The UI hides the entry points from members, so this is the
      // fallback for a stale role. Group membership (e.g. "admin") does not count.
      const errorMessage =
        error["response"]?.status === 403
          ? t(
              "Only workspace admins can invite people. Ask an admin to send the invitation.",
            )
          : getApiErrorMessage(error, t("Failed to send invitation"));
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useResendInvitationMutation() {
  return useMutation<
    void,
    Error,
    {
      invitationId: string;
    }
  >({
    mutationFn: (data) => resendInvitation(data),
    onSuccess: (data, variables) => {
      notifications.show({ message: "Invitation resent" });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to resend invitation"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useRevokeInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      invitationId: string;
    }
  >({
    mutationFn: (data) => revokeInvitation(data),
    onSuccess: (data, variables) => {
      notifications.show({ message: "Invitation revoked" });
      queryClient.invalidateQueries({
        queryKey: ["invitations"],
      });
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        i18n.t("Failed to revoke invitation"),
      );
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useGetInvitationQuery(
  invitationId: string,
): UseQueryResult<IInvitation, Error> {
  return useQuery({
    queryKey: ["invitations", invitationId],
    queryFn: () => getInvitationById({ invitationId }),
    enabled: !!invitationId,
  });
}

export function useAppVersion(
  isEnabled: boolean,
): UseQueryResult<IVersion, Error> {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => getAppVersion(),
    staleTime: 60 * 60 * 1000, // 1 hr
    enabled: isEnabled,
    refetchOnMount: true,
  });
}
