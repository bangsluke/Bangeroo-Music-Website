import { beforeEach, describe, expect, it } from "vitest";
import { initInfluences, __testables__ } from "../src/js/influences.js";

describe("influences section", () => {
  const influences = {
    intro: "Intro text",
    artists: ["Radiohead", "The Clash", "Joy Division"],
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

  it("renders one chip per configured artist", () => {
    initInfluences({ influences });

    const chips = document.querySelectorAll("#influences-list .content-chip");
    expect(chips).toHaveLength(3);
    expect(chips[0].textContent).toBe("Radiohead");
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
