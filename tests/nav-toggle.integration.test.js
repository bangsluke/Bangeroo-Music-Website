import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("wavesurfer.js", () => {
  return {
    default: {
      create: () => ({
        on: () => {},
        playPause: () => {},
        pause: () => {},
        isPlaying: () => false,
        getDuration: () => 0,
        getCurrentTime: () => 0,
        getMediaElement: () => null
      })
    }
  };
});

describe("mobile nav toggle", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header class="section-nav">
        <button class="nav-toggle" aria-expanded="false"></button>
        <div class="nav-menu"></div>
      </header>
    `;
  });

  it("toggles nav-menu--open class on button click", async () => {
    const { __testables__ } = await import("../src/js/main.js");
    __testables__.initSectionNav();

    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");

    toggle.click();
    expect(menu.classList.contains("nav-menu--open")).toBe(true);

    toggle.click();
    expect(menu.classList.contains("nav-menu--open")).toBe(false);
  });
});
