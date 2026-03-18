import { describe, expect, it } from "vitest";
import { __testables__ } from "../src/js/lyric-fragments.js";

describe("lyric fragments", () => {
  it("clamps values to expected range", () => {
    expect(__testables__.clamp(-1, 0, 1)).toBe(0);
    expect(__testables__.clamp(2, 0, 1)).toBe(1);
    expect(__testables__.clamp(0.4, 0, 1)).toBe(0.4);
  });
});
