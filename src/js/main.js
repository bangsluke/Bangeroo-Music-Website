import { initLazyLoad } from "./lazy-load.js";
import { initGallery } from "./gallery.js";
import { initEasterEgg } from "./easter-egg.js";
import { initAnalytics, trackEvent } from "./analytics.js";
import { initGlitchEffects } from "./glitch.js";
import { loadSiteConfig } from "./site-config.js";
import { initLogoGlitch } from "./logo-glitch.js";
import { initChaosEffects } from "./chaos-effects.js";

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
});
