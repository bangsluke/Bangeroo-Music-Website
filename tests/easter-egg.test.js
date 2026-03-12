import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initEasterEgg, __testables__ } from "../src/js/easter-egg.js";

describe("easter egg interaction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<button id="gigs-easter-egg">Click for upcoming gig dates</button>';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals message on click", () => {
    initEasterEgg();
    const button = document.querySelector("#gigs-easter-egg");
    button.click();

    expect(button.textContent).toBe(__testables__.REVEALED_LABEL);
    expect(button.classList.contains("revealed")).toBe(true);
  });

  it("resets message after five seconds", () => {
    initEasterEgg();
    const button = document.querySelector("#gigs-easter-egg");
    button.click();

    vi.advanceTimersByTime(__testables__.RESET_DELAY_MS);

    expect(button.classList.contains("revealed")).toBe(false);
    expect(button.textContent).toBe(__testables__.DEFAULT_LABEL);
  });
});
