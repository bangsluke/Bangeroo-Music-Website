# Bangeroo v2 - Implementation Plan

> **Document purpose:** This is a structured implementation plan for a Cursor AI coding agent. Follow it phase by phase. Each phase is self-contained and deployable. Do not skip sections or make assumptions beyond what is documented here. Generate a `SETUP-GUIDE.md` file as part of Phase 1.

---

## 0. Context and Current State

**Bangeroo** is a single-page personal music showcase website for the Spotify artist **The Bangs Collective**. It is built with **Vite + vanilla HTML/CSS/JS** and deployed to **Netlify**.

### Current dependencies (from `package.json`)

```json
{
  "devDependencies": {
    "jsdom": "^27.0.0",
    "vite": "^8.0.0",
    "vitest": "^3.2.4"
  },
  "dependencies": {
    "@splidejs/splide": "^4.1.4"
  }
}
```

### Colour scheme (from `colourScheme.txt`)

```
Red: #FF0000
Black: #000000
Yellow: #FFD700
Grey: #A9A9A9
White: #FFFFFF
Navy Blue: #132257
Mushroom: #BCABA0
```

### Logo assets provided

Four PNG variants of the Bangeroo logo plus a font reference image (`BANGEROO.png`). The font is **Audiowide** - a free Google Font available at `https://fonts.google.com/specimen/Audiowide`. It is an SIL Open Font Licence font, free for commercial use.

### What this plan changes

The site currently has multiple design variants (A, B, C). This plan:

1. Adopts **Design C** as the base and removes all files exclusive to Designs A and B.
2. Ports the **navigation header from Design A** into Design C.
3. Adds a **self-hosted MP3 waveform player** (using wavesurfer.js) above the existing Spotify embed. The Spotify embed is retained for now but structured so it can be easily removed later.
4. Adds 7 new features (behind-the-track stories, guest book, colour randomiser, Spotify "Tune in" indicator, VHS intro animation, lyric fragments, visitor counter).
5. Adds streaming platform links (Spotify, SoundCloud, iTunes, Amazon Music).
6. Refines the photo gallery (half-height on desktop, bleed transitions).
7. Replaces the logo with styled text using the Audiowide font.

---

## 1. New Dependencies to Install

```bash
npm install wavesurfer.js
```

No other new npm dependencies are required. The Audiowide font is loaded via Google Fonts CDN (no install). All other features are built with vanilla JS/CSS.

For the guest book and visitor counter, the backend uses **Netlify Functions** with **Supabase** as the database. The Supabase JS client is loaded via CDN in the Netlify Function (or installed as a dev dependency if preferred):

```bash
npm install @supabase/supabase-js
```

For the "Tune in" Spotify indicator, a Netlify Function calls the Spotify API. No additional dependency is needed - use native `fetch` (available in Node 18+ which Netlify Functions use by default).

---

## 2. Project Structure Changes

### Files to remove

After confirming that no shared utilities, CSS, or JS from Design A or B are imported by Design C, remove all files that are exclusively part of those designs. This includes any HTML templates, CSS files, or JS modules prefixed or namespaced for designs A/B. **Before deleting, search the entire codebase for imports or references to each file.**

### Files to add

```
src/
├── config/
│   ├── site-config.js          # ★ Central config: streaming links, tracks, lyrics, palettes, contact info
│   └── track-data.js           # Track metadata: title, artist, filename, story blurb, mood tags
├── css/
│   ├── vhs-intro.css           # VHS boot animation styles
│   ├── waveform-player.css     # Wavesurfer player and track card styles
│   ├── guestbook.css           # Guest book / shout wall styles
│   ├── spotify.css             # Spotify embed section + colour filter overlay (removable)
│   ├── visitor-counter.css     # Retro hit counter styles
│   └── lyric-fragments.css    # Floating lyric snippet styles
├── js/
│   ├── waveform-player.js     # Wavesurfer initialisation, play/pause/download, audio-reactive bg
│   ├── track-stories.js       # Behind-the-track overlay toggle logic
│   ├── guestbook.js           # Guest book form submission and message rendering
│   ├── colour-randomiser.js   # Palette cycling on logo click
│   ├── spotify-now-playing.js # Fetches "Tune in" data from Netlify Function
│   ├── vhs-intro.js           # VHS animation controller (auto-remove after play)
│   ├── lyric-fragments.js     # Scroll-triggered lyric display
│   └── visitor-counter.js     # Fetches and displays visitor count
├── assets/
│   ├── audio/                  # MP3 files go here
│   │   └── .gitkeep
│   └── icons/                  # SVG logos for streaming platforms
│       ├── spotify.svg
│       ├── soundcloud.svg
│       ├── itunes.svg
│       └── amazon-music.svg
netlify/
└── functions/
    ├── spotify-now-playing.js  # Netlify Function: Spotify currently-playing proxy
    ├── guestbook-read.js       # Netlify Function: fetch guest book messages
    ├── guestbook-write.js      # Netlify Function: submit new guest book message
    └── visitor-count.js        # Netlify Function: increment and return visitor count
SETUP-GUIDE.md                   # Generated in Phase 1 - all external setup instructions
```

