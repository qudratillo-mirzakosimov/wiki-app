// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
import { useTranslation } from "react-i18next";

// Core shows this next to disabled items; there is no licence to upgrade to.
export function useUpgradeLabel(): string {
  const { t } = useTranslation();
  return t("Not available");
}
