// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import { Button, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SettingsTitle from "@/components/settings/settings-title.tsx";
import { getAppName, isApiKeysEnabled } from "@/lib/config.ts";
import ApiKeysTable from "@/oss/api-key/api-keys-table";
import CreateKeyModal from "@/oss/api-key/create-key-modal";

export default function UserApiKeysPage() {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  // The route exists regardless of the server's switch; with it off the page has nothing to show.
  if (!isApiKeysEnabled()) {
    return <Navigate to="/settings/account/profile" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{`${t("API keys")} - ${getAppName()}`}</title>
      </Helmet>
      <SettingsTitle title={t("API keys")} />

      <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
        <Text size="sm" c="dimmed">
          {t(
            "Personal keys let tools such as Claude act as you, so pages they write show you as the author.",
          )}
        </Text>
        <Button onClick={open} style={{ flexShrink: 0 }}>
          {t("Create key")}
        </Button>
      </Group>

      <ApiKeysTable />
      <CreateKeyModal opened={opened} onClose={close} />
    </>
  );
}