### Central config file (`src/config/site-config.js`)

This file is the single source of truth for all configurable content. The site owner edits this file to customise the site without touching any other code.

```js
export const siteConfig = {
  // ── Contact ──
  contact: {
    email: 'placeholder@email.com',
    phone: '+440000000000',
  },

  // ── Streaming platform links ──
  streamingLinks: {
    spotify: 'https://open.spotify.com/artist/PLACEHOLDER_ID',
    soundcloud: 'https://soundcloud.com/PLACEHOLDER',
    itunes: 'https://music.apple.com/artist/PLACEHOLDER',
    amazonMusic: 'https://music.amazon.co.uk/artists/PLACEHOLDER',
  },

  // ── Spotify embed (retained for now - removable later) ──
  spotifyEmbed: {
    artistId: 'PLACEHOLDER_ID', // Replace with The Bangs Collective Spotify artist ID
    theme: 0, // 0 = dark mode
  },

  // ── Spotify "Tune in" ──
  spotify: {
    nowPlayingEndpoint: '/.netlify/functions/spotify-now-playing',
    pollIntervalMs: 30000, // How often to check (30 seconds)
  },

  // ── Colour palettes for randomiser ──
  palettes: [
    {
      name: 'Default',
      bgPrimary: '#000000',
      bgSecondary: '#132257',
      textPrimary: '#FFFFFF',
      accent: '#FF0000',
      accentSecondary: '#FFD700',
    },
    {
      name: 'Midnight Gold',
      bgPrimary: '#0a0a1a',
      bgSecondary: '#1a1a3e',
      textPrimary: '#FFD700',
      accent: '#FF0000',
      accentSecondary: '#FFFFFF',
    },
    {
      name: 'Concrete',
      bgPrimary: '#1a1a1a',
      bgSecondary: '#2d2d2d',
      textPrimary: '#BCABA0',
      accent: '#FFD700',
      accentSecondary: '#FF0000',
    },
    // Add more palettes as desired
  ],

  // ── Lyric fragments (displayed on scroll between sections) ──
  lyrics: [
    'we were electric before the fade',
    'static in the bloodstream',
    'turn it up until the walls crack',
    'midnight never felt this loud',
    'every frequency a memory',
    'the bass line wrote itself',
    'silence is just noise waiting',
    'we broke the dial',
  ],

  // ── Visitor counter milestones ──
  counterMilestones: {
    1: 'You are the first. Legend.',
    10: '10 people have tuned in',
    50: '50 souls have entered the frequency',
    100: '100 legends have visited',
    500: 'Half a thousand. We see you.',
    1000: 'You are visitor 1,000 - tell no one',
  },

  // ── Guestbook ──
  guestbook: {
    maxLength: 100,
    readEndpoint: '/.netlify/functions/guestbook-read',
    writeEndpoint: '/.netlify/functions/guestbook-write',
  },

  // ── Visitor counter ──
  visitorCounter: {
    endpoint: '/.netlify/functions/visitor-count',
  },
};
```

### Track data file (`src/config/track-data.js`)

```js
export const tracks = [
  {
    id: 'track-1',
    title: 'Placeholder Track',
    artist: 'The Bangs Collective',
    filename: 'placeholder.mp3', // Relative to /assets/audio/
    duration: '3:45',
    story: 'This track was born at 2am in a garage in South London. The bass line came first - a happy accident from a broken effects pedal.',
    mood: ['wired', 'chaos'],
    downloadable: true,
  },
  // Add more tracks as MP3 files are provided
];
```

---

## 3. Implementation Phases

This plan is split into **4 phases**. Each phase produces a deployable site. Phases can be implemented in separate sessions.

---

### Phase 1 - Foundation and Design Consolidation

**Goal:** Design C is the sole design, the nav from Design A is integrated, the Audiowide font is live, the hero is updated, and the `SETUP-GUIDE.md` is generated.

