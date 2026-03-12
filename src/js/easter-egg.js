import { trackEvent } from "./analytics.js";

const DEFAULT_LABEL = "Click for upcoming gig dates";
const REVEALED_LABEL = "You're having a laugh";
const RESET_DELAY_MS = 5000;

function reveal(button) {
  button.classList.add("revealed");
  button.textContent = REVEALED_LABEL;
  button.setAttribute("aria-pressed", "true");
}

function reset(button) {
  button.classList.remove("revealed");
  button.textContent = DEFAULT_LABEL;
  button.setAttribute("aria-pressed", "false");
}

export function initEasterEgg() {
  const button = document.querySelector("#gigs-easter-egg");
  if (!button) {
    return;
  }
  let isCoolingDown = false;

  button.addEventListener("click", () => {
    if (isCoolingDown) {
      return;
    }

    isCoolingDown = true;
    reveal(button);
    trackEvent("easter-egg-click", { state: "revealed" });

    window.setTimeout(() => {
      reset(button);
      isCoolingDown = false;
    }, RESET_DELAY_MS);
  });
}

export const __testables__ = {
  reveal,
  reset,
  DEFAULT_LABEL,
  REVEALED_LABEL,
  RESET_DELAY_MS
};
