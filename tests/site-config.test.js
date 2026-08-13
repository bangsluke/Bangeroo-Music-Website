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

  it("contains artist copy keys", () => {
    expect(siteConfig).toHaveProperty("artist");
    expect(siteConfig.artist).toHaveProperty("bio");
    expect(siteConfig.artist).toHaveProperty("bioClosing");
    expect(siteConfig).toHaveProperty("ep");
    expect(siteConfig.ep.genres).toHaveLength(4);
    expect(siteConfig).toHaveProperty("influences");
    expect(siteConfig.influences.artists).toHaveLength(20);
    expect(siteConfig).toHaveProperty("credits");
    expect(siteConfig.credits.people).toHaveLength(4);
  });
});
