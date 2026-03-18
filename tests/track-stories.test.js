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
});
