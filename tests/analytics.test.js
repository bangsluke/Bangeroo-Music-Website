import { describe, expect, it, vi } from "vitest";
import { trackEvent } from "../src/js/analytics.js";

describe("trackEvent", () => {
  it("calls umami.track when available", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("sample-event", { value: 1 });

    expect(track).toHaveBeenCalledWith("sample-event", { value: 1 });
  });

  it("fails safely when umami is unavailable", () => {
    window.umami = undefined;

    expect(() => trackEvent("sample-event")).not.toThrow();
  });
});
