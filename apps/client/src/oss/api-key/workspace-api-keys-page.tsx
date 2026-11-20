// Bolder fork: personal API keys settings UI. Written from scratch (AGPL-3.0); no Enterprise
// code is used. See oss/README.md.
import { Text } from "@mantine/core";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SettingsTitle from "@/components/settings/settings-title.tsx";
import { getAppName, isApiKeysEnabled } from "@/lib/config.ts";
import ApiKeysTable from "@/oss/api-key/api-keys-table";

// Admin/owner only: the server answers 403 to anyone else, which the table shows as an error.
export default function WorkspaceApiKeysPage() {
  const { t } = useTranslation();

  if (!isApiKeysEnabled()) {
    return <Navigate to="/settings/account/profile" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{`${t("API management")} - ${getAppName()}`}</title>
      </Helmet>
      <SettingsTitle title={t("API management")} />

      <Text size="sm" c="dimmed" mb="md">
        {t("Every member's API keys. Revoking a key stops it immediately.")}
      </Text>

      <ApiKeysTable adminView />
    </>
  );
}
