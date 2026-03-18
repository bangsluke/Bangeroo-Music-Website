import { describe, expect, it } from "vitest";
import { __testables__ } from "../src/js/colour-randomiser.js";

describe("colour randomiser", () => {
  it("applies palette properties to css variables", () => {
    __testables__.applyPalette({
      bgPrimary: "#111111",
      bgSecondary: "#222222",
      textPrimary: "#eeeeee",
      accent: "#ff0000",
      accentSecondary: "#ffd700"
    });

    const style = document.documentElement.style;
    expect(style.getPropertyValue("--color-bg-primary")).toBe("#111111");
    expect(style.getPropertyValue("--color-accent-secondary")).toBe("#ffd700");
  });
});
