import { describe, expect, it } from "vitest";
import { __testables__ } from "../src/js/gallery.js";

describe("gallery helpers", () => {
  it("creates image slide markup", () => {
    const slide = __testables__.createImageSlide("/images/gallery/demo.jpg", 0);
    const img = slide.querySelector("img");

    expect(slide.classList.contains("splide__slide")).toBe(true);
    expect(img.getAttribute("src")).toBe("/images/gallery/demo.jpg");
  });

  it("creates placeholder slide markup", () => {
    const slide = __testables__.createPlaceholderSlide("linear-gradient(red, blue)", 1);
    const block = slide.querySelector(".placeholder-slide");

    expect(block).toBeTruthy();
    expect(block.getAttribute("title")).toContain("Placeholder slide");
  });
});
