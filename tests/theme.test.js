import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("theme tokens", () => {
  it("contains required color variables", () => {
    const themePath = path.resolve(process.cwd(), "src/css/theme.css");
    const css = fs.readFileSync(themePath, "utf8");

    expect(css).toContain("--palette-red:");
    expect(css).toContain("--palette-black:");
    expect(css).toContain("--palette-yellow:");
    expect(css).toContain("--palette-grey:");
    expect(css).toContain("--palette-white:");
    expect(css).toContain("--palette-navy-blue:");
    expect(css).toContain("--palette-mushroom:");
    expect(css).toContain("--color-bg-primary:");
    expect(css).toContain("--color-accent:");
    expect(css).toContain("--glitch-duration:");
  });
});
