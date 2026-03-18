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

function renderTrackCard(track) {
  const card = document.createElement("article");
  card.className = "track-card";
  card.dataset.trackId = track.id;
  card.innerHTML = `
    <div class="track-card__head">
      <div>
        <h3 class="track-card__title">${track.title}</h3>
        <p class="track-card__artist">${track.artist}</p>
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

export function initWaveformPlayer() {
  const mount = document.querySelector("#waveform-player");
  if (!mount) {
    return;
  }

  mount.classList.add("waveform-player");

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

    instances.push({ id: track.id, waveSurfer, playButton });

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
        }
      });
      setPlayButtonState(playButton, true);
      connectAnalyserFromWave(waveSurfer);
      if (!rafId) {
        updateAudioReactiveCss();
      }
    });

    waveSurfer.on("pause", () => {
      setPlayButtonState(playButton, false);
      if (!instances.some((item) => item.waveSurfer.isPlaying())) {
        stopAudioReactiveCss();
      }
    });

    waveSurfer.on("finish", () => {
      setPlayButtonState(playButton, false);
      stopAudioReactiveCss();
    });

    playButton.addEventListener("click", () => waveSurfer.playPause());
  });
}
