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
    const name = typeof artist === "string" ? artist : artist?.name;
    const spotifyUrl = typeof artist === "object" ? artist?.spotifyUrl : null;

    if (!name) {
      return;
    }

    if (spotifyUrl) {
      const link = document.createElement("a");
      link.className = "content-chip influences__chip";
      link.href = spotifyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = name;
      link.setAttribute("aria-label", `Open ${name} on Spotify`);
      item.append(link);
    } else {
      const chip = document.createElement("span");
      chip.className = "content-chip influences__chip";
      chip.textContent = name;
      item.append(chip);
    }

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
