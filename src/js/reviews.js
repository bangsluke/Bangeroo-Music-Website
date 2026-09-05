const DECK_INTERVAL_MS = 4200;
const CARD_HEIGHT_REM = 4;
const PHRASE_MIN_REM = 0.85;
const PHRASE_FILL_RATIO = 0.5;
const FOOTNOTE =
  "* All real phrases used by reviewers of my songs. All reviews PAID for";
const DEFAULT_PUNCHLINE = "And I remember - I PAID these people";

function quoteText(quote) {
  return `“${quote}”`;
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function createTimerBag() {
  const timeouts = new Set();
  const intervals = new Set();

  const schedule = (fn, delay) => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, delay);
    timeouts.add(id);
    return id;
  };

  const every = (fn, delay) => {
    const id = window.setInterval(fn, delay);
    intervals.add(id);
    return id;
  };

  const clear = () => {
    timeouts.forEach((id) => window.clearTimeout(id));
    intervals.forEach((id) => window.clearInterval(id));
    timeouts.clear();
    intervals.clear();
  };

  return { schedule, every, clear };
}

function buildDeckCards(reviews) {
  const positive = (reviews.positive || []).map((quote) => ({
    quote,
    tone: "positive"
  }));
  const negative = (reviews.negative || []).map((quote) => ({
    quote,
    tone: "negative"
  }));
  return shuffle([...positive, ...negative]);
}

