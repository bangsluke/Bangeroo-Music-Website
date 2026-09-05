import { afterEach, describe, expect, it, vi } from "vitest";
import { initAnalytics, trackEvent } from "../src/js/analytics.js";

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

describe("initAnalytics", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("does not inject Umami when website id is unset", () => {
    initAnalytics();

    expect(document.querySelector('script[src*="umami"]')).toBeNull();
  });

  it("binds click handlers for data-umami-event elements", () => {
    const track = vi.fn();
    window.umami = { track };
    document.body.innerHTML =
      '<button type="button" data-umami-event="sample-click">Go</button>';

    initAnalytics();
    document.querySelector("button").click();

    expect(track).toHaveBeenCalledWith("sample-click", {});
  });
});
