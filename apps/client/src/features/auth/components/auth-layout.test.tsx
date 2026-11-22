import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { AuthLayout, BackToSignIn } from "./auth-layout";
import { renderWithProviders } from "@/test/render";

// Under vitest import.meta.env.DEV is true, so getConfigValue reads process.env.
describe("AuthLayout", () => {
  const originalHeadline = process.env.LOGIN_HEADLINE;
  const originalName = process.env.APP_NAME;

  afterEach(() => {
    cleanup();
    if (originalHeadline === undefined) delete process.env.LOGIN_HEADLINE;
    else process.env.LOGIN_HEADLINE = originalHeadline;
    if (originalName === undefined) delete process.env.APP_NAME;
    else process.env.APP_NAME = originalName;
  });

  it("shows the default headline with one orange period", () => {
    delete process.env.LOGIN_HEADLINE;
    renderWithProviders(<AuthLayout>form</AuthLayout>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("EVERYTHING WE KNOW.");
    // The period is coloured separately, so it must be its own element.
    const period = heading.querySelector("span");
    expect(period).not.toBeNull();
    expect(period!.textContent).toBe(".");
  });

  it("uses LOGIN_HEADLINE and the instance name", () => {
    process.env.LOGIN_HEADLINE = "OUR CLIENT GUIDE.";
    process.env.APP_NAME = "Bolder Apps Client Guide";
    renderWithProviders(<AuthLayout>form</AuthLayout>);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "OUR CLIENT GUIDE.",
    );
    expect(screen.getByText("Bolder Apps Client Guide")).toBeTruthy();
    const lockup = screen.getByRole("img", { name: "Bolder Apps Client Guide" });
    expect(lockup.getAttribute("src")).toBe("/brand/logo-horizontal-white.svg");
  });

  it("renders children inside main", () => {
    renderWithProviders(
      <AuthLayout>
        <p>the form</p>
      </AuthLayout>,
    );
    const main = screen.getByRole("main");
    expect(main.contains(screen.getByText("the form"))).toBe(true);
  });

  it("BackToSignIn links to /login", () => {
    renderWithProviders(<BackToSignIn />);
    const link = screen.getByRole("link", { name: /Back to sign in/ });
    expect(link.getAttribute("href")).toBe("/login");
  });
});
