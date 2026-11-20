// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import { useState } from "react";
import { Button, Alert, Badge, Table, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import { IconKey } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/empty-state.tsx";
import { formatLocalized, useDateFnsLocale } from "@/lib/date-locale.ts";
import { getApiErrorMessage } from "@/lib/api-error.ts";
import {
  useApiKeysQuery,
  useRevokeApiKeyMutation,
} from "@/oss/api-key/api-key-query";
import { IWorkspaceApiKey } from "@/oss/api-key/api-key-service";
import { isExpired } from "@/oss/api-key/api-key-utils";

interface Props {
  // Admin overview: every member's keys, with a Creator column.
  adminView?: boolean;
}

export default function ApiKeysTable({ adminView = false }: Props) {
  const { t } = useTranslation();
  const locale = useDateFnsLocale();
  const { data, isLoading, isError, error } = useApiKeysQuery(adminView);
  const revoke = useRevokeApiKeyMutation();
  // A second revoke of the same key is a 404, so the button stays disabled until its request
  // settles. A set, not one id, so revoking two keys quickly does not re-enable the first.
  const [revoking, setRevoking] = useState<Set<string>>(new Set());

  const setPending = (id: string, pending: boolean) =>
    setRevoking((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });

  const onRevoke = async (id: string) => {
    setPending(id, true);
    try {
      await revoke.mutateAsync(id);
    } catch {
      // Already reported by the mutation's onError.
    } finally {
      setPending(id, false);
    }
  };

  const confirmRevoke = (key: IWorkspaceApiKey) =>
    modals.openConfirmModal({
      title: t("Revoke API key"),
      children: (
        <Text size="sm">
          {t(
            "Anything using \"{{name}}\" will stop working immediately. This cannot be undone.",
            { name: key.name },
          )}
        </Text>
      ),
      centered: true,
      labels: { confirm: t("Revoke"), cancel: t("Cancel") },
      confirmProps: { color: "red" },
      onConfirm: () => onRevoke(key.id),
    });

  const date = (value: string) =>
    formatLocalized(value, "MMM dd, yyyy", "PP", locale);

  if (isError) {
    return (
      <Alert color="red">
        {getApiErrorMessage(error, t("Failed to load API keys"))}
      </Alert>
    );
  }

  if (!isLoading && data?.items.length === 0) {
    return <EmptyState icon={IconKey} title={t("No API keys")} />;
  }

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table verticalSpacing="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("Name")}</Table.Th>
            {adminView && <Table.Th>{t("Creator")}</Table.Th>}
            <Table.Th>{t("Created")}</Table.Th>
            <Table.Th>{t("Last used")}</Table.Th>
            <Table.Th>{t("Expires")}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.items.map((key) => (
            <Table.Tr key={key.id}>
              <Table.Td>
                <Text fz="sm" fw={500} lineClamp={1}>
                  {key.name}
                </Text>
              </Table.Td>
              {adminView && (
                <Table.Td>
                  {key.creator ? (
                    <>
                      <Text fz="sm" lineClamp={1}>
                        {key.creator.name}
                      </Text>
                      <Text fz="xs" c="dimmed" lineClamp={1}>
                        {key.creator.email}
                      </Text>
                    </>
                  ) : (
                    <Text fz="sm" c="dimmed">
                      {t("Unknown")}
                    </Text>
                  )}
                </Table.Td>
              )}
              <Table.Td>
                <Text fz="sm" style={{ whiteSpace: "nowrap" }}>
                  {date(key.createdAt)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" style={{ whiteSpace: "nowrap" }}>
                  {key.lastUsedAt ? date(key.lastUsedAt) : t("Never")}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" style={{ whiteSpace: "nowrap" }}>
                  {key.expiresAt ? date(key.expiresAt) : t("Never")}{" "}
                  {isExpired(key.expiresAt) && (
                    <Badge color="red" variant="light" size="sm">
                      {t("Expired")}
                    </Badge>
                  )}
                </Text>
              </Table.Td>
              <Table.Td>
                <Button
                  size="compact-sm"
                  variant="light"
                  color="red"
                  disabled={revoking.has(key.id)}
                  loading={revoking.has(key.id)}
                  onClick={() => confirmRevoke(key)}
                >
                  {t("Revoke")}
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
