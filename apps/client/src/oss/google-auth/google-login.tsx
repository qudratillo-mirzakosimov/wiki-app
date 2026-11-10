// Bolder fork: "Continue with Google" on the login page, plus the message for a sign-in the
// server turned away (it redirects to /login?google_error=<reason>, see
// apps/server/src/oss/google-auth). Renders nothing when the instance has no Google config.
import { Alert, Button, Divider } from "@mantine/core";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isGoogleAuthEnabled } from "@/lib/config.ts";

const MESSAGES: Record<string, string> = {
  not_a_member:
    "This Google account has no access here. Ask an admin to invite you, then accept the invitation first.",
  domain_not_allowed: "Sign in with your company Google account.",
  email_unverified: "Your Google email address is not verified.",
  cancelled: "Google sign-in was cancelled.",
  failed: "Google sign-in failed. Please try again.",
};

export function GoogleLogin() {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  if (!isGoogleAuthEnabled()) return null;

  const reason = params.get("google_error");
  const message = reason ? (MESSAGES[reason] ?? MESSAGES.failed) : null;

  return (
    <>
      {message && (
        <Alert color="red" variant="light" mb="md" role="alert">
          {t(message)}
        </Alert>
      )}

      <Button
        component="a"
        // A full page navigation, not fetch: the server answers with a redirect to Google.
        href="/api/auth/google"
        fullWidth
        variant="default"
        leftSection={<IconBrandGoogle size={18} />}
      >
        {t("Continue with Google")}
      </Button>

      <Divider label={t("or")} labelPosition="center" my="md" />
    </>
  );
}
