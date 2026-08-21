import WaveSurfer from "wavesurfer.js";
import { tracks } from "../config/track-data.js";

let audioContext = null;
let analyser = null;
let rafId = 0;
const instances = [];
const PLAY_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M8 5v14l11-7z" fill="currentColor"></path>
  </svg>
`;
const PAUSE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"></path>
  </svg>
`;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function ensureAnalyser() {
  if (analyser && audioContext) {
    return;
  }
  audioContext = audioContext || new window.AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
}

function updateAudioReactiveCss() {
  if (!analyser) {
    return;
  }
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const avg = data.reduce((sum, value) => sum + value, 0) / (data.length * 255);
  const bassBins = Math.max(1, Math.floor(data.length * 0.14));
  const bass =
    data.slice(0, bassBins).reduce((sum, value) => sum + value, 0) / (bassBins * 255);

  document.documentElement.style.setProperty("--audio-intensity", avg.toFixed(3));
  document.documentElement.style.setProperty("--audio-bass", bass.toFixed(3));

  rafId = window.requestAnimationFrame(updateAudioReactiveCss);
}

function stopAudioReactiveCss() {
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
  document.documentElement.style.setProperty("--audio-intensity", "0");
  document.documentElement.style.setProperty("--audio-bass", "0");
}

function isPresentString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function renderGenreChips(track) {
  const labels = [track.genre, track.subGenre].filter(isPresentString).map((label) => label.trim());
  if (labels.length === 0) {
    return "";
  }

  return labels
    .map((label) => `<span class="track-card__meta-chip">${label}</span>`)
    .join(` <span class="track-card__meta-divider" aria-hidden="true">/</span> `);
}

function renderTrackMeta(track) {
  const facts = [];
  if (isPresentString(track.key)) {
    facts.push(track.key.trim());
  }
  if (Number.isFinite(track.bpm)) {
    facts.push(`${track.bpm} BPM`);
  }

  const factsHtml = facts.length
    ? `<span class="track-card__meta-facts">${facts.join(" · ")}</span>`
    : "";
  const chipsHtml = renderGenreChips(track);

  if (!factsHtml && !chipsHtml) {
    return "";
  }

  const parts = [factsHtml, chipsHtml].filter(Boolean);
  return `<p class="track-card__meta">${parts.join(
    ` <span class="track-card__meta-sep" aria-hidden="true">·</span> `
  )}</p>`;
}

function renderTrackCard(track) {
  const card = document.createElement("article");
  card.className = "track-card";
  card.id = `track-${track.id}`;
  card.dataset.trackId = track.id;
  const metaLine = renderTrackMeta(track);
  card.innerHTML = `
    <div class="track-card__head">
      <div>
        <h3 class="track-card__title">${track.title}</h3>
        ${metaLine}
      </div>
      <div class="track-card__actions">
        <button type="button" class="track-card__button" data-action="play" aria-label="Play track">
          ${PLAY_ICON}
        </button>
        <span class="track-card__time" data-role="time">0:00 / --:--</span>
      </div>
    </div>
    <div class="track-card__player-row">
      <div class="track-card__wave" id="wave-${track.id}"></div>
      <div class="track-card__meta-actions">
        <a class="track-card__download" href="/songs/${encodeURIComponent(track.filename)}" ${
          track.downloadable ? "download" : ""
        }>Download</a>
        <button type="button" class="track-card__story-toggle" data-story-toggle>Behind this track</button>
        <button type="button" class="track-card__lyrics-toggle" data-lyrics-toggle>Lyrics</button>
      </div>
    </div>
    <div class="track-card__story" data-story>
      <button type="button" class="track-card__story-close" data-story-close>Close</button>
      <p>${track.story}</p>
    </div>
  `;
  return card;
}

function setPlayButtonState(button, isPlaying) {
  button.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
  button.setAttribute("aria-label", isPlaying ? "Pause track" : "Play track");
}

function connectAnalyserFromWave(waveSurfer) {
  try {
    ensureAnalyser();
    const mediaElement = waveSurfer.getMediaElement();
    if (!mediaElement) {
      return;
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    if (!mediaElement.dataset.audioConnected) {
      const source = audioContext.createMediaElementSource(mediaElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      mediaElement.dataset.audioConnected = "true";
    }
  } catch {
    // Ignore duplicate media element source connection errors.
  }
}

function playNext(currentId) {
  const index = instances.findIndex((item) => item.id === currentId);
  if (index < 0 || index >= instances.length - 1) {
    return false;
  }

  const next = instances[index + 1];
  next.waveSurfer.play();
  return true;
}

export function playTrackById(trackId) {
  const item = instances.find((entry) => entry.id === trackId);
  if (!item) {
    return false;
  }

  item.waveSurfer.play();
  return true;
}

export function initWaveformPlayer() {
  const mount = document.querySelector("#waveform-player");
  if (!mount) {
    return;
  }

  mount.classList.add("waveform-player");
  instances.length = 0;

  tracks.forEach((track) => {
    const card = renderTrackCard(track);
    mount.append(card);

    const waveContainer = card.querySelector(`#wave-${track.id}`);
    const playButton = card.querySelector('[data-action="play"]');
    const timeLabel = card.querySelector('[data-role="time"]');
    if (!waveContainer || !playButton || !timeLabel) {
      return;
    }

    const waveSurfer = WaveSurfer.create({
      container: waveContainer,
      waveColor: "rgba(255, 255, 255, 0.92)",
      progressColor: "rgba(255, 255, 255, 1)",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 64,
      url: `/songs/${encodeURIComponent(track.filename)}`
    });

    instances.push({ id: track.id, waveSurfer, playButton, card });

    waveSurfer.on("ready", () => {
      timeLabel.textContent = `0:00 / ${formatTime(waveSurfer.getDuration())}`;
    });

    waveSurfer.on("audioprocess", () => {
      timeLabel.textContent = `${formatTime(waveSurfer.getCurrentTime())} / ${formatTime(
        waveSurfer.getDuration()
      )}`;
    });

    waveSurfer.on("play", () => {
      instances.forEach((item) => {
        if (item.id !== track.id) {
          item.waveSurfer.pause();
          setPlayButtonState(item.playButton, false);
          item.card.classList.remove("is-playing");
        }
      });
      setPlayButtonState(playButton, true);
      card.classList.add("is-playing");
      connectAnalyserFromWave(waveSurfer);
      if (!rafId) {
        updateAudioReactiveCss();
      }
    });

    waveSurfer.on("pause", () => {
      setPlayButtonState(playButton, false);
      card.classList.remove("is-playing");
      if (!instances.some((item) => item.waveSurfer.isPlaying())) {
        stopAudioReactiveCss();
      }
    });

    waveSurfer.on("finish", () => {
      setPlayButtonState(playButton, false);
      card.classList.remove("is-playing");
      if (!playNext(track.id)) {
        stopAudioReactiveCss();
      }
    });

    playButton.addEventListener("click", () => waveSurfer.playPause());
  });
}

export const __testables__ = {
  renderTrackMeta,
  renderTrackCard,
  playNext,
  playTrackById,
  getInstances: () => instances
};