| # | Task | Detail |
|---|---|---|
| 1.1 | **Identify and remove Design A/B files** | Search the codebase for all files exclusive to Designs A and B. Before deleting each file, run a global search for its filename across all `.html`, `.js`, and `.css` files to confirm it is not imported or referenced by Design C. Remove confirmed orphan files. |
| 1.2 | **Port Design A navigation header into Design C** | Copy the navigation header HTML from Design A's markup into Design C's `index.html`. Copy associated CSS into the appropriate stylesheet. **Critical: on mobile, the hamburger menu items must be hidden by default.** Add a `.nav-menu` class that is `display: none` on mobile. Add a hamburger icon button (`.nav-toggle`) that toggles a `.nav-menu--open` class on click, setting `display: block`. Ensure the toggle works without any framework - use `addEventListener('click', ...)` on the button. |
| 1.3 | **Load Audiowide font** | Add the Google Fonts link to `<head>`: `<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet">`. In `theme.css`, set `--font-family-heading: 'Audiowide', sans-serif;`. Apply this font to the site logo text, hero heading, and section headings. |
| 1.4 | **Replace hero logo with styled text** | Remove the image-based logo from the hero section. Replace it with an `<h1>` element containing "BANGEROO" styled with the Audiowide font, `letter-spacing: 0.15em`, `text-transform: uppercase`, and the `glitch-text` class. Centre it horizontally and vertically within the hero. Remove any arrows or design-page-reference elements from the hero. |
| 1.5 | **Create `src/config/site-config.js`** | Create the central config file with the full structure shown in §2 above. All placeholder values are clearly marked. |
| 1.6 | **Create `src/config/track-data.js`** | Create the track data file with one placeholder track entry as shown in §2. |
| 1.7 | **Create `SETUP-GUIDE.md`** | Generate a markdown file in the project root with step-by-step instructions for all external setup (see §6 below for full content specification). |
| 1.8 | **Verify and deploy** | Run `npm run build`, confirm zero errors. Run `npm run dev` and verify: Design C renders correctly, nav header works on mobile (hamburger toggle), Audiowide font renders on the logo, hero shows centred "BANGEROO" text with no arrows. |

---

### Phase 2 - MP3 Waveform Player and Streaming Links

**Goal:** The self-hosted MP3 player with waveform visualisation is functional, audio-reactive background effects are triggered during playback, behind-the-track stories toggle, streaming platform links are displayed, and the gallery is refined.

