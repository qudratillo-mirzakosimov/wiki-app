import { z } from "zod/v4";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import useAuth from "@/features/auth/hooks/use-auth";
import {
  TextInput,
  Button,
  PasswordInput,
  Anchor,
  Group,
} from "@mantine/core";
import { useRedirectIfAuthenticated } from "@/features/auth/hooks/use-redirect-if-authenticated.ts";
import { Link } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";
import { useTranslation } from "react-i18next";
import SsoLogin from "@/ee/components/sso-login.tsx";
import { useWorkspacePublicDataQuery } from "@/features/workspace/queries/workspace-query.ts";
import { Error404 } from "@/components/ui/error-404.tsx";
import React from "react";
import { AuthHeading, AuthLayout } from "./auth-layout.tsx";
import { GoogleLogin } from "@/oss/google-auth/google-login.tsx";

const formSchema = z.object({
  email: z
    .email()
    .min(1, { message: "email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuth();
  useRedirectIfAuthenticated();
  const {
    data,
    isLoading: isDataLoading,
    isError,
    error,
  } = useWorkspacePublicDataQuery();

  const form = useForm<FormValues>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    await signIn(data);
  }

  function handleValidationFailure(errors: Record<string, unknown>) {
    const firstInvalidId = Object.keys(errors)[0];
    if (firstInvalidId) {
      document.getElementById(firstInvalidId)?.focus();
    }
  }

  if (isDataLoading) {
   return null;
  }

  if (isError && error?.["response"]?.status === 404) {
    return <Error404 />;
  }

  return (
    <AuthLayout>
      <AuthHeading title={t("Sign in")} />

      <SsoLogin />
      <GoogleLogin />

      {!data?.enforceSso && (
        <form onSubmit={form.onSubmit(onSubmit, handleValidationFailure)}>
          <TextInput
            id="email"
            type="email"
            label={t("Email")}
            placeholder="email@example.com"
            variant="default"
            radius="md"
            autoComplete="email"
            errorProps={{ role: "alert" }}
            {...form.getInputProps("email")}
          />

          <PasswordInput
            id="password"
            label={t("Password")}
            placeholder={t("Your password")}
            variant="default"
            radius="md"
            mt="md"
            autoComplete="current-password"
            errorProps={{ role: "alert" }}
            visibilityToggleButtonProps={{
              "aria-label": t("Toggle password visibility"),
              "aria-hidden": false,
              tabIndex: 0,
            }}
            {...form.getInputProps("password")}
          />

          <Group justify="flex-end" mt="xs">
            <Anchor
              to={APP_ROUTE.AUTH.FORGOT_PASSWORD}
              component={Link}
              underline="never"
              size="sm"
            >
              {t("Forgot password?")}
            </Anchor>
          </Group>

          <Button
            type="submit"
            fullWidth
            radius="xl"
            mt="lg"
            loading={isLoading}
          >
            {t("Sign in")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
