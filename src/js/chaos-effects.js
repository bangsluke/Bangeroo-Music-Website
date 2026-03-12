const BASE_INTERVALS = {
  "design-b": [350, 1500]
};

const TEXT_TARGETS = ["#hero-bio", "#music-title", "#gallery-title", "#gigs-title", ".design-label", "#hero-title"];

function reducedMotionEnabled() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getDesignKey() {
  const classMatch = [...document.body.classList].find((name) => name.startsWith("design-"));
  return classMatch || "design-a";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function wrapCharsForGlitch(element) {
  if (!element || element.dataset.chaosWrapped === "true") {
    return;
  }

  const original = element.textContent || "";
  if (!original.trim()) {
    return;
  }

  element.setAttribute("aria-label", original);
  element.dataset.chaosWrapped = "true";
  element.dataset.originalText = original;
  element.textContent = "";

  const fragment = document.createDocumentFragment();
  [...original].forEach((char) => {
    const span = document.createElement("span");
    span.className = "chaos-char";
    span.setAttribute("aria-hidden", "true");
    span.textContent = char === " " ? "\u00A0" : char;
    fragment.append(span);
  });
  element.append(fragment);
}

function setupTextTargets() {
  TEXT_TARGETS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => wrapCharsForGlitch(node));
  });
}

function applyCharacterGhostPulse() {
  const chars = [...document.querySelectorAll(".chaos-char")];
  if (!chars.length) {
    return;
  }

  const affectedCount = Math.max(1, Math.ceil(chars.length * 0.08));
  for (let i = 0; i < affectedCount; i += 1) {
    const target = randomFrom(chars);
    if (!target || target.classList.contains("is-ghost")) {
      continue;
    }
    target.classList.add("is-ghost");
    window.setTimeout(() => {
      target.classList.remove("is-ghost");
    }, randomInt(90, 420));
  }
}

function pulseClass(target, className, durationMs) {
  target.classList.add(className);
  window.setTimeout(() => {
    target.classList.remove(className);
  }, durationMs);
}

function runChaosPulse() {
  const visibleSections = [...document.querySelectorAll(".lazy-section.is-visible")];
  if (visibleSections.length) {
    const section = randomFrom(visibleSections);
    if (section) {
      pulseClass(section, "is-chaos-phase", randomInt(450, 1100));
    }
  }

  const textContainers = [...document.querySelectorAll("#hero-bio, h2.glitch-text, .design-label, #hero-title")];
  if (textContainers.length) {
    const textTarget = randomFrom(textContainers);
    if (textTarget) {
      pulseClass(textTarget, "is-text-chaos", randomInt(180, 600));
    }
  }

  pulseClass(document.body, "is-screen-chaos", randomInt(180, 500));
  applyCharacterGhostPulse();
}

export function initChaosEffects() {
  const designKey = getDesignKey();
  if (designKey !== "design-b" || reducedMotionEnabled()) {
    return;
  }

  document.body.classList.add("is-chaos-enabled");
  setupTextTargets();
  const [min, max] = BASE_INTERVALS[designKey] || BASE_INTERVALS["design-b"];

  const scheduleNext = () => {
    runChaosPulse();
    window.setTimeout(scheduleNext, randomInt(min, max));
  };

  window.setTimeout(scheduleNext, randomInt(500, 1500));
}
