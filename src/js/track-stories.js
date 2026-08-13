function closePanels(card) {
  card.classList.remove("story-visible", "lyrics-visible");
}

export function initTrackStories() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const storyToggle = target.closest("[data-story-toggle]");
    if (storyToggle) {
      const card = storyToggle.closest(".track-card");
      if (card) {
        const opening = !card.classList.contains("story-visible");
        closePanels(card);
        if (opening) {
          card.classList.add("story-visible");
        }
      }
      return;
    }

    const lyricsToggle = target.closest("[data-lyrics-toggle]");
    if (lyricsToggle) {
      const card = lyricsToggle.closest(".track-card");
      if (card) {
        const opening = !card.classList.contains("lyrics-visible");
        closePanels(card);
        if (opening) {
          card.classList.add("lyrics-visible");
        }
      }
      return;
    }

    const storyClose = target.closest("[data-story-close]");
    if (storyClose) {
      const card = storyClose.closest(".track-card");
      if (card) {
        card.classList.remove("story-visible");
      }
      return;
    }

    const lyricsClose = target.closest("[data-lyrics-close]");
    if (lyricsClose) {
      const card = lyricsClose.closest(".track-card");
      if (card) {
        card.classList.remove("lyrics-visible");
      }
    }
  });
}

export const __testables__ = {
  toggleStory(card) {
    const opening = !card.classList.contains("story-visible");
    closePanels(card);
    if (opening) {
      card.classList.add("story-visible");
    }
  },
  closeStory(card) {
    card.classList.remove("story-visible");
  },
  toggleLyrics(card) {
    const opening = !card.classList.contains("lyrics-visible");
    closePanels(card);
    if (opening) {
      card.classList.add("lyrics-visible");
    }
  },
  closeLyrics(card) {
    card.classList.remove("lyrics-visible");
  }
};
