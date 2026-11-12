import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getApiErrorMessage } from "./api-error";

// i18next is not initialised here, so i18n.t returns the key: the English text.
function apiError(status: number | undefined, message?: unknown): AxiosError {
  const err = new AxiosError("Request failed");
  if (status !== undefined) {
    err.response = {
      status,
      statusText: "",
      data: message === undefined ? {} : { message, statusCode: status },
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return err;
}

const FALLBACK = "Failed to create space";

describe("getApiErrorMessage", () => {
  it("keeps a specific, readable server message", () => {
    expect(getApiErrorMessage(apiError(400, "Group name already exists"), FALLBACK)).toBe(
      "Group name already exists",
    );
    expect(
      getApiErrorMessage(apiError(401, "Email or password does not match")),
    ).toBe("Email or password does not match");
    expect(
      getApiErrorMessage(apiError(403, "You can only edit your own comments")),
    ).toBe("You can only edit your own comments");
  });

  it("explains a bare 403 instead of showing 'Forbidden'", () => {
    const msg = getApiErrorMessage(apiError(403, "Forbidden"), FALLBACK);
    expect(msg).toMatch(/don't have permission/);
    expect(getApiErrorMessage(apiError(403), FALLBACK)).toBe(msg);
  });

  it("explains bare 401 and 404", () => {
    expect(getApiErrorMessage(apiError(401, "Unauthorized"))).toMatch(/session has expired/);
    expect(getApiErrorMessage(apiError(404, "Not Found"))).toMatch(/couldn't find that/);
  });

  it("uses the fallback for developer-facing validation text", () => {
    expect(getApiErrorMessage(apiError(400, "spaceId is required"), FALLBACK)).toBe(FALLBACK);
    expect(
      getApiErrorMessage(apiError(400, ["email must be an email", "name should not be empty"]), FALLBACK),
    ).toBe(FALLBACK);
    expect(getApiErrorMessage(apiError(404, "Cannot POST /api/nope"), FALLBACK)).toMatch(
      /couldn't find that/,
    );
    expect(getApiErrorMessage(apiError(400, "Bad Request"), FALLBACK)).toBe(FALLBACK);
  });

  it("keeps the readable parts of a mixed message array", () => {
    expect(
      getApiErrorMessage(apiError(400, ["Group name already exists", "userIds must be an array"])),
    ).toBe("Group name already exists");
  });

  it("never shows throttler, server or network internals", () => {
    expect(
      getApiErrorMessage(apiError(429, "ThrottlerException: Too Many Requests")),
    ).toMatch(/Too many attempts/);
    expect(getApiErrorMessage(apiError(500, "relation \"pages\" does not exist"))).toMatch(
      /went wrong on our side/,
    );
    expect(getApiErrorMessage(apiError(undefined))).toMatch(/Can't reach the server/);
  });

  it("hides licence checks left over from the Enterprise code", () => {
    expect(
      getApiErrorMessage(apiError(403, "This feature requires a valid license")),
    ).toBe("This feature isn't available on this wiki.");
  });

  it("returns the fallback for non-HTTP errors", () => {
    expect(getApiErrorMessage(new Error("boom"), FALLBACK)).toBe(FALLBACK);
    expect(getApiErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
  });
});
