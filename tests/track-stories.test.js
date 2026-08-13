import { describe, expect, it } from "vitest";
import { __testables__ } from "../src/js/track-stories.js";

describe("track stories", () => {
  it("toggles and closes story visibility class", () => {
    const card = document.createElement("article");
    card.className = "track-card";

    __testables__.toggleStory(card);
    expect(card.classList.contains("story-visible")).toBe(true);

    __testables__.closeStory(card);
    expect(card.classList.contains("story-visible")).toBe(false);
  });

  it("toggles and closes lyrics visibility class", () => {
    const card = document.createElement("article");
    card.className = "track-card";

    __testables__.toggleLyrics(card);
    expect(card.classList.contains("lyrics-visible")).toBe(true);

    __testables__.closeLyrics(card);
    expect(card.classList.contains("lyrics-visible")).toBe(false);
  });

  it("keeps story and lyrics panels mutually exclusive", () => {
    const card = document.createElement("article");
    card.className = "track-card";

    __testables__.toggleStory(card);
    expect(card.classList.contains("story-visible")).toBe(true);

    __testables__.toggleLyrics(card);
    expect(card.classList.contains("lyrics-visible")).toBe(true);
    expect(card.classList.contains("story-visible")).toBe(false);

    __testables__.toggleStory(card);
    expect(card.classList.contains("story-visible")).toBe(true);
    expect(card.classList.contains("lyrics-visible")).toBe(false);
  });
});
