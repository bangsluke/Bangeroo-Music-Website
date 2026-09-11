import { tracks } from "../config/track-data.js";

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

function renderTracklist(trackList = tracks, ep = null) {
  const list = document.createElement("ol");
  list.className = "ep-release__tracklist";
  list.setAttribute("aria-label", "EP track listing");

  trackList.forEach((track, index) => {
    const item = document.createElement("li");
    item.className = "ep-release__track";

    const number = document.createElement("span");
    number.className = "ep-release__track-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("a");
    title.className = "ep-release__track-title";
    title.href = `#track-${track.id}`;
    title.setAttribute("data-scroll-link", "");
    title.setAttribute("data-play-track", track.id);
    title.textContent = track.title;

    item.append(number, title);
    list.append(item);
  });

  const spotifyCta = renderSpotifyCta(ep);
  if (spotifyCta) {
    list.append(spotifyCta);
  }

  return list;
}

function renderCoverRow(ep, trackList = tracks) {
  const row = document.createElement("div");
  row.className = "ep-release__cover-row";
  row.append(renderArtwork(ep), renderTracklist(trackList, ep));
  return row;
}

function renderSpotifyCta(ep) {
  if (!ep?.spotifyUrl) {
    return null;
  }

  const item = document.createElement("li");
  item.className = "ep-release__track--spotify";

  const cta = document.createElement("a");
  cta.className = "ep-release__spotify-cta";
  cta.href = ep.spotifyUrl;
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  cta.setAttribute("data-umami-event", "ep-spotify-click");
  cta.textContent = `Listen to ${ep.title || "Finally"} on Spotify`;

  item.append(cta);
  return item;
}

function renderEpRelease(contentMount, ep, trackList = tracks) {
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

  const reviewsMount = document.createElement("div");
  reviewsMount.id = "ep-reviews";
  reviewsMount.className = "ep-release__reviews";
  reviewsMount.setAttribute("aria-label", "Paid review phrases");

  contentMount.append(header, blurb, reviewsMount, renderCoverRow(ep, trackList));
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
  renderArtwork,
  renderTracklist,
  renderCoverRow,
  renderSpotifyCta
};
