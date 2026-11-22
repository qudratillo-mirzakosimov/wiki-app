import { z } from "zod/v4";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import useAuth from "@/features/auth/hooks/use-auth";
import { Button, PasswordInput } from "@mantine/core";
import { Link } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";
import { useRedirectIfAuthenticated } from "@/features/auth/hooks/use-redirect-if-authenticated.ts";
import { useTranslation } from "react-i18next";
import {
  AuthHeading,
  AuthLayout,
  AuthStatusRing,
  BackToSignIn,
} from "./auth-layout.tsx";

const formSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});
type FormValues = z.infer<typeof formSchema>;

interface PasswordResetFormProps {
  resetToken?: string;
}

export function PasswordResetForm({ resetToken }: PasswordResetFormProps) {
  const { t } = useTranslation();
  const { passwordReset, isLoading } = useAuth();
  useRedirectIfAuthenticated();

  const form = useForm<FormValues>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      newPassword: "",
    },
  });

  async function onSubmit(data: FormValues) {
    await passwordReset({
      token: resetToken,
      newPassword: data.newPassword,
    });
  }

  return (
    <AuthLayout>
      <AuthHeading
        title={t("Set a new password")}
        subtitle={t("You'll be signed in right after.")}
      />

      <form onSubmit={form.onSubmit(onSubmit)}>
        <PasswordInput
          label={t("New password")}
          description={t("At least 8 characters.")}
          placeholder={t("Your new password")}
          variant="default"
          radius="md"
          visibilityToggleButtonProps={{
            "aria-label": t("Toggle password visibility"),
            "aria-hidden": false,
            tabIndex: 0,
          }}
          {...form.getInputProps("newPassword")}
        />

        <Button
          type="submit"
          fullWidth
          radius="xl"
          mt="lg"
          loading={isLoading}
        >
          {t("Set password")}
        </Button>
      </form>
    </AuthLayout>
  );
}

// Bolder fork: shown when the reset link is invalid, used or expired. Offers the one useful next
// step (ask for a new link) instead of the old dead-end "Goto login page".
export function PasswordResetExpired() {
  const { t } = useTranslation();
  return (
    <AuthLayout>
      <AuthStatusRing tone="muted" symbol="alert" />
      <AuthHeading
        title={t("This link no longer works")}
        subtitle={t(
          "Reset links work once and expire after a while. Ask for a new one.",
        )}
      />
      <Button
        component={Link}
        to={APP_ROUTE.AUTH.FORGOT_PASSWORD}
        fullWidth
        radius="xl"
      >
        {t("Send a new link")}
      </Button>
      <BackToSignIn />
    </AuthLayout>
  );
}
