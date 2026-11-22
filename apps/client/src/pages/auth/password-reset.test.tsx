import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { renderWithProviders } from "@/test/render";
import { useVerifyUserTokenQuery } from "@/features/auth/queries/auth-query";
import PasswordReset from "./password-reset";

// No resources: every key is its own English text, as in the app's fallback.
i18n.use(initReactI18next).init({
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

vi.mock("@/features/auth/queries/auth-query", () => ({
  useVerifyUserTokenQuery: vi.fn(),
}));
vi.mock("@/features/auth/hooks/use-auth", () => ({
  default: () => ({ passwordReset: vi.fn(), isLoading: false }),
}));
vi.mock("@/features/auth/hooks/use-redirect-if-authenticated.ts", () => ({
  useRedirectIfAuthenticated: () => {},
}));

const verifyQuery = vi.mocked(useVerifyUserTokenQuery);

function mockQuery(state: { isError: boolean; isLoading: boolean }) {
  verifyQuery.mockReturnValue({ data: undefined, ...state } as ReturnType<
    typeof useVerifyUserTokenQuery
  >);
}

describe("PasswordReset page", () => {
  beforeEach(() => verifyQuery.mockReset());
  afterEach(cleanup);

  it("shows the expired screen for an invalid token", () => {
    mockQuery({ isError: true, isLoading: false });
    renderWithProviders(<PasswordReset />, { route: "/password-reset?token=x" });
    expect(screen.getByText("This link no longer works")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Send a new link" }).getAttribute("href"),
    ).toBe("/forgot-password");
    expect(
      screen.getByRole("link", { name: /Back to sign in/ }).getAttribute("href"),
    ).toBe("/login");
  });

  it("shows the expired screen when the token is missing", () => {
    mockQuery({ isError: false, isLoading: false });
    renderWithProviders(<PasswordReset />, { route: "/password-reset" });
    expect(screen.getByText("This link no longer works")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Send a new link" }).getAttribute("href"),
    ).toBe("/forgot-password");
  });

  it("shows the form for a valid token", () => {
    mockQuery({ isError: false, isLoading: false });
    renderWithProviders(<PasswordReset />, { route: "/password-reset?token=x" });
    expect(screen.getByText("Set a new password")).toBeTruthy();
    expect(screen.getByText("At least 8 characters.")).toBeTruthy();
  });
});