| # | Task | Detail |
|---|---|---|
| 2.1 | **Install wavesurfer.js** | Run `npm install wavesurfer.js`. Import it in `waveform-player.js` as `import WaveSurfer from 'wavesurfer.js'`. |
| 2.2 | **Build the waveform player section** | Create a `<section id="music">` in `index.html`. For each track in `track-data.js`, render a **track card** containing: the track title and artist name (Audiowide font), a waveform container `<div>`, a play/pause button (inline SVG icons), a time display (current / total), and a download button (`<a>` with `download` attribute pointing to the MP3 file). Style with `waveform-player.css`. |
| 2.3 | **Initialise wavesurfer.js** | In `waveform-player.js`, for each track card, create a WaveSurfer instance: `WaveSurfer.create({ container: trackCardWaveformDiv, waveColor: 'var(--color-accent)', progressColor: 'var(--color-accent-secondary)', barWidth: 2, barGap: 1, barRadius: 2, height: 64, url: '/assets/audio/' + track.filename })`. Wire the play/pause button to `wavesurfer.playPause()`. Update the time display on the `audioprocess` and `ready` events. **Ensure only one track plays at a time** - when a track starts, pause all other instances. |
| 2.4 | **Audio-reactive background** | When a track is playing, connect wavesurfer's media element to a Web Audio API `AnalyserNode` to read frequency data. Use `getByteFrequencyData()` in a `requestAnimationFrame` loop. Map the average amplitude to CSS custom properties on `document.documentElement`: `--audio-intensity` (0 to 1, based on volume) and `--audio-bass` (0 to 1, based on low-frequency energy). In `glitch.css`, use these variables to modulate glitch animation speed, scan-line opacity, and background colour pulse. For example: `animation-duration: calc(var(--glitch-duration) * (1 - var(--audio-intensity) * 0.5))` makes glitch effects faster when music is louder. When playback stops, reset both variables to 0 with a CSS transition for smooth fade-out. **Important:** Call `wavesurfer.getMediaElement()` to get the `<audio>` element, then create an `AudioContext`, connect the media element as a source via `createMediaElementSource()`, connect to an `AnalyserNode`, and connect the analyser to `context.destination` so audio still plays through speakers. Only create one `AudioContext` per page - reuse it across tracks. |
| 2.5 | **Behind-the-track stories** | Add a "Story" toggle button (a small `ℹ` icon or "Behind this track" text link) to each track card. On click, toggle a `.story-visible` class on the track card that reveals an overlay `<div>` containing the story text from `track-data.js`. Style the overlay as a semi-transparent dark panel sliding up from the bottom of the track card. The story text should use the body font (not Audiowide). Add a close button (✕) to dismiss. |
| 2.6 | **Streaming platform SVG links** | Below the music section, add a row of four white SVG icons: Spotify, SoundCloud, iTunes/Apple Music, Amazon Music. Each is an `<a>` linking to the URL from `site-config.js`. On hover, the icon pulses with the glitch effect. Icons should be `40px` height, spaced evenly, centred. Create clean inline SVG icons for each platform (simple monochrome logos) or use well-known freely available SVG icons. Place them in `src/assets/icons/`. |
| 2.7 | **Retain Spotify embed section** | Below the MP3 waveform player and streaming links, add a `<section id="spotify-player">` containing the Spotify iframe embed. Use the URL format `https://open.spotify.com/embed/artist/{ARTIST_ID}?utm_source=generator&theme=0` with the artist ID stored in `site-config.js`. Set iframe attributes: `width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"`. Wrap the iframe in a `.spotify-embed-wrapper` div. Apply a CSS colour filter overlay to shift the Spotify green towards the site's palette: use a `::after` pseudo-element with `background: var(--color-bg-secondary); mix-blend-mode: hue; opacity: 0.4; pointer-events: none;` (the `pointer-events: none` is critical so clicks pass through to the iframe). Lazy-load the iframe using the existing Intersection Observer - set the URL in `data-src` and copy it to `src` when the section enters the viewport. Style with `spotify.css`. Add a section heading "Full Discography" above the embed. **Structure this section so it can be cleanly removed later** - all Spotify-embed-specific CSS is in `spotify.css`, all HTML is within the `#spotify-player` section, and no other module depends on it. |
| 2.8 | **Gallery refinement** | In the gallery section CSS, add a media query for desktop (`min-width: 1024px`) that sets the gallery container `max-height` to `50vh` with `overflow: hidden`. For the image transitions, replace the default Splide fade with a **bleed transition**: use Splide's `type: 'fade'` option combined with a CSS transition that cross-fades between slides over 1.5 seconds (`transition: opacity 1.5s ease`). This creates a smooth bleed effect where the outgoing image dissolves into the incoming one. |
| 2.9 | **Verify and deploy** | Run `npm run build`. Add a test MP3 file to `src/assets/audio/` and update `track-data.js` to reference it. Verify: waveform renders, play/pause works, download link works, only one track plays at a time, audio-reactive CSS variables update during playback, behind-the-track overlay toggles correctly, streaming platform icons render and link correctly, Spotify embed loads and is interactive (clicks pass through the colour overlay), gallery is half-height on desktop with bleed transitions. |

---

### Phase 3 - VHS Intro, Lyric Fragments, Colour Randomiser, Time-of-Day

**Goal:** Visual polish features are live - VHS boot animation, floating lyrics on scroll, colour palette cycling, and time-based mood shifts.

