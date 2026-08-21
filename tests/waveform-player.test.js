import { beforeEach, describe, expect, it, vi } from "vitest";

const waveInstances = [];

vi.mock("wavesurfer.js", () => ({
  default: {
    create: () => {
      const handlers = {};
      const instance = {
        on: (event, handler) => {
          handlers[event] = handler;
        },
        play: vi.fn(),
        playPause: vi.fn(),
        pause: vi.fn(),
        isPlaying: () => false,
        getDuration: () => 0,
        getCurrentTime: () => 0,
        getMediaElement: () => null,
        __handlers: handlers
      };
      waveInstances.push(instance);
      return instance;
    }
  }
}));

const { initWaveformPlayer, __testables__ } = await import("../src/js/waveform-player.js");

const baseTrack = {
  id: "real",
  title: "Real",
  artist: "Bangeroo",
  filename: "Real.mp3",
  story: "Story",
  downloadable: true
};

describe("track card metadata", () => {
  it("renders key, BPM, genre, and sub-genre under the title without artist name", () => {
    const card = __testables__.renderTrackCard({
      ...baseTrack,
      key: "G Major",
      bpm: 128,
      genre: "Indie Rock",
      subGenre: "Pop Soft Rock"
    });

    const meta = card.querySelector(".track-card__meta");
    const chips = card.querySelectorAll(".track-card__meta-chip");

    expect(card.querySelector(".track-card__title").textContent).toBe("Real");
    expect(card.id).toBe("track-real");
    expect(card.querySelector(".track-card__artist")).toBeNull();
    expect(card.querySelector(".track-card__artist-name")).toBeNull();
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

describe("auto-advance on finish", () => {
  beforeEach(() => {
    waveInstances.length = 0;
    document.body.innerHTML = `<div id="waveform-player"></div>`;
  });

  it("plays the next track when a track finishes", () => {
    initWaveformPlayer();

    const players = __testables__.getInstances();
    expect(players.length).toBeGreaterThan(1);

    players[0].waveSurfer.__handlers.finish();

    expect(players[1].waveSurfer.play).toHaveBeenCalledTimes(1);
    expect(players[0].card.classList.contains("is-playing")).toBe(false);
  });

  it("does not wrap to the first track after the last finishes", () => {
    initWaveformPlayer();

    const players = __testables__.getInstances();
    const last = players[players.length - 1];

    last.waveSurfer.__handlers.finish();

    expect(players[0].waveSurfer.play).not.toHaveBeenCalled();
    expect(last.card.classList.contains("is-playing")).toBe(false);
  });

  it("playNext returns false for the last track id", () => {
    initWaveformPlayer();

    const players = __testables__.getInstances();
    const lastId = players[players.length - 1].id;

    expect(__testables__.playNext(lastId)).toBe(false);
    expect(players[0].waveSurfer.play).not.toHaveBeenCalled();
  });

  it("playTrackById starts the matching player", () => {
    initWaveformPlayer();

    const players = __testables__.getInstances();
    expect(__testables__.playTrackById(players[1].id)).toBe(true);
    expect(players[1].waveSurfer.play).toHaveBeenCalledTimes(1);
    expect(__testables__.playTrackById("missing-track")).toBe(false);
  });
});
