import { describe, expect, it } from "vitest";
import { getMilestoneMessage } from "../src/js/visitor-counter.js";

describe("visitor counter milestone lookup", () => {
  it("returns milestone message for known counts", () => {
    expect(getMilestoneMessage({ 10: "ten!" }, 10)).toBe("ten!");
  });

  it("returns default message for unknown counts", () => {
    expect(getMilestoneMessage({ 10: "ten!" }, 11)).toBe("You are visitor #11");
  });
});
