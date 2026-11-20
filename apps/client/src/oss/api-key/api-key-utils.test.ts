// Bolder fork: tests for the API key UI helpers (AGPL-3.0).
import { describe, expect, it } from "vitest";
import { buildConnectorUrl, isExpired } from "./api-key-utils";

describe("buildConnectorUrl", () => {
  it("puts the token in the edit MCP path", () => {
    expect(buildConnectorUrl("https://wiki.example.com", "abc.def")).toBe(
      "https://wiki.example.com/gateway/mcp-edit/abc.def",
    );
  });
});

describe("isExpired", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");
  it("is never expired without an expiry date", () => {
    expect(isExpired(null, now)).toBe(false);
  });
  it("compares against the given time", () => {
    expect(isExpired("2026-11-20T11:59:59Z", now)).toBe(true);
    expect(isExpired("2026-11-21T00:00:00Z", now)).toBe(false);
  });
});
