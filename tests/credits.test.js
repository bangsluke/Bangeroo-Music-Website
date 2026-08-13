import { beforeEach, describe, expect, it } from "vitest";
import { initCredits, __testables__ } from "../src/js/credits.js";

describe("credits section", () => {
  const credits = {
    intro: "Thanks intro",
    people: [
      { name: "Linn Sandin", role: "vocal coach" },
      { name: "Luke Bangs", role: "website" }
    ]
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <section id="thanks">
        <p id="thanks-intro"></p>
        <ul id="thanks-list"></ul>
      </section>
    `;
  });

  it("renders each name and role", () => {
    initCredits({ credits });

    const items = document.querySelectorAll("#thanks-list .thanks__item");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector(".thanks__name").textContent).toBe("Linn Sandin");
    expect(items[0].querySelector(".thanks__role").textContent).toBe("vocal coach");
    expect(items[1].querySelector(".thanks__name").textContent).toBe("Luke Bangs");
    expect(document.querySelector("#thanks-intro").textContent).toBe("Thanks intro");
  });

  it("no-ops when the mount is absent", () => {
    document.body.innerHTML = "";
    expect(() => initCredits({ credits })).not.toThrow();
  });

  it("exposes renderCredits for direct testing", () => {
    const list = document.createElement("ul");
    __testables__.renderCredits(null, list, credits);
    expect(list.children).toHaveLength(2);
  });
});
