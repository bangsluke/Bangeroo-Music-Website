export function initTrackStories() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const toggle = target.closest("[data-story-toggle]");
    if (toggle) {
      const card = toggle.closest(".track-card");
      if (card) {
        card.classList.toggle("story-visible");
      }
      return;
    }

    const close = target.closest("[data-story-close]");
    if (close) {
      const card = close.closest(".track-card");
      if (card) {
        card.classList.remove("story-visible");
      }
    }
  });
}

export const __testables__ = {
  toggleStory(card) {
    card.classList.toggle("story-visible");
  },
  closeStory(card) {
    card.classList.remove("story-visible");
  }
};
