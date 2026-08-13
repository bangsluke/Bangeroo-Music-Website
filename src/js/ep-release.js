function renderArtwork(ep) {
  if (ep.artwork) {
    const figure = document.createElement("figure");
    figure.className = "ep-release__artwork";
    const img = document.createElement("img");
    img.src = ep.artwork;
    img.alt = `${ep.title} EP cover`;
    figure.append(img);
    return figure;
  }

  const placeholder = document.createElement("div");
  placeholder.className = "ep-release__artwork-placeholder";
  placeholder.setAttribute("aria-label", ep.artworkNote || "EP artwork pending");
  placeholder.textContent = ep.artworkNote || "Artwork for EP cover to be added when finalised";
  return placeholder;
}

function renderEpRelease(contentMount, ep) {
  contentMount.classList.add("ep-release__content");
  contentMount.innerHTML = "";

  const header = document.createElement("div");
  header.className = "ep-release__header";

  const label = document.createElement("p");
  label.className = "ep-release__label";
  label.textContent = "EP Release";

  const title = document.createElement("h3");
  title.className = "ep-release__title";
  title.textContent = ep.title || "Finally";

  header.append(label, title);

  const blurb = document.createElement("p");
  blurb.className = "ep-release__blurb";
  blurb.textContent = ep.blurb || "";

  const genres = document.createElement("ul");
  genres.className = "ep-release__genres content-chips";
  (ep.genres || []).forEach((genre) => {
    const item = document.createElement("li");
    item.className = "content-chip";
    item.textContent = genre;
    genres.append(item);
  });

  contentMount.append(header, blurb, genres, renderArtwork(ep));
}

export function initEpRelease(siteConfig) {
  const mount = document.querySelector("#ep-release");
  const contentMount = document.querySelector("#ep-release-content");
  if (!mount || !contentMount) {
    return;
  }

  const ep = siteConfig?.ep;
  if (!ep) {
    return;
  }

  mount.classList.add("ep-release");
  renderEpRelease(contentMount, ep);
}

export const __testables__ = {
  renderEpRelease,
  renderArtwork
};
