const LOCK_SELECTORS = [".section-nav", ".hero-content", "main", ".site-footer"];
const HIDE_SELECTORS = [...LOCK_SELECTORS, "#lyric-fragments-layer"];

function setHeadlineWithBreak(headline, text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  headline.replaceChildren();
  if (words.length === 0) {
    return;
  }
  headline.append(`"${words[0].replace(/^["“”']+|["“”']+$/g, "")}"`);
  if (words.length === 1) {
    return;
  }
  headline.append(document.createElement("br"));
  headline.append(words.slice(1).join(" "));
}

function queryNodes(root, selectors) {
  return selectors.map((selector) => root.querySelector(selector)).filter(Boolean);
}

function setContentLocked(locked, root = document) {
  queryNodes(root, HIDE_SELECTORS).forEach((node) => {
    if (locked) {
      node.setAttribute("inert", "");
      return;
    }
    node.removeAttribute("inert");
  });

  queryNodes(root, LOCK_SELECTORS).forEach((node) => {
    if (locked) {
      node.setAttribute("aria-hidden", "true");
      return;
    }
    node.removeAttribute("aria-hidden");
  });
}

export function initComingSoon(config, root = document) {
  const overlay = root.querySelector("#coming-soon");
  if (!overlay) {
    return;
  }

  const enabled = Boolean(config?.comingSoon?.enabled);
  const headline = overlay.querySelector("#coming-soon-headline");
  const date = overlay.querySelector("#coming-soon-date");

  if (headline && config?.comingSoon?.headline) {
    setHeadlineWithBreak(headline, config.comingSoon.headline);
  }

  if (date && config?.comingSoon?.dateLabel) {
    date.textContent = config.comingSoon.dateLabel;
  }

  const body = root.body ?? (root === document ? document.body : root.querySelector("body"));
  const rootElement = body?.ownerDocument?.documentElement;

  if (!enabled) {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.removeAttribute("aria-modal");
    body?.classList.remove("coming-soon-active");
    rootElement?.classList.remove("coming-soon-active");
    setContentLocked(false, root);
    return;
  }

  overlay.hidden = false;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.removeAttribute("aria-hidden");
  body?.classList.add("coming-soon-active");
  rootElement?.classList.add("coming-soon-active");
  const view = body?.ownerDocument?.defaultView;
  view?.scrollTo(0, 0);
  setContentLocked(true, root);
}

export const __testables__ = {
  LOCK_SELECTORS,
  HIDE_SELECTORS,
  setContentLocked
};
