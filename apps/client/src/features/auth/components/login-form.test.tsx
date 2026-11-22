import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { renderWithProviders } from "@/test/render";
import { useWorkspacePublicDataQuery } from "@/features/workspace/queries/workspace-query.ts";
import { LoginForm } from "./login-form";

i18n.use(initReactI18next).init({
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

vi.mock("@/features/auth/hooks/use-auth", () => ({
  default: () => ({ signIn: vi.fn(), isLoading: false }),
}));
vi.mock("@/features/auth/hooks/use-redirect-if-authenticated.ts", () => ({
  useRedirectIfAuthenticated: () => {},
}));
vi.mock("@/features/workspace/queries/workspace-query.ts", () => ({
  useWorkspacePublicDataQuery: vi.fn(),
}));

const publicData = vi.mocked(useWorkspacePublicDataQuery);

function mockPublicData(data: { enforceSso: boolean }) {
  publicData.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useWorkspacePublicDataQuery>);
}

describe("LoginForm", () => {
  beforeEach(() => publicData.mockReset());
  afterEach(cleanup);

  it("renders the email and password form inside the Ember layout", () => {
    mockPublicData({ enforceSso: false });
    renderWithProviders(<LoginForm />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Forgot password?" }).getAttribute("href"),
    ).toBe("/forgot-password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByRole("complementary")).toBeTruthy();
  });

  it("hides the email and password form when SSO is enforced", () => {
    mockPublicData({ enforceSso: true });
    renderWithProviders(<LoginForm />);
    expect(screen.queryByLabelText("Email")).toBeNull();
    expect(screen.queryByLabelText("Password")).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
  });
});