function rootFontSizePx() {
  const root = window.getComputedStyle(document.documentElement).fontSize;
  const parsed = Number.parseFloat(root);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

function phraseCharCount(text) {
  return String(text || "")
    .replace(/[“”"']/g, "")
    .trim().length;
}

function cardInnerBox(cardEl) {
  const styles = window.getComputedStyle(cardEl);
  const padX =
    (Number.parseFloat(styles.paddingLeft) || 0) +
    (Number.parseFloat(styles.paddingRight) || 0);
  const padY =
    (Number.parseFloat(styles.paddingTop) || 0) +
    (Number.parseFloat(styles.paddingBottom) || 0);
  const rootPx = rootFontSizePx();
  const fallbackHeight = CARD_HEIGHT_REM * rootPx;
  const rect = cardEl.getBoundingClientRect();
  const height = rect.height > 8 ? rect.height : fallbackHeight;
  const width = rect.width > 8 ? rect.width : cardEl.clientWidth || 320;

  return {
    maxHeight: Math.max(height - padY, 8),
    maxWidth: Math.max(width - padX, 8),
    rootPx
  };
}

function fitPhraseToCard(phraseEl, cardEl) {
  if (!phraseEl || !cardEl) {
    return;
  }

  const { maxHeight, rootPx } = cardInnerBox(cardEl);
  const lineHeight = 1.08;
  // Font size so a single line is ~70% of the card's inner height.
  let size = (maxHeight * PHRASE_FILL_RATIO) / (rootPx * lineHeight);
  size = Math.max(size, PHRASE_MIN_REM);

  phraseEl.style.lineHeight = String(lineHeight);
  phraseEl.style.fontSize = `${size}rem`;

  // Longer quotes that wrap still shrink until they fit the box.
  let guard = 0;
  while (guard < 80 && size > PHRASE_MIN_REM && phraseEl.scrollHeight > maxHeight + 1) {
    size -= 0.04;
    phraseEl.style.fontSize = `${size}rem`;
    guard += 1;
  }
}

function clearActiveTimers(mountEl) {
  if (mountEl?.__reviewsTimers) {
    mountEl.__reviewsTimers.clear();
    mountEl.__reviewsTimers = null;
  }
}

function renderReviewDeck(mountEl, reviews, timers) {
  mountEl.classList.add("reviews-deck");
  mountEl.innerHTML = "";

  const title = document.createElement("h4");
  title.className = "reviews-deck__title";
  title.textContent = "Reviews";

  const stage = document.createElement("div");
  stage.className = "reviews-deck__stage";

  const card = document.createElement("blockquote");
  card.className = "reviews-deck__card";
  card.setAttribute("aria-live", "polite");

  const phrase = document.createElement("span");
  phrase.className = "reviews-deck__phrase";
  card.append(phrase);

  const footnote = document.createElement("p");
  footnote.className = "reviews-deck__footnote";
  footnote.textContent = FOOTNOTE;

  stage.append(card);
  mountEl.append(title, footnote, stage);

  let deck = buildDeckCards(reviews);
  let index = 0;
  let paused = false;
  let showingPunchline = false;
  const punchlineText = reviews.punchline || DEFAULT_PUNCHLINE;

  const scheduleFit = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        fitPhraseToCard(phrase, card);
      });
    });
  };

  const showCard = (entry) => {
    showingPunchline = false;
    card.hidden = false;
    card.classList.remove("is-exiting", "reviews-deck__card--punchline");
    phrase.textContent = quoteText(entry.quote);
    phrase.className = `reviews-deck__phrase reviews-deck__phrase--${entry.tone}`;

    window.requestAnimationFrame(() => {
      card.classList.add("is-visible");
      scheduleFit();
    });
  };

  const showPunchline = () => {
    showingPunchline = true;
    card.hidden = false;
    card.classList.remove("is-exiting");
    card.classList.add("reviews-deck__card--punchline", "is-visible");
    phrase.textContent = punchlineText;
    phrase.className = "reviews-deck__phrase reviews-deck__phrase--punchline";
    scheduleFit();
  };

  const advance = () => {
    if (paused || deck.length === 0) {
      return;
    }

    if (showingPunchline) {
      deck = buildDeckCards(reviews);
      index = 0;
      showCard(deck[0]);
      return;
    }

    index += 1;
    if (index >= deck.length) {
      showPunchline();
      return;
    }

    if (!prefersReducedMotion()) {
      card.classList.add("is-exiting");
      timers.schedule(() => {
        if (!showingPunchline && index < deck.length) {
          showCard(deck[index]);
        }
      }, 220);
      return;
    }

    showCard(deck[index]);
  };

  const start = () => {
    if (deck.length === 0) {
      return;
    }
    showCard(deck[0]);
    timers.every(advance, DECK_INTERVAL_MS);
  };

  mountEl.addEventListener("mouseenter", () => {
    paused = true;
  });
  mountEl.addEventListener("mouseleave", () => {
    paused = false;
  });
  mountEl.addEventListener("focusin", () => {
    paused = true;
  });
  mountEl.addEventListener("focusout", () => {
    paused = false;
  });

  const onResize = () => {
    if (!showingPunchline && !card.hidden) {
      fitPhraseToCard(phrase, card);
    }
  };
  window.addEventListener("resize", onResize, { passive: true });
  const originalClear = timers.clear;
  timers.clear = () => {
    window.removeEventListener("resize", onResize);
    originalClear();
  };

  mountEl.__advanceDeck = advance;
  mountEl.__getDeck = () => deck;
  mountEl.__isShowingPunchline = () => showingPunchline;
  mountEl.__fitPhraseToCard = () => fitPhraseToCard(phrase, card);

  start();
}

function renderReviews(mountEl, reviews) {
  if (!mountEl || !reviews) {
    return;
  }

  clearActiveTimers(mountEl);
  const timers = createTimerBag();
  mountEl.__reviewsTimers = timers;
  renderReviewDeck(mountEl, reviews, timers);
}

export function initReviews(siteConfig) {
  const mountEl = document.querySelector("#ep-reviews");
  if (!mountEl) {
    return;
  }

  const reviews = siteConfig?.reviews;
  if (!reviews) {
    return;
  }

  renderReviews(mountEl, reviews);
}

export const __testables__ = {
  renderReviews,
  renderReviewDeck,
  quoteText,
  shuffle,
  buildDeckCards,
  fitPhraseToCard,
  phraseCharCount,
  FOOTNOTE,
  DECK_INTERVAL_MS,
  CARD_HEIGHT_REM,
  PHRASE_FILL_RATIO,
  clearActiveTimers,
  createTimerBag
};
