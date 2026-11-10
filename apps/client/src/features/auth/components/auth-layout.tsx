import React from "react";
import { Group, Text } from "@mantine/core";
import classes from "./auth.module.css";
import { getAppName } from "@/lib/config";
import { BrandLogo } from "@/oss/brand/brand-logo";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Group justify="center" gap={8} className={classes.logo}>
        <BrandLogo size={28} />
        <Text size="28px" fw={700} style={{ userSelect: "none" }}>
          {getAppName()}
        </Text>
      </Group>
      <main>{children}</main>
    </>
  );
}