| # | Task | Detail |
|---|---|---|
| 3.1 | **VHS intro animation** | Create a full-screen overlay `<div id="vhs-intro">` that sits above all content with `position: fixed; z-index: 9999`. Style it with `vhs-intro.css`: black background, animated horizontal tracking bars (thin white lines that jitter vertically using `translateY` keyframes), a subtle noise texture (either a base64-encoded tiny PNG tiled via `background-image` or an SVG `<filter>` using `feTurbulence`), and a brief colour-bleed RGB shift. The animation sequence: 0-0.5s heavy static, 0.5-1.5s static clears with a "tuning in" effect (bars narrow, noise reduces), 1.5-2s fade to transparent and `display: none`. In `vhs-intro.js`, after `DOMContentLoaded`, start the animation, then remove the overlay element from the DOM after 2 seconds. **Respect `prefers-reduced-motion`:** if the user has this media query active, skip the animation entirely and remove the overlay immediately. Store a `sessionStorage` flag so the animation only plays once per session (not on every page refresh during development). |
| 3.2 | **Lyric fragments on scroll** | In `lyric-fragments.js`, create `<span>` elements for each lyric from `site-config.js`. Position them absolutely within a full-page container (`position: fixed; pointer-events: none; z-index: 1`). Each lyric is placed at a random horizontal position (10%-90% of viewport width) and assigned to a scroll zone (e.g., lyric 1 appears between 20%-30% scroll progress, lyric 2 between 35%-45%, etc.). Use `IntersectionObserver` or a scroll event listener to detect when the user's scroll position enters a lyric's zone. When active, fade the lyric in (`opacity: 0 → 0.2`) with the glitch-text style applied. When the user scrolls past, fade it out. Keep opacity low (0.15-0.25) so lyrics don't interfere with readability. Apply `font-style: italic` and a slightly larger font size than body text. |
| 3.3 | **Colour randomiser** | In `colour-randomiser.js`, add a click event listener to the site logo (the "BANGEROO" `<h1>` or a wrapping `<div>`). On each click, cycle to the next palette from the `palettes` array in `site-config.js`. Apply the palette by setting CSS custom properties on `document.documentElement.style`: `--color-bg-primary`, `--color-bg-secondary`, `--color-text-primary`, `--color-accent`, `--color-accent-secondary`. Add a brief (300ms) transition on `background-color` and `color` properties site-wide so the change feels smooth. Store the current palette index in `sessionStorage` so it persists during the session. Add a subtle visual hint that the logo is clickable: on hover, briefly flash the glitch effect. |
| 3.4 | **Verify and deploy** | Verify: VHS animation plays on first visit and not on refresh, lyrics appear subtly while scrolling, colour palette cycles on logo click, all animations respect `prefers-reduced-motion`. |

---

### Phase 4 - Backend Features (Netlify Functions + Supabase)

**Goal:** The guest book, visitor counter, and Spotify "Tune in" live indicator are functional with serverless backends.

| # | Task | Detail |
|---|---|---|
| 4.1 | **Supabase setup** | The developer must complete the Supabase setup described in `SETUP-GUIDE.md` before this phase. The two required tables are `guestbook` (columns: `id` serial primary key, `message` text, `created_at` timestamptz default now()) and `visitor_count` (columns: `id` integer primary key default 1, `count` integer default 0). Create the tables via the Supabase dashboard SQL editor. |
| 4.2 | **Netlify Function: `visitor-count.js`** | Create a Netlify Function at `netlify/functions/visitor-count.js`. On `GET` request: read the current count from the `visitor_count` table, increment it by 1, update the row, and return `{ count: N }`. Use the `@supabase/supabase-js` library with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from environment variables. Add appropriate CORS headers (`Access-Control-Allow-Origin: *`). |
| 4.3 | **Visitor counter frontend** | In `visitor-counter.js`, on page load, call the visitor count endpoint from `site-config.js`. Display the count in a retro-styled counter at the bottom of the page. Style with `visitor-counter.css`: use a monospace bitmap-style font (use `'VT323'` from Google Fonts - add it to the `<head>` alongside Audiowide). Add a bevelled border, pixelated appearance, and a "You are visitor #N" message. Check the count against `counterMilestones` in `site-config.js` - if a milestone matches, display the custom message instead of the default. |
| 4.4 | **Netlify Function: `guestbook-read.js`** | On `GET` request: fetch the most recent 50 messages from the `guestbook` table, ordered by `created_at` descending. Return `{ messages: [...] }`. |
| 4.5 | **Netlify Function: `guestbook-write.js`** | On `POST` request with body `{ message: "..." }`: validate that the message is a non-empty string of 100 characters or fewer, sanitise it (strip HTML tags), insert into the `guestbook` table, and return `{ success: true }`. Add basic rate limiting: check if the same IP (from `event.headers['x-forwarded-for']`) has posted in the last 60 seconds by storing a temporary record (or use a simple in-memory approach since Netlify Functions are stateless - alternatively, add an `ip_hash` column to the guestbook table and check before inserting). |
| 4.6 | **Guest book frontend** | In `guestbook.js`, build the "Shout Wall" section in `index.html`. Display existing messages as scattered text blocks styled to look like old computer terminal text - use the same `VT323` monospace font as the visitor counter. Each message is positioned with slight random rotation (`transform: rotate(Xdeg)` where X is -3 to 3), random size variation (0.9em to 1.1em), and staggered layout. Add an input field (max 100 chars, with character counter) and a "Shout" submit button. On submit, POST to the guestbook write endpoint, then prepend the new message to the wall without a full reload. Style with `guestbook.css`. |
| 4.7 | **Spotify "Tune in" Netlify Function** | Create `netlify/functions/spotify-now-playing.js`. This function: (a) reads `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` from environment variables, (b) exchanges the refresh token for an access token by POSTing to `https://accounts.spotify.com/api/token` with `grant_type=refresh_token`, (c) calls `https://api.spotify.com/v1/me/player/currently-playing` with the access token, (d) if a track is playing, returns `{ isPlaying: true, track: "Track Name", artist: "Artist Name", albumArt: "url" }`, (e) if nothing is playing, returns `{ isPlaying: false }`. Add a `Cache-Control: public, s-maxage=30` header to avoid excessive Spotify API calls. |
| 4.8 | **"Tune in" frontend** | In `spotify-now-playing.js`, add a small indicator in the navigation header. It consists of a pulsing dot (`<span class="pulse-dot">`) and a text element. On page load and every 30 seconds thereafter (configurable via `site-config.js`), fetch from the Netlify Function endpoint. If `isPlaying` is true, show a green pulsing dot and the track name in a glitchy marquee scroll (CSS `animation: marquee 10s linear infinite` on an `overflow: hidden` container). If false, show a grey dot and the text "Offline". Style the marquee text with the Audiowide font at a small size (0.75rem). |
| 4.9 | **Verify and deploy** | Verify locally using `netlify dev` (which runs Netlify Functions locally). Test: visitor counter increments, guest book reads and writes, Spotify now-playing returns data (requires completing the Spotify auth setup in SETUP-GUIDE.md first). Deploy to Netlify and verify all endpoints work in production. |

