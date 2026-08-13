import { afterEach, describe, expect, it } from "vitest";
import { tracks } from "../src/config/track-data.js";
import { __testables__ } from "../src/js/track-stories.js";

describe("track stories and lyrics modal", () => {
  afterEach(() => {
    __testables__.closeLyricsModal();
    document.body.classList.remove("lyrics-modal-open");
    document.querySelectorAll("[data-lyrics-modal]").forEach((node) => node.remove());
  });

  it("toggles and closes story visibility class", () => {
    const card = document.createElement("article");
    card.className = "track-card";

    __testables__.toggleStory(card);
    expect(card.classList.contains("story-visible")).toBe(true);

    __testables__.closeStory(card);
    expect(card.classList.contains("story-visible")).toBe(false);
  });

  it("opens and closes the lyrics modal", () => {
    const track = tracks[0];
    const trigger = document.createElement("button");

    __testables__.openLyricsModal(track, trigger);
    expect(__testables__.isLyricsModalOpen()).toBe(true);

    const modal = __testables__.ensureLyricsModal();
    expect(modal.querySelector("[data-lyrics-title]")?.textContent).toBe(track.title);
    expect(modal.querySelectorAll(".lyrics-modal__verse").length).toBe(track.lyrics.length);

    __testables__.closeLyricsModal();
    expect(__testables__.isLyricsModalOpen()).toBe(false);
  });

  it("closes story when lyrics modal opens and closes modal when story opens", () => {
    const card = document.createElement("article");
    card.className = "track-card";
    document.body.append(card);

    __testables__.toggleStory(card);
    expect(card.classList.contains("story-visible")).toBe(true);

    __testables__.openLyricsModal(tracks[0], document.createElement("button"));
    expect(__testables__.isLyricsModalOpen()).toBe(true);
    expect(card.classList.contains("story-visible")).toBe(false);

    __testables__.toggleStory(card);
    expect(card.classList.contains("story-visible")).toBe(true);
    expect(__testables__.isLyricsModalOpen()).toBe(false);

    card.remove();
  });

  it("finds tracks by id for the lyrics modal", () => {
    expect(__testables__.findTrackById("rewilding")?.title).toBe("Re-wilding");
  });
});
