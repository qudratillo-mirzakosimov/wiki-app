import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { renderWithProviders } from "@/test/render";
import { useGetInvitationQuery } from "@/features/workspace/queries/workspace-query.ts";
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
  useGetInvitationQuery: vi.fn(),
}));

const invitationQuery = vi.mocked(useGetInvitationQuery);

function mockInvitation(state: { data?: unknown; isError: boolean }) {
  invitationQuery.mockReturnValue(state as ReturnType<
    typeof useGetInvitationQuery
  >);
}

// The panel is the shared AuthLayout; these only prove the two forms still render inside it with
// every field and their existing title as the page's h1.
describe("InviteSignUpForm", () => {
  beforeEach(() =>
    mockInvitation({
      data: { id: "inv-1", email: "new@bolderapps.com", enforceSso: false },
      isError: false,
    }),
  );
  afterEach(cleanup);

  it("brands the screen for an invalid, used or revoked invitation", () => {
    mockInvitation({ data: undefined, isError: true });
    renderWithProviders(<InviteSignUpForm />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This invitation no longer works",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("complementary")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Back to sign in/ }).getAttribute("href"),
    ).toBe("/login");
  });

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
