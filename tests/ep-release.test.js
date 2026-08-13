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

  it("renders all genres", () => {
    initEpRelease({ ep: baseEp });

    const chips = document.querySelectorAll("#ep-release-content .content-chip");
    expect(chips).toHaveLength(4);
    expect(chips[0].textContent).toBe("Anti-folk");
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
    expect(mount.querySelectorAll(".content-chip")).toHaveLength(4);
  });
});
