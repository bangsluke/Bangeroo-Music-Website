import { beforeEach, describe, expect, it } from "vitest";
import { initEpRelease, __testables__ } from "../src/js/ep-release.js";

describe("ep release section", () => {
  const baseEp = {
    title: "Finally",
    blurb: "First collection of songs.",
    genres: ["Anti-folk", "Indie Rock", "Post-rock", "Experimental Rock"],
    artwork: null,
    artworkNote: "Artwork for EP cover to be added when finalised"
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="ep-release">
        <div id="ep-release-content"></div>
        <div id="waveform-player" data-test-player></div>
      </div>
    `;
  });

  it("does not render genre chips", () => {
    initEpRelease({ ep: baseEp });

    expect(document.querySelectorAll("#ep-release-content .content-chip")).toHaveLength(0);
    expect(document.querySelector(".ep-release__genres")).toBeNull();
    expect(document.querySelector(".ep-release__title").textContent).toBe("Finally");
    expect(document.querySelector(".ep-release__blurb").textContent).toBe(
      "First collection of songs."
    );
  });

  it("shows artworkNote when artwork is null", () => {
    initEpRelease({ ep: baseEp });

    const placeholder = document.querySelector(".ep-release__artwork-placeholder");
    expect(placeholder).not.toBeNull();
    expect(placeholder.textContent).toBe(baseEp.artworkNote);
    expect(document.querySelector(".ep-release__artwork img")).toBeNull();
  });

  it("shows an image when artwork is set", () => {
    initEpRelease({
      ep: {
        ...baseEp,
        artwork: "/images/ep/finally.jpg"
      }
    });

    const img = document.querySelector(".ep-release__artwork img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe("/images/ep/finally.jpg");
    expect(document.querySelector(".ep-release__artwork-placeholder")).toBeNull();
  });

  it("leaves the waveform player node intact", () => {
    initEpRelease({ ep: baseEp });

    const player = document.querySelector("#waveform-player");
    expect(player).not.toBeNull();
    expect(player.hasAttribute("data-test-player")).toBe(true);
    expect(document.querySelector("#ep-release").contains(player)).toBe(true);
  });

  it("no-ops when the mount is absent", () => {
    document.body.innerHTML = "";
    expect(() => initEpRelease({ ep: baseEp })).not.toThrow();
  });

  it("exposes render helpers", () => {
    const mount = document.createElement("div");
    __testables__.renderEpRelease(mount, baseEp);
    expect(mount.querySelectorAll(".content-chip")).toHaveLength(0);
    expect(mount.querySelector(".ep-release__title").textContent).toBe("Finally");
  });

  it("lists numbered tracks beside the cover", () => {
    const customTracks = [
      { id: "a", title: "Real" },
      { id: "b", title: "Crashlanding" },
      { id: "c", title: "Re-Wilding" },
      { id: "d", title: "It's Not Fair" }
    ];

    initEpRelease({ ep: baseEp });
    __testables__.renderEpRelease(
      document.querySelector("#ep-release-content"),
      baseEp,
      customTracks
    );

    const row = document.querySelector(".ep-release__cover-row");
    const list = document.querySelector(".ep-release__tracklist");
    const items = document.querySelectorAll(".ep-release__track");

    expect(row).not.toBeNull();
    expect(row.contains(document.querySelector(".ep-release__artwork-placeholder"))).toBe(true);
    expect(row.contains(list)).toBe(true);
    expect(items).toHaveLength(4);
    expect(items[0].querySelector(".ep-release__track-number").textContent).toBe("01");
    expect(items[0].querySelector(".ep-release__track-title").textContent).toBe("Real");
    expect(items[0].querySelector(".ep-release__track-title").getAttribute("href")).toBe("#track-a");
    expect(items[0].querySelector(".ep-release__track-title").hasAttribute("data-scroll-link")).toBe(
      true
    );
    expect(items[0].querySelector(".ep-release__track-title").getAttribute("data-play-track")).toBe(
      "a"
    );
    expect(items[3].querySelector(".ep-release__track-number").textContent).toBe("04");
    expect(items[3].querySelector(".ep-release__track-title").textContent).toBe("It's Not Fair");
    expect(items[3].querySelector(".ep-release__track-title").getAttribute("href")).toBe("#track-d");
    expect(items[3].querySelector(".ep-release__track-title").getAttribute("data-play-track")).toBe(
      "d"
    );
  });
});
