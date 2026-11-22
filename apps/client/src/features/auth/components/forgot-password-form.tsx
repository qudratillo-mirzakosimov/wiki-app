import { useState } from "react";
import { z } from "zod/v4";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import useAuth from "@/features/auth/hooks/use-auth";
import { Button, TextInput } from "@mantine/core";
import { useRedirectIfAuthenticated } from "@/features/auth/hooks/use-redirect-if-authenticated.ts";
import { Trans, useTranslation } from "react-i18next";
import {
  AuthHeading,
  AuthLayout,
  AuthStatusRing,
  BackToSignIn,
} from "./auth-layout.tsx";

const formSchema = z.object({
  email: z
    .email()
    .min(1, { message: "Email is required" }),
});
type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuth();
  // Bolder fork: the address the link went to, kept so the confirmation can name it. Null means
  // the form is showing; the old boolean could not say which address to repeat back.
  const [sentTo, setSentTo] = useState<string | null>(null);
  useRedirectIfAuthenticated();

  const form = useForm<FormValues>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormValues) {
    if (await forgotPassword(data)) {
      setSentTo(data.email);
    }
  }

  function handleUseDifferentEmail() {
    form.reset();
    setSentTo(null);
  }

  if (sentTo !== null) {
    return (
      <AuthLayout>
        <AuthStatusRing tone="brand" symbol="check" />
        <AuthHeading
          title={t("Check your inbox")}
          subtitle={
            <Trans
              i18nKey="If <b>{{email}}</b> has an account, a reset link is on its way. It can take a minute. Check spam too."
              values={{ email: sentTo }}
              components={{ b: <b /> }}
            />
          }
        />
        <Button
          variant="default"
          radius="xl"
          fullWidth
          onClick={handleUseDifferentEmail}
        >
          {t("Use a different email")}
        </Button>
        <BackToSignIn />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeading
        title={t("Forgot your password?")}
        subtitle={t(
          "Enter your email and we'll send you a link to set a new one.",
        )}
      />

      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          id="email"
          type="email"
          label={t("Email")}
          placeholder="email@example.com"
          variant="default"
          radius="md"
          {...form.getInputProps("email")}
        />

        <Button
          type="submit"
          fullWidth
          radius="xl"
          mt="lg"
          loading={isLoading}
        >
          {t("Send reset link")}
        </Button>
      </form>
      <BackToSignIn />
    </AuthLayout>
  );
}
