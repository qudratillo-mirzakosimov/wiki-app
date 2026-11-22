import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { GoogleLogin } from "@/oss/google-auth/google-login";
import { renderWithProviders } from "@/test/render";

// Under vitest import.meta.env.DEV is true, so getConfigValue reads process.env.
describe("GoogleLogin", () => {
  const original = process.env.GOOGLE_AUTH_ENABLED;

  afterEach(() => {
    cleanup();
    if (original === undefined) delete process.env.GOOGLE_AUTH_ENABLED;
    else process.env.GOOGLE_AUTH_ENABLED = original;
  });

  it("renders nothing when Google is off", () => {
    process.env.GOOGLE_AUTH_ENABLED = "false";
    const { container } = renderWithProviders(<GoogleLogin />);
    // MantineProvider injects its own <style> into the container; nothing else may render.
    const rendered = Array.from(container.children).filter(
      (el) => el.tagName !== "STYLE",
    );
    expect(rendered).toHaveLength(0);
    expect(screen.queryByText("or with email")).toBeNull();
  });

  it("links to /api/auth/google with Google's own G", () => {
    process.env.GOOGLE_AUTH_ENABLED = "true";
    const { container } = renderWithProviders(<GoogleLogin />);
    const link = screen.getByRole("link", { name: "Continue with Google" });
    expect(link.getAttribute("href")).toBe("/api/auth/google");

    const svg = link.querySelector("svg");
    expect(svg).not.toBeNull();
    const fills = Array.from(svg!.querySelectorAll("path")).map((p) =>
      p.getAttribute("fill"),
    );
    for (const fill of ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]) {
      expect(fills).toContain(fill);
    }
    expect(container.querySelector(".tabler-icon")).toBeNull();
  });

  it("shows the Bolder Google subline and the email divider", () => {
    process.env.GOOGLE_AUTH_ENABLED = "true";
    renderWithProviders(<GoogleLogin />);
    expect(screen.getByText("Use your Bolder Google account.")).toBeTruthy();
    expect(screen.getByText("or with email")).toBeTruthy();
  });

  it("still shows the error for ?google_error=not_a_member", () => {
    process.env.GOOGLE_AUTH_ENABLED = "true";
    renderWithProviders(<GoogleLogin />, {
      route: "/login?google_error=not_a_member",
    });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe(
      "This Google account has no access here. Ask an admin to invite you, then accept the invitation first.",
    );
  });
});
