function renderOffline(dot, textNode, wrap) {
  dot.classList.remove("pulse-dot--online");
  dot.classList.add("pulse-dot--offline");
  wrap.classList.remove("is-marquee");
  textNode.textContent = "MB Offline";
}

export function initSpotifyNowPlaying(siteConfig) {
  const endpoint = siteConfig?.spotify?.nowPlayingEndpoint;
  if (!endpoint) {
    return;
  }

  const dot = document.querySelector("#now-playing-dot");
  const textNode = document.querySelector("#now-playing-text");
  const wrap = document.querySelector(".now-playing-text-wrap");
  if (!dot || !textNode || !wrap) {
    return;
  }

  const pollMs = Math.max(5000, Number(siteConfig.spotify.pollIntervalMs) || 30000);

  const refresh = async () => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        renderOffline(dot, textNode, wrap);
        return;
      }
      const data = await response.json();
      if (data?.isPlaying) {
        dot.classList.remove("pulse-dot--offline");
        dot.classList.add("pulse-dot--online");
        wrap.classList.remove("is-marquee");
        textNode.textContent = "MB Online";
        return;
      }
      renderOffline(dot, textNode, wrap);
    } catch {
      renderOffline(dot, textNode, wrap);
    }
  };

  refresh();
  window.setInterval(refresh, pollMs);
}
