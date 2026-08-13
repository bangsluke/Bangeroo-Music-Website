import { beforeEach, describe, expect, it } from "vitest";
import { initInfluences, __testables__ } from "../src/js/influences.js";

describe("influences section", () => {
  const influences = {
    intro: "Intro text",
    artists: [
      { name: "Radiohead", spotifyUrl: "https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb" },
      { name: "The Clash", spotifyUrl: "https://open.spotify.com/artist/3RGLhK1IP9jnYFH4BRFJBS" },
      { name: "Joy Division", spotifyUrl: "https://open.spotify.com/artist/432R46LaYsJZV2Gmc4jUV5" }
    ],
    outro: "Outro text"
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <section id="influences">
        <p id="influences-intro"></p>
        <ul id="influences-list"></ul>
        <p id="influences-outro"></p>
      </section>
    `;
  });

  it("renders one linked chip per configured artist", () => {
    initInfluences({ influences });

    const chips = document.querySelectorAll("#influences-list .content-chip");
    expect(chips).toHaveLength(3);
    expect(chips[0].tagName).toBe("A");
    expect(chips[0].textContent).toBe("Radiohead");
    expect(chips[0].getAttribute("href")).toBe(
      "https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb"
    );
    expect(chips[0].getAttribute("target")).toBe("_blank");
    expect(chips[0].getAttribute("rel")).toBe("noopener noreferrer");
    expect(chips[0].getAttribute("aria-label")).toBe("Open Radiohead on Spotify");
    expect(document.querySelector("#influences-intro").textContent).toBe("Intro text");
    expect(document.querySelector("#influences-outro").textContent).toBe("Outro text");
  });

  it("no-ops when the mount is absent", () => {
    document.body.innerHTML = "";
    expect(() => initInfluences({ influences })).not.toThrow();
  });

  it("exposes renderInfluences for direct testing", () => {
    const list = document.createElement("ul");
    __testables__.renderInfluences(null, list, null, influences);
    expect(list.children).toHaveLength(3);
  });
});
