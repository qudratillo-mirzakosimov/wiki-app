import { Helmet } from "react-helmet-async";
import {
  PasswordResetExpired,
  PasswordResetForm,
} from "@/features/auth/components/password-reset-form";
import { useSearchParams } from "react-router-dom";
import { useVerifyUserTokenQuery } from "@/features/auth/queries/auth-query";
import { getAppName } from "@/lib/config.ts";
import { useTranslation } from "react-i18next";

export default function PasswordReset() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError } = useVerifyUserTokenQuery({
    token: searchParams.get("token"),
    type: "forgot-password",
  });
  const resetToken = searchParams.get("token");

  if (isLoading) {
    return <div></div>;
  }

  if (isError || !resetToken) {
    return (
      <>
        <Helmet>
          <title>{`${t("Password Reset")} - ${getAppName()}`}</title>
        </Helmet>
        <PasswordResetExpired />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t("Password Reset")} - ${getAppName()}`}</title>
      </Helmet>
      <PasswordResetForm resetToken={resetToken} />
    </>
  );
}
