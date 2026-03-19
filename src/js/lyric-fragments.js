function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function placeNodeRandomly(node) {
  node.style.left = `${randomInRange(6, 74)}%`;
  node.style.top = `${randomInRange(8, 86)}%`;
}

export function initLyricFragments(siteConfig) {
  const layer = document.querySelector("#lyric-fragments-layer");
  const lyrics = siteConfig?.lyrics || [];
  const fragmentConfig = siteConfig?.lyricFragments || {};
  const configuredInterval = Number(fragmentConfig.intervalMs);
  const configuredVariance = Number(fragmentConfig.varianceMs);
  const configuredVisibleDuration = Number(fragmentConfig.visibleDurationMs);
  const configuredVisibleVariance = Number(fragmentConfig.visibleVarianceMs);
  const intervalMs = Number.isFinite(configuredInterval) ? clamp(configuredInterval, 800, 20000) : 5000;
  const varianceMs = Number.isFinite(configuredVariance)
    ? clamp(configuredVariance, 0, intervalMs - 300)
    : Math.round(intervalMs * 0.45);
  const visibleDurationMs = Number.isFinite(configuredVisibleDuration)
    ? clamp(configuredVisibleDuration, 300, intervalMs * 0.9)
    : Math.round(intervalMs * 0.38);
  const visibleVarianceMs = Number.isFinite(configuredVisibleVariance)
    ? clamp(configuredVisibleVariance, 0, visibleDurationMs - 150)
    : Math.round(visibleDurationMs * 0.35);
  if (!layer || !lyrics.length) {
    return;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  const nodes = lyrics.map((line) => {
    const node = document.createElement("span");
    node.className = "lyric-fragment glitch-text";
    node.textContent = line;
    node.setAttribute("data-text", line);
    placeNodeRandomly(node);
    layer.append(node);
    return node;
  });

  const scheduleNode = (node) => {
    const delayBeforeShow = randomInRange(
      intervalMs - varianceMs,
      intervalMs + varianceMs
    );
    window.setTimeout(() => {
      placeNodeRandomly(node);
      node.style.opacity = String(clamp(randomInRange(0.5, 0.82), 0.5, 0.82));
      node.classList.add("is-active");

      const visibleFor = randomInRange(
        visibleDurationMs - visibleVarianceMs,
        visibleDurationMs + visibleVarianceMs
      );
      window.setTimeout(() => {
        node.classList.remove("is-active");
        node.style.opacity = "0";
        scheduleNode(node);
      }, visibleFor);
    }, delayBeforeShow);
  };

  nodes.forEach((node, index) => {
    const initialDelay = index * randomInRange(180, Math.max(180, intervalMs * 0.18));
    window.setTimeout(() => {
      scheduleNode(node);
    }, initialDelay);
  });
}

export const __testables__ = {
  clamp,
  randomInRange,
  placeNodeRandomly
};
