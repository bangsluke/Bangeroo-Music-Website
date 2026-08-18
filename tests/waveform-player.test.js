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

const baseTrack = {
  id: "real",
  title: "Real",
  artist: "Bangeroo",
  filename: "Real 20Feb26.mp3",
  story: "Story",
  downloadable: true
};

describe("track card metadata", () => {
  it("renders key, BPM, genre, and sub-genre under the artist name", () => {
    const card = __testables__.renderTrackCard({
      ...baseTrack,
      key: "G Major",
      bpm: 128,
      genre: "Indie Rock",
      subGenre: "Pop Soft Rock"
    });

    const meta = card.querySelector(".track-card__meta");
    const chips = card.querySelectorAll(".track-card__meta-chip");

    expect(card.querySelector(".track-card__artist-name").textContent).toBe("Bangeroo");
    expect(meta).not.toBeNull();
    expect(meta.querySelector(".track-card__meta-facts").textContent).toBe("G Major · 128 BPM");
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toBe("Indie Rock");
    expect(chips[1].textContent).toBe("Pop Soft Rock");
    expect(card.querySelector(".track-card__moods")).toBeNull();
  });

  it("omits the meta line when optional fields are missing", () => {
    const card = __testables__.renderTrackCard(baseTrack);

    expect(card.querySelector(".track-card__meta")).toBeNull();
    expect(__testables__.renderTrackMeta(baseTrack)).toBe("");
  });

  it("omits undefined fragments when only some fields are present", () => {
    const card = __testables__.renderTrackCard({
      ...baseTrack,
      key: "E minor",
      genre: "Post-rock"
    });

    const meta = card.querySelector(".track-card__meta");
    expect(meta.querySelector(".track-card__meta-facts").textContent).toBe("E minor");
    expect(meta.querySelectorAll(".track-card__meta-chip")).toHaveLength(1);
    expect(meta.textContent).not.toContain("undefined");
    expect(meta.textContent).not.toContain("BPM");
  });
});
