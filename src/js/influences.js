function renderInfluences(introEl, listEl, outroEl, influences) {
  if (introEl) {
    introEl.textContent = influences.intro || "";
  }

  if (outroEl) {
    outroEl.textContent = influences.outro || "";
  }

  if (!listEl) {
    return;
  }

  listEl.innerHTML = "";
  (influences.artists || []).forEach((artist) => {
    const item = document.createElement("li");
    item.className = "content-chip influences__chip";
    item.textContent = artist;
    listEl.append(item);
  });
}

export function initInfluences(siteConfig) {
  const section = document.querySelector("#influences");
  if (!section) {
    return;
  }

  const influences = siteConfig?.influences;
  if (!influences) {
    return;
  }

  const introEl = document.querySelector("#influences-intro");
  const listEl = document.querySelector("#influences-list");
  const outroEl = document.querySelector("#influences-outro");

  renderInfluences(introEl, listEl, outroEl, influences);
}

export const __testables__ = {
  renderInfluences
};
