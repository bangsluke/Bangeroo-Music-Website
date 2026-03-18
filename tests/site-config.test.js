import { describe, expect, it } from "vitest";
import { siteConfig } from "../src/config/site-config.js";

describe("site config shape", () => {
  it("contains v2 required keys", () => {
    expect(siteConfig).toHaveProperty("contact");
    expect(siteConfig).toHaveProperty("streamingLinks");
    expect(siteConfig).toHaveProperty("spotifyEmbed");
    expect(siteConfig).toHaveProperty("spotify");
    expect(siteConfig).toHaveProperty("palettes");
    expect(siteConfig).toHaveProperty("lyrics");
    expect(siteConfig).toHaveProperty("counterMilestones");
    expect(siteConfig).toHaveProperty("guestbook");
    expect(siteConfig).toHaveProperty("visitorCounter");
  });
});
