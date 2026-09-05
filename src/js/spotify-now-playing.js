function renderOffline(dot, textNode, wrap, mode) {
  dot.classList.remove("pulse-dot--online");
  dot.classList.add("pulse-dot--offline");
  wrap.classList.remove("is-marquee");
  textNode.textContent = mode === "hero" ? "MB Offline" : "MB Offline";
}

export function initSpotifyNowPlaying(siteConfig) {
  const endpoint = siteConfig?.spotify?.nowPlayingEndpoint;
  if (!endpoint) {
    return;
  }

  const targets = Array.from(document.querySelectorAll("[data-now-playing-target]"))
    .map((root) => {
      const dot = root.querySelector("[data-now-playing-dot]");
      const textNode = root.querySelector("[data-now-playing-text]");
      const wrap = root.querySelector("[data-now-playing-wrap]");
      const mode = root.getAttribute("data-now-playing-mode") || "header";
      if (!dot || !textNode || !wrap) {
        return null;
      }
      return { root, dot, textNode, wrap, mode };
    })
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  const setTooltip = (root, message) => {
    root.setAttribute("title", message);
    root.setAttribute("aria-label", message);
  };

  const applyOfflineState = () => {
    targets.forEach(({ root, dot, textNode, wrap, mode }) => {
      renderOffline(dot, textNode, wrap, mode);
      setTooltip(root, "MB Offline on Spotify.");
    });
  };

  const pollMs = Math.max(5000, Number(siteConfig.spotify.pollIntervalMs) || 15000);

  const refresh = async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        applyOfflineState();
        return;
      }
      const data = await response.json();
      if (data?.isPlaying) {
        const artist = data.artist || "Unknown artist";
        const track = data.track || "Unknown track";
        targets.forEach(({ root, dot, textNode, wrap, mode }) => {
          dot.classList.remove("pulse-dot--offline");
          dot.classList.add("pulse-dot--online");
          wrap.classList.remove("is-marquee");
          textNode.textContent = mode === "hero" ? `MB Online - ${artist} - ${track}` : "MB Online";
          setTooltip(root, `Now playing: ${artist} - ${track}`);
        });
        return;
      }
      applyOfflineState();
    } catch {
      applyOfflineState();
    }
  };

  refresh();
  window.setInterval(refresh, pollMs);
}
