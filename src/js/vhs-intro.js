const SESSION_KEY = "bangeroo-vhs-intro-played";
const VHS_MIN_DURATION_MS = 2000;
const VHS_MAX_DURATION_MS = 3000;
let exitTimer = 0;
let hideTimer = 0;

function getIntroDurationMs() {
  return (
    Math.floor(Math.random() * (VHS_MAX_DURATION_MS - VHS_MIN_DURATION_MS + 1)) +
    VHS_MIN_DURATION_MS
  );
}

function clearIntroTimers() {
  if (exitTimer) {
    window.clearTimeout(exitTimer);
    exitTimer = 0;
  }
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }
}

export function playVhsIntro(introElement) {
  if (!introElement) {
    return;
  }
  clearIntroTimers();
  introElement.hidden = false;
  introElement.classList.remove("is-exit");
  void introElement.offsetHeight;

  const totalDuration = getIntroDurationMs();
  const fadeStart = Math.max(1500, totalDuration - 500);
  exitTimer = window.setTimeout(() => introElement.classList.add("is-exit"), fadeStart);
  hideTimer = window.setTimeout(() => {
    introElement.hidden = true;
    introElement.classList.remove("is-exit");
  }, totalDuration);
}

export function initVhsIntro() {
  const intro = document.querySelector("#vhs-intro");
  if (!intro) {
    return;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    intro.hidden = true;
    return;
  }

  if (sessionStorage.getItem(SESSION_KEY) !== "1") {
    playVhsIntro(intro);
    sessionStorage.setItem(SESSION_KEY, "1");
  } else {
    intro.hidden = true;
  }

  const replayTriggers = [document.querySelector("#header-brand"), document.querySelector("#hero-logo")];
  replayTriggers.forEach((trigger) => {
    if (!trigger) {
      return;
    }
    trigger.addEventListener("click", () => {
      playVhsIntro(intro);
    });
  });
}
