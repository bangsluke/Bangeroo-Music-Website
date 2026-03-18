const STORAGE_KEY = "bangeroo-palette-index";

function applyPalette(palette) {
  if (!palette) {
    return;
  }
  const root = document.documentElement.style;
  root.setProperty("--color-bg-primary", palette.bgPrimary);
  root.setProperty("--color-bg-secondary", palette.bgSecondary);
  root.setProperty("--color-text-primary", palette.textPrimary);
  root.setProperty("--color-accent", palette.accent);
  root.setProperty("--color-accent-secondary", palette.accentSecondary);
}

export function initColourRandomiser(siteConfig) {
  const palettes = siteConfig?.palettes || [];
  if (!palettes.length) {
    return;
  }

  const targets = document.querySelectorAll(".logo-click-target");
  if (!targets.length) {
    return;
  }

  let index = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
  if (!Number.isFinite(index) || index < 0) {
    index = 0;
  }
  index %= palettes.length;
  applyPalette(palettes[index]);

  targets.forEach((target) => {
    target.addEventListener("click", () => {
      index = (index + 1) % palettes.length;
      sessionStorage.setItem(STORAGE_KEY, String(index));
      applyPalette(palettes[index]);
    });
  });
}

export const __testables__ = {
  applyPalette
};
