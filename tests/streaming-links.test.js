import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("wavesurfer.js", () => {
  return {
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
  };
});

describe("streaming links applySiteConfig", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a data-streaming-link="spotify" class="streaming-link" aria-label="Open Spotify"></a>
      <a data-streaming-link="soundcloud" class="streaming-link" aria-label="Open SoundCloud"></a>
      <a data-streaming-link="itunes" class="streaming-link" aria-label="Open Apple Music"></a>
      <a data-streaming-link="amazonMusic" class="streaming-link" aria-label="Open Amazon Music"></a>
    `;
  });

  it("keeps Spotify linked and marks the other three as pending", async () => {
    const { __testables__ } = await import("../src/js/main.js");
    __testables__.applySiteConfig({
      artist: { bio: "", bioClosing: "" },
      contact: { email: "a@b.com", phone: "+440000000000" },
      spotifyEmbed: { artistId: "PLACEHOLDER_ID", theme: 0 },
      streamingLinks: {
        spotify: "https://open.spotify.com/artist/0gXu1oMsNf8fnRY0NPCoSw",
        soundcloud: null,
        itunes: null,
        amazonMusic: null,
        pendingTooltip: "Go find it yourself"
      }
    });

    const spotify = document.querySelector('[data-streaming-link="spotify"]');
    const soundcloud = document.querySelector('[data-streaming-link="soundcloud"]');
    const itunes = document.querySelector('[data-streaming-link="itunes"]');
    const amazon = document.querySelector('[data-streaming-link="amazonMusic"]');

    expect(spotify.getAttribute("href")).toBe(
      "https://open.spotify.com/artist/0gXu1oMsNf8fnRY0NPCoSw"
    );
    expect(spotify.classList.contains("streaming-link--pending")).toBe(false);
    expect(spotify.hasAttribute("data-tooltip")).toBe(false);

    for (const link of [soundcloud, itunes, amazon]) {
      expect(link.hasAttribute("href")).toBe(false);
      expect(link.classList.contains("streaming-link--pending")).toBe(true);
      expect(link.getAttribute("data-tooltip")).toBe("Go find it yourself");
      expect(link.getAttribute("aria-disabled")).toBe("true");
      expect(link.getAttribute("tabindex")).toBe("0");
      expect(link.getAttribute("aria-label")).toContain("Go find it yourself");
    }
  }, 15000);
});
