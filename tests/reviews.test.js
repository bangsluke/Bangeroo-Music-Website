import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initReviews, __testables__ } from "../src/js/reviews.js";
import { initEpRelease } from "../src/js/ep-release.js";

const reviews = {
  intro: "Selection of review phrases.",
  laughIntro: "Positive ones that made me laugh:",
  positive: ["epic voice", "unique underground vibe", "super cool stuff"],
  paidIntro: "Given that I had to pay for the reviews:",
  negative: ["too leftfield", "not catchy"],
  punchline: "And I remember - I PAID these people"
};

const ep = {
  title: "Finally",
  blurb: "First collection of songs.",
  artwork: null,
  artworkNote: "Artwork pending"
};

function mockReducedMotion(matches) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn()
    }))
  );
}

describe("ep review deck", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="ep-release">
        <div id="ep-release-content"></div>
      </div>
    `;
    mockReducedMotion(true);
  });

  afterEach(() => {
    const mount = document.querySelector("#ep-reviews");
    if (mount) {
      __testables__.clearActiveTimers(mount);
    }
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("mounts Reviews title, paid footnote, then rotating deck", () => {
    initEpRelease({ ep });
    initReviews({ reviews });

    const content = document.querySelector("#ep-release-content");
    const deck = content.querySelector("#ep-reviews");
    const title = deck.querySelector(".reviews-deck__title");
    const footnote = deck.querySelector(".reviews-deck__footnote");
    const stage = deck.querySelector(".reviews-deck__stage");

    expect(title.textContent).toBe("Reviews");
    expect(footnote.textContent).toBe(__testables__.FOOTNOTE);
    expect(title.nextElementSibling).toBe(footnote);
    expect(footnote.nextElementSibling).toBe(stage);
    expect(deck.querySelector(".reviews-deck__purchased")).toBeNull();
    expect(deck.querySelector(".reviews-deck__tag")).toBeNull();
    expect(content.querySelector(".ep-release__blurb").nextElementSibling).toBe(deck);
  });

  it("styles phrases by tone and auto-advances a shuffled deck", () => {
    vi.useFakeTimers();
    initEpRelease({ ep });
    initReviews({ reviews });

    const mount = document.querySelector("#ep-reviews");
    const deck = mount.__getDeck();
    expect(deck).toHaveLength(5);
    expect(deck.every((card) => card.tone === "positive" || card.tone === "negative")).toBe(
      true
    );

    const phrase = document.querySelector(".reviews-deck__phrase");
    expect(phrase.textContent).toBe(__testables__.quoteText(deck[0].quote));
    expect(phrase.classList.contains(`reviews-deck__phrase--${deck[0].tone}`)).toBe(true);

    vi.advanceTimersByTime(__testables__.DECK_INTERVAL_MS);
    expect(document.querySelector(".reviews-deck__phrase").textContent).toBe(
      __testables__.quoteText(deck[1].quote)
    );
  });

  it("targets 70% of the card inner height for phrase size", () => {
    expect(__testables__.PHRASE_FILL_RATIO).toBe(0.7);
  });

  it("shows the punchline inside the box after a full cycle then reshuffles", () => {
    vi.useFakeTimers();
    initEpRelease({ ep });
    initReviews({ reviews });

    const mount = document.querySelector("#ep-reviews");
    for (let i = 0; i < 5; i += 1) {
      mount.__advanceDeck();
    }

    expect(mount.__isShowingPunchline()).toBe(true);
    const phrase = document.querySelector(".reviews-deck__phrase");
    const card = document.querySelector(".reviews-deck__card");
    expect(phrase.textContent).toBe(reviews.punchline);
    expect(phrase.classList.contains("reviews-deck__phrase--punchline")).toBe(true);
    expect(card.classList.contains("reviews-deck__card--punchline")).toBe(true);
    expect(card.hidden).toBe(false);
    expect(document.querySelector(".reviews-deck__punchline")).toBeNull();

    mount.__advanceDeck();
    expect(mount.__isShowingPunchline()).toBe(false);
    expect(card.classList.contains("reviews-deck__card--punchline")).toBe(false);
  });

  it("no-ops when the mount is absent", () => {
    document.body.innerHTML = "";
    expect(() => initReviews({ reviews })).not.toThrow();
  });
});