---

## 4. Key Technical Decisions

### 4.1 Wavesurfer.js for audio playback

Wavesurfer.js v7 is a mature, actively maintained library (9k+ GitHub stars) that renders interactive audio waveforms using the Web Audio API and HTML5 Canvas. It supports play/pause, seeking by clicking the waveform, and exposes the underlying `<audio>` element for Web Audio API integration (which we need for the audio-reactive background). It is ~30 KB gzipped.

The audio-reactive background connects to wavesurfer's media element via `AudioContext.createMediaElementSource()`. This gives access to real-time frequency data without any cross-origin restrictions since the MP3 files are self-hosted.

### 4.2 Self-hosted MP3 alongside Spotify embed

The site uses **both** a self-hosted MP3 waveform player and the standard Spotify iframe embed:

- The **MP3 waveform player** (wavesurfer.js) is the primary listening experience. Self-hosted MP3s give full Web Audio API access for the audio-reactive background, custom UI, waveform visualisation, and download functionality - none of which are possible with Spotify's cross-origin iframe.
- The **Spotify embed** is retained below the MP3 player section as a secondary option. It shows the full discography of The Bangs Collective and lets visitors who prefer Spotify play tracks directly or open them in the Spotify app. It uses the standard iframe embed URL: `https://open.spotify.com/embed/artist/{ARTIST_ID}?utm_source=generator&theme=0`. A CSS filter overlay shifts the Spotify green accent towards the site's palette (see Appendix B in the v1 plan for techniques). The embed is wrapped in its own `<section id="spotify-player">` so it can be cleanly removed later by deleting that section and its associated CSS file.
- The **streaming platform SVG links** sit below both players and link to Spotify, SoundCloud, Apple Music, and Amazon Music.

### 4.3 Supabase as backend for guest book and visitor counter

Supabase is chosen over Google Sheets because:

- It provides a proper PostgreSQL database with a REST API.
- The free tier (500 MB database, 50k monthly active users) is more than sufficient.
- Row-level security can be configured for safety.
- The JS client is well-maintained and lightweight.

A Netlify Function acts as a proxy between the frontend and Supabase, keeping the Supabase service key server-side.

### 4.4 Spotify "Tune in" via server-side refresh token

The Spotify `GET /me/player/currently-playing` endpoint requires user authentication. The approach:

1. The site owner completes a one-time OAuth flow (documented in `SETUP-GUIDE.md`) to obtain a **refresh token** for their own Spotify account.
2. This refresh token is stored as a Netlify environment variable.
3. The Netlify Function uses the refresh token to get a fresh access token on each request, then calls the currently-playing endpoint.
4. The frontend polls this Netlify Function every 30 seconds.

**Important constraints post-February 2026:**
- The Spotify Developer App owner must have **Spotify Premium**.
- Development Mode apps are limited to **5 allowlisted users** - but this does not matter here because only the site owner's account authenticates. Visitors never interact with Spotify's auth system.
- The `GET /me/player/currently-playing` endpoint remains available in Development Mode.

### 4.5 VT323 font for guest book and visitor counter

