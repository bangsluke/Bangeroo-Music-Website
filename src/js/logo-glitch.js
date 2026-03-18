const LOGO_PATHS = [
  "/images/logos/Bangeroo-Logo-Black-Text-White-Background.png",
  "/images/logos/Bangeroo-Logo-Blue-Text-White-Background.png",
  "/images/logos/Bangeroo-Logo-White-Text-Blue-Background.png",
  "/images/logos/Bangeroo-Logo-White-Text-Brown-Background.png"
];

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 2000;

function randomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

function pickNextIndex(currentIndex) {
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * LOGO_PATHS.length);
  }
  return next;
}

export function initLogoGlitch() {
  const logoElement = document.querySelector("#hero-logo");
  if (!(logoElement instanceof HTMLImageElement) || LOGO_PATHS.length < 2) {
    return;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  let currentIndex = LOGO_PATHS.findIndex((path) => path === logoElement.getAttribute("src"));
  if (currentIndex < 0) {
    currentIndex = 0;
    logoElement.setAttribute("src", LOGO_PATHS[currentIndex]);
  }

  const swapLogo = () => {
    logoElement.classList.add("is-swapping");
    const nextIndex = pickNextIndex(currentIndex);
    currentIndex = nextIndex;
    logoElement.setAttribute("src", LOGO_PATHS[currentIndex]);
    window.setTimeout(() => logoElement.classList.remove("is-swapping"), 90);
    window.setTimeout(swapLogo, randomDelay());
  };

  window.setTimeout(swapLogo, randomDelay());
}
