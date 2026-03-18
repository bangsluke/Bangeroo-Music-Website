import { initLazyLoad } from "./lazy-load.js";
import { initGallery } from "./gallery.js";
import { initEasterEgg } from "./easter-egg.js";
import { initAnalytics, trackEvent } from "./analytics.js";
import { initGlitchEffects } from "./glitch.js";
import { loadSiteConfig } from "./site-config.js";
import { initLogoGlitch } from "./logo-glitch.js";
import { initChaosEffects } from "./chaos-effects.js";

function initDesignASectionNav() {
  const isDesignA = document.body.classList.contains("design-a");
  if (!isDesignA) {
    return;
  }

  const navRoot = document.querySelector(".section-nav");
  const toggleButton = document.querySelector(".section-nav__toggle");
  const menu = document.querySelector("#section-nav-menu");

  if (!navRoot || !toggleButton || !menu) {
    return;
  }

  const closeMenu = () => {
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Open menu");
    menu.hidden = true;
  };

  const openMenu = () => {
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.setAttribute("aria-label", "Close menu");
    menu.hidden = false;
  };

  const isMenuOpen = () => toggleButton.getAttribute("aria-expanded") === "true";

  toggleButton.addEventListener("click", () => {
    if (isMenuOpen()) {
      closeMenu();
      return;
    }
    openMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (isMenuOpen()) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen()) {
      return;
    }
    if (event.target instanceof Node && navRoot.contains(event.target)) {
      return;
    }
    closeMenu();
  });

  const smoothScrollToHash = (hash) => {
    if (!hash || !hash.startsWith("#")) {
      return false;
    }
    const target = document.querySelector(hash);
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", hash);
    return true;
  };

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("[data-scroll-link]") : null;
    if (!link) {
      return;
    }

    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    closeMenu();
    smoothScrollToHash(href);
  });
}

function initSpotifyFallback() {
  const spotifyEmbed = document.querySelector("#spotify-embed");
  const fallback = document.querySelector("#spotify-fallback");
  if (!spotifyEmbed || !fallback) {
    return;
  }

  let loaded = false;
  spotifyEmbed.addEventListener("load", () => {
    loaded = true;
    fallback.classList.add("hidden");
    trackEvent("spotify-embed-load");
  });

  spotifyEmbed.addEventListener("error", () => {
    fallback.classList.remove("hidden");
    trackEvent("spotify-embed-error");
  });

  window.setTimeout(() => {
    if (!loaded && spotifyEmbed.getAttribute("src")) {
      fallback.classList.remove("hidden");
    }
  }, 9000);
}

function initHeroMediaFallback() {
  const video = document.querySelector("#hero-video");
  const fallbackImage = document.querySelector("#hero-fallback-image");
  if (!video || !fallbackImage) {
    return;
  }

  const showImage = () => {
    fallbackImage.classList.remove("is-hidden");
    video.classList.add("is-hidden");
  };

  video.addEventListener("loadeddata", () => {
    fallbackImage.classList.add("is-hidden");
    video.classList.remove("is-hidden");
  });

  video.addEventListener("error", showImage);

  // If autoplay is blocked or media missing, ensure the fallback remains visible.
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(showImage);
  }
}

function applySiteConfig(config) {
  const bio = document.querySelector("#hero-bio");
  const heroEmail = document.querySelector("#hero-email-link");
  const heroPhone = document.querySelector("#hero-phone-link");
  const footerEmail = document.querySelector("#footer-email-link");
  const footerPhone = document.querySelector("#footer-phone-link");

  if (bio) {
    bio.textContent = config.artist.bio;
  }

  if (heroEmail) {
    heroEmail.setAttribute("href", `mailto:${config.contact.email}`);
  }

  if (heroPhone) {
    heroPhone.setAttribute("href", `tel:${config.contact.telephone}`);
  }

  if (footerEmail) {
    footerEmail.setAttribute("href", `mailto:${config.contact.email}`);
  }

  if (footerPhone) {
    footerPhone.setAttribute("href", `tel:${config.contact.telephone}`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const siteConfig = await loadSiteConfig();
  applySiteConfig(siteConfig);

  initAnalytics();
  initLazyLoad();
  initGallery();
  initEasterEgg();
  initGlitchEffects();
  initLogoGlitch();
  initChaosEffects();
  initSpotifyFallback();
  initHeroMediaFallback();
  initDesignASectionNav();
});
