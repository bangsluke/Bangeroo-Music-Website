# Bangeroo

Four-variant music showcase website for The Bangs Collective for A/B design testing.

## Features

- Four design variants with hero arrow navigation:
  - Design A: `/`
  - Design B (glitch): `/design-b.html`
  - Design C (video-led): `/design-c.html`
  - Design D (collage chaos): `/design-d.html`
- Randomized chaos effects engine across all designs:
  - screen shake pulses,
  - text jitter/flicker bursts,
  - character disappear/reappear glitches,
  - design-specific scroll/reveal motion signatures.
- Full-screen hero with logo, bio, and contact links.
- Lazy-loaded Spotify artist embed with fallback link.
- Auto-rotating Splide gallery with placeholder and empty-state handling (capped at 90vh).
- Easter egg interaction that resets after 5 seconds.
- Umami-ready event tracking hooks and Google Apps Script monthly report script.

## Tech Stack

- Vite (vanilla JavaScript)
- Vanilla HTML/CSS/JS (ES2022+)
- Splide.js (carousel)
- Umami analytics
- Netlify static hosting

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Testing

```bash
npm test
```

## Netlify Deployment

- Build command: `npm run build`
- Publish directory: `dist`
- Config file: `netlify.toml`

## Build-time Config

- Edit contact and bio values in `config/site-config.js`.
- This config is bundled at build time, so deploy after changes.

## Revert to One Design

- Keep `src/index.html` only.
- Remove `design-b.html`, `design-c.html`, and `design-d.html` from `vite.config.js` build inputs.
- Remove the hero design arrows markup if no longer needed.

## Chaos Tuning

- JS runtime: `src/js/chaos-effects.js` (pulse frequency, randomization, character glitching).
- Scroll reveal randomization: `src/js/lazy-load.js`.
- Visual effect keyframes and class hooks: `src/css/base.css` and `src/css/variant-*.css`.
