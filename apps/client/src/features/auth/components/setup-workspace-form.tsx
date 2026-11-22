import * as React from "react";
import { z } from "zod/v4";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { TextInput, Button, PasswordInput, Anchor, Text } from "@mantine/core";
import useAuth from "@/features/auth/hooks/use-auth";
import { useTranslation } from "react-i18next";
import SsoCloudSignup from "@/ee/components/sso-cloud-signup.tsx";
import { isCloud } from "@/lib/config.ts";
import { Link } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";
import { AuthHeading, AuthLayout } from "./auth-layout.tsx";

const formSchema = z.object({
  workspaceName: z.string().trim().max(50).optional(),
  name: z.string().min(1, { message: "Name is required" }).max(50),
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});
type FormValues = z.infer<typeof formSchema>;

export function SetupWorkspaceForm() {
  const { t } = useTranslation();
  const { setupWorkspace, isLoading } = useAuth();
  // useRedirectIfAuthenticated();

  const form = useForm<FormValues>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      workspaceName: "",
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    await setupWorkspace(data);
  }

  return (
    <AuthLayout>
      <AuthHeading title={t("Create workspace")} />

      {isCloud() && <SsoCloudSignup />}

      <form onSubmit={form.onSubmit(onSubmit)}>
        {!isCloud() && (
          <TextInput
            id="workspaceName"
            type="text"
            label={t("Workspace Name")}
            placeholder={t("e.g ACME Inc")}
            variant="default"
            radius="md"
            {...form.getInputProps("workspaceName")}
          />
        )}

        <TextInput
          id="name"
          type="text"
          label={t("Your Name")}
          placeholder={t("enter your full name")}
          variant="default"
          radius="md"
          mt="md"
          {...form.getInputProps("name")}
        />

        <TextInput
          id="email"
          type="email"
          label={t("Your Email")}
          placeholder="email@example.com"
          variant="default"
          radius="md"
          mt="md"
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label={t("Password")}
          placeholder={t("Enter a strong password")}
          variant="default"
          radius="md"
          mt="md"
          visibilityToggleButtonProps={{
            "aria-label": t("Toggle password visibility"),
            "aria-hidden": false,
            tabIndex: 0,
          }}
          {...form.getInputProps("password")}
        />
        <Button
          type="submit"
          fullWidth
          radius="xl"
          mt="xl"
          loading={isLoading}
        >
          {t("Create workspace")}
        </Button>
      </form>

      {isCloud() && (
        <Text ta="center" mt="lg">
          {t("Already part of an existing workspace?")}{" "}
          <Anchor
            component={Link}
            to={APP_ROUTE.AUTH.SELECT_WORKSPACE}
            fw={500}
          >
            {t("Sign-in")}
          </Anchor>
        </Text>
      )}
    </AuthLayout>
  );
}
