import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { renderWithProviders } from "@/test/render";
import { InviteSignUpForm } from "./invite-sign-up-form";
import { SetupWorkspaceForm } from "./setup-workspace-form";

i18n.use(initReactI18next).init({
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

vi.mock("@/features/auth/hooks/use-auth", () => ({
  default: () => ({
    invitationSignup: vi.fn(),
    setupWorkspace: vi.fn(),
    isLoading: false,
  }),
}));
vi.mock("@/features/auth/hooks/use-redirect-if-authenticated.ts", () => ({
  useRedirectIfAuthenticated: () => {},
}));
vi.mock("@/features/workspace/queries/workspace-query.ts", () => ({
  useGetInvitationQuery: () => ({
    data: { id: "inv-1", email: "new@bolderapps.com", enforceSso: false },
    isError: false,
  }),
}));

// The panel is the shared AuthLayout; these only prove the two forms still render inside it with
// every field and their existing title as the page's h1.
describe("InviteSignUpForm", () => {
  afterEach(cleanup);

  it("keeps its fields and title inside the Ember layout", () => {
    renderWithProviders(<InviteSignUpForm />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Join the workspace" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "new@bolderapps.com",
    );
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeTruthy();
    expect(screen.getByRole("complementary")).toBeTruthy();
  });
});

describe("SetupWorkspaceForm", () => {
  afterEach(cleanup);

  it("keeps its fields and title inside the Ember layout", () => {
    renderWithProviders(<SetupWorkspaceForm />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Create workspace" }),
    ).toBeTruthy();
    for (const label of ["Workspace Name", "Your Name", "Your Email", "Password"]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "Create workspace" })).toBeTruthy();
    expect(screen.getByRole("complementary")).toBeTruthy();
  });
});
