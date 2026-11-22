import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { renderWithProviders } from "@/test/render";
import { ForgotPasswordForm } from "./forgot-password-form";

// Trans renders nothing without an i18next instance (t() falls back to the key, Trans does not).
// No resources: every key is its own English text, as in the app's fallback.
i18n.use(initReactI18next).init({
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const forgotPassword = vi.fn();

vi.mock("@/features/auth/hooks/use-auth", () => ({
  default: () => ({ forgotPassword, isLoading: false }),
}));
vi.mock("@/features/auth/hooks/use-redirect-if-authenticated.ts", () => ({
  useRedirectIfAuthenticated: () => {},
}));

async function send(email: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
}

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    forgotPassword.mockReset().mockResolvedValue(true);
  });
  afterEach(cleanup);

  it("shows Check your inbox with the email after sending", async () => {
    renderWithProviders(<ForgotPasswordForm />);
    await send("a@b.co");
    expect(await screen.findByText("Check your inbox")).toBeTruthy();
    expect(screen.getByText("a@b.co")).toBeTruthy();
    expect(forgotPassword).toHaveBeenCalledWith({ email: "a@b.co" });
  });

  it("Use a different email returns to an empty form", async () => {
    renderWithProviders(<ForgotPasswordForm />);
    await send("a@b.co");
    fireEvent.click(
      await screen.findByRole("button", { name: "Use a different email" }),
    );
    expect(await screen.findByText("Forgot your password?")).toBeTruthy();
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("");
  });

  it("stays on the form when sending fails", async () => {
    forgotPassword.mockResolvedValue(false);
    renderWithProviders(<ForgotPasswordForm />);
    await send("a@b.co");
    await waitFor(() => expect(forgotPassword).toHaveBeenCalled());
    expect(screen.queryByText("Check your inbox")).toBeNull();
    expect(screen.getByText("Forgot your password?")).toBeTruthy();
  });
});
