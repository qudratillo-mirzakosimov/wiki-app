import React from "react";
import { Anchor, Box, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import classes from "./auth.module.css";
import { getAppName, getLoginHeadline } from "@/lib/config";
import APP_ROUTE from "@/lib/app-route.ts";

type AuthLayoutProps = {
  children: React.ReactNode;
};

// Bolder fork: the "Ember split". A black brand panel that is identical on every auth page and in
// both colour schemes, beside a form column that follows the theme. The panel stays in the
// accessibility tree on purpose: the instance name and headline tell a visitor which wiki this is.
export function AuthLayout({ children }: AuthLayoutProps) {
  const appName = getAppName();
  return (
    <div className={classes.split}>
      <aside className={classes.panel}>
        <img
          className={classes.lockup}
          src="/brand/logo-horizontal-white.svg"
          alt={appName}
        />
        <div>
          <div className={classes.label}>{appName}</div>
          {/* h2, because each page's own title (AuthHeading) is the h1. */}
          <h2 className={classes.headline}>
            {getLoginHeadline()}
            <span className={classes.period}>.</span>
          </h2>
        </div>
      </aside>
      <main className={classes.formColumn}>
        <div className={classes.formInner}>{children}</div>
      </main>
    </div>
  );
}

type AuthHeadingProps = {
  title: string;
  subtitle?: React.ReactNode;
};

// Bolder fork: the title + muted subline every Ember auth page opens with.
export function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  return (
    <div className={classes.heading}>
      <Title order={1} fz={26} fw={700}>
        {title}
      </Title>
      {subtitle && (
        <Text size="sm" c="dimmed" mt={6}>
          {subtitle}
        </Text>
      )}
    </div>
  );
}

type AuthStatusRingProps = {
  tone: "brand" | "muted";
  symbol: "check" | "alert";
};

// Bolder fork: the ring above a status page's title (link sent, link expired, ...). Decorative:
// the heading beside it carries the meaning, so it is hidden from screen readers.
export function AuthStatusRing({ tone, symbol }: AuthStatusRingProps) {
  return (
    <div className={classes.ring} data-tone={tone} aria-hidden="true">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {symbol === "check" ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        ) : (
          <>
            <path d="M12 5v9" />
            <path d="M12 18.5v.5" />
          </>
        )}
      </svg>
    </div>
  );
}

// Bolder fork: the arrow is hidden so the link's accessible name is just "Back to sign in".
export function BackToSignIn() {
  return (
    <Box ta="center" mt="lg">
      <Anchor component={Link} to={APP_ROUTE.AUTH.LOGIN} size="sm" fw={600}>
        <span aria-hidden="true">← </span>
        Back to sign in
      </Anchor>
    </Box>
  );
}
