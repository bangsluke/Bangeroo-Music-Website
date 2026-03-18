# Bangeroo

Single-page music showcase website for The Bangs Collective.

## Features

- Design C-based single-page layout with mobile section navigation.
- Self-hosted waveform player (`wavesurfer.js`) using audio files from `public/songs/`.
- Spotify embed retained in a dedicated `#spotify-player` section.
- Streaming platform links (Spotify, SoundCloud, Apple Music, Amazon Music).
- Gallery carousel (Splide) with fade transitions and desktop half-height treatment.
- VHS intro, lyric fragments, palette randomizer, guestbook, visitor counter, and Spotify now-playing indicator.

## Tech Stack

- Vite (vanilla JavaScript)
- Vanilla HTML/CSS/JS (ES2022+)
- Splide.js (carousel)
- wavesurfer.js
- Netlify Functions + Supabase backend integration
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

- Main config: `src/config/site-config.js`
- Track config: `src/config/track-data.js`

## External Setup

- Follow `SETUP-GUIDE.md` for Supabase, Spotify, and Netlify environment setup.
