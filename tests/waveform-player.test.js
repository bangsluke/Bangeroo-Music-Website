import { describe, expect, it, vi } from "vitest";

vi.mock("wavesurfer.js", () => ({
  default: {
    create: () => ({
      on: () => {},
      playPause: () => {},
      pause: () => {},
      isPlaying: () => false,
      getDuration: () => 0,
      getCurrentTime: () => 0,
      getMediaElement: () => null
    })
  }
}));

const { __testables__ } = await import("../src/js/waveform-player.js");

describe("track card mood tags", () => {
  it("renders mood hashtags after the artist name", () => {
    const card = __testables__.renderTrackCard({
      id: "real",
      title: "Real",
      artist: "Bangeroo",
      filename: "Real 20Feb26.mp3",
      story: "Story",
      mood: ["wired", "chaos"],
      downloadable: true
    });

    const artist = card.querySelector(".track-card__artist");
    const tags = card.querySelectorAll(".track-card__mood-tag");
    expect(artist.querySelector(".track-card__artist-name").textContent).toBe("Bangeroo");
    expect(tags).toHaveLength(2);
    expect(tags[0].textContent).toBe("#wired");
    expect(tags[1].textContent).toBe("#chaos");
    expect(card.querySelector(".track-card__moods").previousElementSibling.textContent).toBe(
      "Bangeroo"
    );
  });

  it("omits mood tags when mood is empty", () => {
    expect(__testables__.renderMoodTags([])).toBe("");
  });
});
