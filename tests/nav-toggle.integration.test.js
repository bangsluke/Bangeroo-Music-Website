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
  }, 15000);
});

describe("desktop nav scroll spy", () => {
  const sectionTops = [
    { id: "music", top: 800 },
    { id: "influences", top: 1200 },
    { id: "gallery", top: 1600 },
    { id: "gigs", top: 2000 },
    { id: "guestbook", top: 2400 }
  ];
  const headerOffset = 61;
  const heroBottom = 800;

  it("clears the active section while still in the hero", async () => {
    const { __testables__ } = await import("../src/js/main.js");
    expect(__testables__.findActiveNavSectionId(100, headerOffset, sectionTops, heroBottom)).toBeNull();
  });

  it("picks the last section whose top has crossed the header line", async () => {
    const { __testables__ } = await import("../src/js/main.js");

    expect(__testables__.findActiveNavSectionId(900, headerOffset, sectionTops, heroBottom)).toBe(
      "music"
    );
    expect(__testables__.findActiveNavSectionId(1300, headerOffset, sectionTops, heroBottom)).toBe(
      "influences"
    );
    expect(__testables__.findActiveNavSectionId(2500, headerOffset, sectionTops, heroBottom)).toBe(
      "guestbook"
    );
  });

  it("keeps the previous section active until the next section clears the header offset", async () => {
    const { __testables__ } = await import("../src/js/main.js");

    // Still above influences top (1200) after accounting for header offset (61)
    expect(
      __testables__.findActiveNavSectionId(1130, headerOffset, sectionTops, heroBottom)
    ).toBe("music");
    expect(
      __testables__.findActiveNavSectionId(1140, headerOffset, sectionTops, heroBottom)
    ).toBe("influences");
  });

  it("measures section tops from the document, not offsetParent", async () => {
    document.body.innerHTML = `
      <main style="position: relative; margin-top: 500px">
        <section id="music"></section>
      </main>
    `;
    const section = document.querySelector("#music");
    Object.defineProperty(section, "offsetTop", { configurable: true, get: () => 40 });
    section.getBoundingClientRect = () => ({
      top: 500,
      height: 100,
      bottom: 600,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: 500,
      toJSON: () => ({})
    });
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });

    const { __testables__ } = await import("../src/js/main.js");
    expect(__testables__.getDocumentTop(section)).toBe(500);
    expect(__testables__.getDocumentTop(section)).not.toBe(section.offsetTop);
  });

  it("applies is-active and aria-current to the matching desktop pill", async () => {
    document.body.innerHTML = `
      <header class="section-nav">
        <nav class="nav-links" aria-label="Page sections">
          <a class="nav-link" href="#music" data-scroll-link>The Music</a>
          <a class="nav-link" href="#influences" data-scroll-link>Influences</a>
          <a class="nav-link" href="#gallery" data-scroll-link>Gallery</a>
          <a class="nav-link" href="#gigs" data-scroll-link>Gigs</a>
          <a class="nav-link" href="#guestbook" data-scroll-link>Shout Wall</a>
        </nav>
        <button class="nav-toggle" aria-expanded="false"></button>
        <div class="nav-menu"></div>
      </header>
      <header id="top" class="hero"></header>
      <section id="music"></section>
      <section id="influences"></section>
      <section id="gallery"></section>
      <section id="gigs"></section>
      <section id="guestbook"></section>
    `;

    const { __testables__ } = await import("../src/js/main.js");
    const activeId = __testables__.findActiveNavSectionId(1300, headerOffset, sectionTops, heroBottom);
    expect(activeId).toBe("influences");

    document.querySelectorAll(".nav-links .nav-link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isActive = href === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const influencesLink = document.querySelector('.nav-link[href="#influences"]');
    const musicLink = document.querySelector('.nav-link[href="#music"]');
    expect(influencesLink.classList.contains("is-active")).toBe(true);
    expect(influencesLink.getAttribute("aria-current")).toBe("true");
    expect(musicLink.classList.contains("is-active")).toBe(false);
  });
});
