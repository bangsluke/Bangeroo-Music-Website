import { tracks } from "../config/track-data.js";

let lyricsModal = null;
let lastFocusedElement = null;

function closeStory(card) {
  card.classList.remove("story-visible");
}

function renderLyricsBody(lyrics = []) {
  return lyrics
    .map((verse) => `<p class="lyrics-modal__verse">${verse.join("<br>")}</p>`)
    .join("");
}

function ensureLyricsModal() {
  if (lyricsModal?.isConnected) {
    return lyricsModal;
  }

  const overlay = document.createElement("div");
  overlay.className = "lyrics-modal";
  overlay.hidden = true;
  overlay.setAttribute("data-lyrics-modal", "");
  overlay.innerHTML = `
    <div class="lyrics-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="lyrics-modal-title" data-lyrics-dialog>
      <div class="lyrics-modal__header">
        <h2 id="lyrics-modal-title" class="lyrics-modal__title" data-lyrics-title></h2>
        <button type="button" class="lyrics-modal__close" data-lyrics-close aria-label="Close lyrics">Close</button>
      </div>
      <div class="lyrics-modal__body" data-lyrics-body></div>
    </div>
  `;
  document.body.append(overlay);
  lyricsModal = overlay;
  return overlay;
}

function isLyricsModalOpen() {
  return Boolean(lyricsModal && !lyricsModal.hidden);
}

function closeLyricsModal() {
  const modal = ensureLyricsModal();
  if (modal.hidden) {
    return;
  }
  modal.hidden = true;
  document.body.classList.remove("lyrics-modal-open");
  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function openLyricsModal(track, trigger) {
  if (!track) {
    return;
  }

  document.querySelectorAll(".track-card.story-visible").forEach((card) => {
    closeStory(card);
  });

  const modal = ensureLyricsModal();
  const title = modal.querySelector("[data-lyrics-title]");
  const body = modal.querySelector("[data-lyrics-body]");
  const closeButton = modal.querySelector("[data-lyrics-close]");
  if (!title || !body || !closeButton) {
    return;
  }

  title.textContent = track.title;
  body.innerHTML = renderLyricsBody(track.lyrics || []);
  lastFocusedElement = trigger instanceof HTMLElement ? trigger : document.activeElement;
  modal.hidden = false;
  document.body.classList.add("lyrics-modal-open");
  closeButton.focus();
}

function findTrackById(trackId) {
  return tracks.find((track) => track.id === trackId) || null;
}

export function initTrackStories() {
  ensureLyricsModal();

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const storyToggle = target.closest("[data-story-toggle]");
    if (storyToggle) {
      const card = storyToggle.closest(".track-card");
      if (card) {
        closeLyricsModal();
        const opening = !card.classList.contains("story-visible");
        document.querySelectorAll(".track-card.story-visible").forEach((openCard) => {
          closeStory(openCard);
        });
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
        const track = findTrackById(card.dataset.trackId);
        if (isLyricsModalOpen()) {
          closeLyricsModal();
        }
        openLyricsModal(track, lyricsToggle);
      }
      return;
    }

    const storyClose = target.closest("[data-story-close]");
    if (storyClose) {
      const card = storyClose.closest(".track-card");
      if (card) {
        closeStory(card);
      }
      return;
    }

    const lyricsClose = target.closest("[data-lyrics-close]");
    if (lyricsClose) {
      closeLyricsModal();
      return;
    }

    if (isLyricsModalOpen() && target.closest("[data-lyrics-modal]") && !target.closest("[data-lyrics-dialog]")) {
      closeLyricsModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isLyricsModalOpen()) {
      closeLyricsModal();
    }
  });
}

export const __testables__ = {
  toggleStory(card) {
    closeLyricsModal();
    const opening = !card.classList.contains("story-visible");
    document.querySelectorAll(".track-card.story-visible").forEach((openCard) => {
      closeStory(openCard);
    });
    if (opening) {
      card.classList.add("story-visible");
    }
  },
  closeStory,
  openLyricsModal,
  closeLyricsModal,
  isLyricsModalOpen,
  ensureLyricsModal,
  findTrackById
};