VT323 is a free Google Font that replicates the look of an old VT320 computer terminal. It is loaded alongside Audiowide:

```html
<link href="https://fonts.googleapis.com/css2?family=Audiowide&family=VT323&display=swap" rel="stylesheet">
```

Using it for both the guest book and visitor counter creates a consistent retro-terminal aesthetic that deliberately clashes with the modern glitch style of the rest of the site.

### 4.6 `prefers-reduced-motion` handling

All animations (glitch effects, VHS intro, lyric fragments, audio-reactive background, pulse dot, marquee) must be wrapped in:

```css
@media (prefers-reduced-motion: no-preference) {
  /* animation code */
}
```

When `prefers-reduced-motion: reduce` is active, all animations are disabled. The VHS intro is skipped entirely. The audio-reactive background still analyses audio but does not modulate CSS properties.

### 4.7 Netlify Functions directory

Netlify Functions are placed in `netlify/functions/` which is the Netlify default. Add to `netlify.toml`:

```toml
[functions]
  directory = "netlify/functions"
```

---

## 5. Testing Strategy

### Unit tests (Vitest)

| Module | What to test |
|---|---|
| `colour-randomiser.js` | Cycles through palettes correctly, wraps around at the end, applies CSS properties |
| `track-stories.js` | Toggle adds/removes `.story-visible` class, close button works |
| `lyric-fragments.js` | Correct number of lyric elements created, positioned within valid ranges |
| `visitor-counter.js` | Milestone message lookup returns correct message for known counts, default message for unknown |
| `site-config.js` | Config object has all required keys (structural validation) |

### Integration tests (Vitest + jsdom)

| Flow | What to test |
|---|---|
| Mobile nav toggle | Click hamburger button, verify `.nav-menu--open` class is added, click again to verify removal |
| Guest book submission | Mock fetch, submit a message, verify it appears in the DOM |
| Waveform player mutual exclusivity | Create two player instances, play one, verify the other pauses |

### Manual testing checklist

- VHS animation plays once per session, not on refresh
- Hamburger menu is hidden by default on mobile, toggles on click
- Audiowide font renders on the logo and headings
- Waveform renders for each track, play/pause works, download works
- Audio-reactive background intensifies during playback
- Behind-the-track story overlay toggles on and off
- Streaming platform icons link to correct URLs from config
- Gallery is half-height on desktop with smooth bleed transitions
- Colour palette cycles on logo click
- Lyric fragments appear subtly while scrolling
- Guest book loads existing messages, allows posting new ones (100 char max)
- Visitor counter displays and increments
- Spotify "Tune in" shows current track or "Offline"
- All features work on mobile (iOS Safari, Android Chrome)
- All animations disabled when `prefers-reduced-motion: reduce` is active

---

## 6. SETUP-GUIDE.md Content Specification

The coding agent must generate a `SETUP-GUIDE.md` file in the project root with the following sections:

### 6.1 Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project. Note down the **Project URL** and **Service Role Key** (found in Settings > API).
3. Open the SQL Editor and run:

```sql
-- Guest book table
CREATE TABLE guestbook (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL CHECK (char_length(message) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor counter table
CREATE TABLE visitor_count (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER DEFAULT 0
);

-- Initialise the counter with a single row
INSERT INTO visitor_count (id, count) VALUES (1, 0);

-- Enable Row Level Security
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_count ENABLE ROW LEVEL SECURITY;

-- Allow the service role to do everything (Netlify Functions use the service key)
CREATE POLICY "Service role full access" ON guestbook FOR ALL USING (true);
CREATE POLICY "Service role full access" ON visitor_count FOR ALL USING (true);
```

4. Add the following environment variables to your Netlify site (Site Settings > Environment Variables):
   - `SUPABASE_URL` - Your Supabase Project URL
   - `SUPABASE_SERVICE_KEY` - Your Supabase Service Role Key

### 6.2 Spotify "Tune in" Setup

**Prerequisites:** You must have a Spotify Premium account.

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and create a new app.
2. Set the **Redirect URI** to `http://127.0.0.1:8888/callback` (used only during initial token generation).
3. Note down the **Client ID** and **Client Secret**.
4. Generate a refresh token by running this one-time OAuth flow:
   - Open this URL in your browser (replace `YOUR_CLIENT_ID`):
     ```
     https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://127.0.0.1:8888/callback&scope=user-read-currently-playing user-read-playback-state
     ```
   - Approve the permissions. You will be redirected to `http://127.0.0.1:8888/callback?code=XXXXX`. Copy the `code` value from the URL.
   - Exchange the code for tokens by running this `curl` command (replace placeholders):
     ```bash
     curl -X POST https://accounts.spotify.com/api/token \
       -H "Content-Type: application/x-www-form-urlencoded" \
       -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://127.0.0.1:8888/callback&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
     ```
   - The response will include a `refresh_token`. **Save this securely - it does not expire.**
