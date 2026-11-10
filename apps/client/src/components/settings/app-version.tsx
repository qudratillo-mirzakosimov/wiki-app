import { useAppVersion } from "@/features/workspace/queries/workspace-query.ts";
import { getSourceCodeUrl, isCloud } from "@/lib/config.ts";
import classes from "@/components/settings/settings.module.css";
import { Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

// Bolder fork: upstream linked the version to docmost/docmost releases and badged newer
// upstream versions as an "update". Our releases come from the fork, so the badge is gone
// and the link is the AGPL-3.0 §13 source offer (SOURCE_CODE_URL).
export default function AppVersion() {
  const { t } = useTranslation();
  const { data: appVersion } = useAppVersion(!isCloud());
  const sourceUrl = getSourceCodeUrl();

  return (
    <div className={classes.text}>
      <Text size="sm" c="dimmed">
        {appVersion?.currentVersion && <>v{appVersion.currentVersion}</>}
        {sourceUrl && (
          <>
            {" · "}
            <Text
              span
              size="sm"
              c="dimmed"
              component="a"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              td="underline"
            >
              {t("Source code")}
            </Text>
          </>
        )}
      </Text>
    </div>
  );
}
