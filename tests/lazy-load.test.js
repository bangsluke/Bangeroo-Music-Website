import { describe, expect, it } from "vitest";
import { __testables__ } from "../src/js/lazy-load.js";

describe("lazy-load helpers", () => {
  it("sets src from data-src and removes data-src", () => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("data-src", "https://example.com/embed");

    __testables__.loadDataSource(iframe);

    expect(iframe.getAttribute("src")).toBe("https://example.com/embed");
    expect(iframe.hasAttribute("data-src")).toBe(false);
  });

  it("adds visibility class to sections", () => {
    const section = document.createElement("section");
    section.className = "lazy-section";

    __testables__.revealSection(section);

    expect(section.classList.contains("is-visible")).toBe(true);
  });
});