5. Add the following environment variables to your Netlify site:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`

### 6.3 Spotify Embed (Artist ID)

1. Search for "The Bangs Collective" on [open.spotify.com](https://open.spotify.com).
2. Open the artist profile. The URL will be `https://open.spotify.com/artist/XXXXXXX` - copy the ID after `/artist/`.
3. Edit `src/config/site-config.js` and replace `PLACEHOLDER_ID` in both the `streamingLinks.spotify` URL and the `spotifyEmbed.artistId` field.

### 6.4 Adding Your Music

1. Place MP3 files in `src/assets/audio/`.
2. Edit `src/config/track-data.js` and add an entry for each track with the filename, title, story, and mood tags.

### 6.5 Adding Gallery Photos

1. Place images (JPG, PNG, or WebP) in `public/images/gallery/`.
2. They will be automatically picked up by the gallery component on next build.

### 6.6 Customising Streaming Links

Edit `src/config/site-config.js` and update the `streamingLinks` object with your actual artist URLs for each platform.

### 6.7 Customising Contact Details

Edit `src/config/site-config.js` and update the `contact` object with your email and phone number.

### 6.8 Local Development

```bash
npm install
npm run dev          # Starts Vite dev server (frontend only)
netlify dev          # Starts Vite + Netlify Functions locally (use this to test backend features)
```

### 6.9 Deployment

Push to your connected Git repository. Netlify will automatically build and deploy. Ensure all environment variables (Supabase and Spotify) are set in the Netlify dashboard before deploying Phases 4+.

---

## 7. First Coding Task (Phase 1)

> **Instruction for the coding agent:**
>
> You are working on the Bangeroo project - a Vite + vanilla HTML/CSS/JS single-page site. The project currently has multiple design variants (A, B, C).
>
> Complete the following tasks in order:
>
> 1. **Audit and identify design-specific files.** Search the project for all files that are exclusively part of Design A or Design B. For each candidate file, search the entire codebase for imports or references. List the files that are safe to delete (not referenced by Design C).
>
> 2. **Remove confirmed orphan files.** Delete all files exclusive to Designs A and B that are not referenced by Design C or shared utilities.
>
> 3. **Port the Design A navigation header.** Copy the navigation header HTML from Design A into Design C's `index.html`. Copy the associated CSS. Modify the mobile behaviour: the `.nav-menu` must have `display: none` by default on viewports below 768px. Add a hamburger button `.nav-toggle` (three horizontal lines icon using CSS `::before`/`::after` pseudo-elements or inline SVG). Add a click handler in a `<script>` tag or a small JS module that toggles a `.nav-menu--open` class on `.nav-menu`, setting it to `display: block`.
>
> 4. **Load the Audiowide font.** Add `<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet">` to the `<head>`. In the theme/variables CSS file, set `--font-family-heading: 'Audiowide', sans-serif;`. Apply this variable to the site logo, hero heading, and all section headings.
>
> 5. **Update the hero section.** Remove any design-switcher arrows, design-page references, or navigation between designs. Remove the image-based logo. Add an `<h1 class="hero-logo glitch-text" data-text="BANGEROO">BANGEROO</h1>` element. Style it: `font-family: var(--font-family-heading)`, `font-size: clamp(3rem, 10vw, 8rem)`, `letter-spacing: 0.15em`, `text-transform: uppercase`, `text-align: center`, `color: var(--color-text-primary)`. Centre it within the hero container using flexbox.
>
> 6. **Create `src/config/site-config.js`** with the full structure defined in this plan (§2), including streaming links, palettes, lyrics, milestones, and endpoint paths. Use placeholder values where real data is not yet available.
>
> 7. **Create `src/config/track-data.js`** with one placeholder track entry.
>
> 8. **Create `SETUP-GUIDE.md`** in the project root with the full content specified in §6 of this plan.
>
> 9. **Run `npm run build`** and fix any errors. Then run `npm run dev` and verify the site loads with: Design C as the only design, the navigation header from Design A with working mobile hamburger toggle, the Audiowide-styled "BANGEROO" logo centred in the hero, and no arrows or design-switcher UI.
>
> Do not implement any features from Phases 2-4 yet. Focus only on foundation and cleanup.

---

*End of implementation plan.*
