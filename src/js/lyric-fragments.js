function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function initLyricFragments(siteConfig) {
  const layer = document.querySelector("#lyric-fragments-layer");
  const lyrics = siteConfig?.lyrics || [];
  if (!layer || !lyrics.length) {
    return;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  const nodes = lyrics.map((line, index) => {
    const node = document.createElement("span");
    node.className = "lyric-fragment glitch-text";
    node.textContent = line;
    node.setAttribute("data-text", line);
    if (index % 2 === 0) {
      node.style.left = `${8 + Math.random() * 24}%`;
    } else {
      node.style.right = `${8 + Math.random() * 24}%`;
    }
    node.style.top = `${12 + ((index % 6) * 12)}%`;
    layer.append(node);
    return {
      node,
      start: 0.15 + index * 0.08,
      end: 0.15 + index * 0.08 + 0.1
    };
  });

  const onScroll = () => {
    const full = document.documentElement.scrollHeight - window.innerHeight;
    const progress = full > 0 ? window.scrollY / full : 0;
    nodes.forEach((item) => {
      const active = progress >= item.start && progress <= item.end;
      item.node.classList.toggle("is-active", active);
      item.node.style.opacity = active ? String(clamp(0.28 + Math.random() * 0.12, 0.28, 0.4)) : "0";
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

export const __testables__ = {
  clamp
};
