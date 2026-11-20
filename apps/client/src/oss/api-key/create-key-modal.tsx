// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import { useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { getAppUrl } from "@/lib/config.ts";
import { getApiErrorMessage } from "@/lib/api-error.ts";
import { useClipboard } from "@/hooks/use-clipboard";
import { ApiKeyExpiry, createApiKey } from "@/oss/api-key/api-key-service";
import { buildConnectorUrl, DEFAULT_EXPIRY } from "@/oss/api-key/api-key-utils";

interface Props {
  opened: boolean;
  onClose: () => void;
}

// What the person sees after creating: the token and the connector URL built from it. Both
// exist only in this component's state and are dropped when the modal closes.
interface Shown {
  token: string;
  connectorUrl: string;
}

export default function CreateKeyModal({ opened, onClose }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [expiresIn, setExpiresIn] = useState<ApiKeyExpiry>(DEFAULT_EXPIRY);
  const [submitting, setSubmitting] = useState(false);
  const [shown, setShown] = useState<Shown | null>(null);

  const expiryOptions = [
    { value: "30d", label: t("30 days") },
    { value: "90d", label: t("90 days") },
    { value: "1y", label: t("1 year") },
    { value: "never", label: t("No expiry") },
  ];

  const handleClose = () => {
    // Closing mid-request would let the token land in state after the modal is gone.
    if (submitting) return;
    setShown(null);
    setName("");
    setExpiresIn(DEFAULT_EXPIRY);
    onClose();
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const created = await createApiKey({ name: trimmed, expiresIn });
      setShown({
        token: created.token,
        connectorUrl: buildConnectorUrl(getAppUrl(), created.token),
      });
      queryClient.invalidateQueries({ queryKey: ["api-key-list"] });
    } catch (error) {
      notifications.show({
        message: getApiErrorMessage(error, t("Failed to create API key")),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={shown ? t("API key created") : t("Create API key")}
      centered
      // The token is shown once; a stray click outside must not throw it away.
      closeOnClickOutside={!shown && !submitting}
      closeOnEscape={!submitting}
      withCloseButton={!submitting}
    >
      {shown ? (
        <Stack>
          <Text size="sm" fw={500} c="red">
            {t("Copy it now. You won't be able to see it again.")}
          </Text>
          <CopyField label={t("Token")} value={shown.token} />
          <CopyField
            label={t("Connector URL")}
            description={t(
              "For claude.ai connectors. The URL contains the token, so treat it like a password.",
            )}
            value={shown.connectorUrl}
          />
          <Group justify="flex-end">
            <Button onClick={handleClose}>{t("Done")}</Button>
          </Group>
        </Stack>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <Stack>
            <TextInput
              label={t("Name")}
              placeholder={t("e.g. Claude on my laptop")}
              maxLength={100}
              data-autofocus
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <Select
              label={t("Expires")}
              data={expiryOptions}
              value={expiresIn}
              allowDeselect={false}
              onChange={(v) => v && setExpiresIn(v as ApiKeyExpiry)}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={handleClose} disabled={submitting}>
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!name.trim()}
              >
                {t("Create")}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

function CopyField({
  label,
  description,
  value,
}: {
  label: string;
  description?: string;
  value: string;
}) {
  const { t } = useTranslation();
  const clipboard = useClipboard({ timeout: 2000 });

  return (
    <TextInput
      label={label}
      description={description}
      value={value}
      readOnly
      onFocus={(e) => e.currentTarget.select()}
      rightSection={
        <Tooltip label={clipboard.copied ? t("Copied") : t("Copy")} withArrow>
          <ActionIcon
            variant="subtle"
            color={clipboard.copied ? "teal" : "gray"}
            aria-label={t("Copy")}
            onClick={() => clipboard.copy(value)}
          >
            {clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      }
    />
  );
}
