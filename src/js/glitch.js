export function initGlitchEffects() {
  const glitchNodes = document.querySelectorAll(".glitch-text");
  glitchNodes.forEach((node) => {
    if (!node.getAttribute("data-text")) {
      node.setAttribute("data-text", node.textContent?.trim() || "");
    }
  });
}
