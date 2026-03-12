# Bangeroo - Implementation Plan

> **Document purpose:** This is a complete implementation brief for an AI coding agent. Follow it phase by phase. Do not skip sections or make assumptions beyond what is documented here.

---

## 1. Project Overview

Bangeroo is a single-page personal music showcase website for the Spotify artist **The Bangs Collective**. The site serves as a bold, stylised landing page where friends, family, and curious listeners can browse the artist's full discography via an embedded Spotify player, read a short bio, browse a looping photo gallery, and discover a hidden Easter egg.

The visual identity is defined by a **glitch/static interference** aesthetic - text and elements flicker, crackle, and distort with horizontal scan-line displacement, inspired by the Bangeroo logo files provided. The colour palette is anchored around black, navy blue, red, gold, and mushroom tones.

### Core user journey

1. The user lands on the site and is greeted by a full-screen hero section with a background video or image, the Bangeroo logo, a short artist bio, and contact icons.
2. They scroll down (content below the fold lazy-loads) to find the embedded Spotify player showing the full discography of The Bangs Collective, newest tracks first, and can play music directly or open it in Spotify.
3. They continue scrolling through an auto-rotating photo gallery and discover the "Click for upcoming gig dates" Easter egg.

All interactions are tracked via Umami analytics, with a monthly summary emailed automatically.

---

## 2. Tech Stack Recommendation

### Recommended stack

| Layer | Technology | Version |
|---|---|---|
| Build tool | **Vite** | ^6.x |
| Language | **Vanilla HTML / CSS / JavaScript** | ES2022+ |
| Styling | **Vanilla CSS** with CSS custom properties | CSS3 |
| Photo carousel | **Splide.js** | ^4.x |
| Analytics | **Umami** (Cloud or self-hosted) | Latest |
| Monthly email | **Google Apps Script** | N/A |
| Hosting | **Netlify** (static site) | N/A |
| Lazy loading | **Native** `loading="lazy"` + **Intersection Observer API** | N/A |

### Why each choice fits this app

- **Vite + Vanilla JS** - This is a single page with no routing, no server-side data fetching, and no component reuse across pages. A framework (React, Svelte, Astro) would add bundle weight and build complexity for zero benefit. Vite gives us hot module replacement during development, asset hashing, CSS/JS minification, and image optimisation out of the box - with near-zero configuration. The output is a handful of static files that Netlify serves instantly.

- **CSS Custom Properties for theming** - The brief requires that the entire colour scheme be changeable from a single location. CSS custom properties (`:root` variables) solve this perfectly - every colour reference in the codebase points back to one `:root` block in a single `theme.css` file. No preprocessor needed.

- **Splide.js for the photo carousel** - At ~29 KB minified (with CSS), Splide is significantly lighter than Swiper (~140 KB). It supports autoplay with loop, is touch-friendly, accessible (ARIA roles built in), and requires no framework. It has a clean API for pause-on-hover and custom transitions.

- **Umami Analytics** - Privacy-focused, GDPR-compliant, lightweight (~2 KB script), and has a built-in custom events API. Umami Cloud offers a free tier sufficient for this scale. Its REST API allows external tools (Google Apps Script) to pull reporting data for the monthly email.

- **Google Apps Script for the monthly email** - Free, requires no server, runs on a time-driven trigger (monthly), and can call the Umami API via `UrlFetchApp` then send a formatted email via `GmailApp`. This avoids the need for a backend, a cron service, or Netlify Scheduled Functions (which have cold-start costs and require a paid plan for scheduled execution).

- **Netlify** - Serves static files from a global CDN, has automatic HTTPS, deploy previews from Git, and a generous free tier. A `netlify.toml` file handles all config. Perfect fit for a Vite static output.

### Alternative stacks

**Alternative 1 - Astro**
- *When to choose it:* If the site were to grow into multiple pages (e.g., separate pages for bio, gallery, discography) or needed partial hydration for interactive islands. Astro's island architecture would then shine.
- *Trade-off:* For a single-page site, Astro adds a build layer and project structure overhead that does not pay for itself. The output would still be static HTML/CSS/JS, but the development experience gains nothing over Vite + vanilla for this scope.

**Alternative 2 - Next.js (Static Export)**
- *When to choose it:* If the site needed server-side rendering, API routes, authentication, or dynamic data fetching from Spotify's Web API (e.g., pulling track lists programmatically rather than using an embed).
- *Trade-off:* Massively over-engineered for a static single-page site. The React runtime adds ~40-80 KB to the bundle. Build times are slower. Deployment config is more complex. No benefit here.

**Alternative 3 - Eleventy (11ty)**
- *When to choose it:* If there were many pages of templated content (e.g., a blog, multiple artist profiles) where Eleventy's data cascade and templating would reduce repetition.
- *Trade-off:* Similar to Astro - adds a static site generator layer that is unnecessary for a single HTML page. Eleventy's strength is multi-page content sites, not single-page showcases.

### Stack validation summary

The recommended stack (Vite + Vanilla) produces the smallest possible bundle, deploys trivially to Netlify, has zero framework lock-in, and directly matches the app's constraints: one page, no dynamic data, no auth, no server. The Spotify embed is a simple iframe - no API integration needed. The glitch animations are pure CSS. The carousel is the only external dependency. This stack will score 95+ on Lighthouse performance out of the box.

---

## 3. Project Structure

```
bangeroo/
├── public/                          # Static assets copied as-is to build output
│   ├── fonts/                       # Custom fonts (if any)
│   ├── images/
│   │   ├── hero/                    # Hero background video or image (TBC)
│   │   │   └── hero-placeholder.jpg # Placeholder until final asset provided
│   │   ├── logos/                   # Bangeroo logo variants
│   │   │   ├── logo-black-white.png
│   │   │   ├── logo-white-blue.png
│   │   │   ├── logo-white-brown.png
│   │   │   └── logo-blue-white.png
│   │   └── gallery/                 # Photo album images (user will add these)
│   │       └── .gitkeep
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── css/
│   │   ├── theme.css                # ★ Single source of truth for ALL colours
│   │   ├── reset.css                # CSS reset / normalise
│   │   ├── base.css                 # Typography, body, global styles
│   │   ├── glitch.css               # All glitch/static/interference animations
│   │   ├── hero.css                 # Hero section styles
│   │   ├── spotify.css              # Spotify embed section + colour filter overlay
│   │   ├── gallery.css              # Photo carousel styles
│   │   ├── easter-egg.css           # "Upcoming gig dates" section styles
│   │   └── responsive.css           # Mobile-first media queries and overrides
│   ├── js/
│   │   ├── main.js                  # Entry point - initialises all modules
│   │   ├── lazy-load.js             # Intersection Observer for below-fold content
│   │   ├── gallery.js               # Splide carousel initialisation and config
│   │   ├── easter-egg.js            # "Click for upcoming gig dates" interaction
│   │   ├── glitch.js                # Optional JS-enhanced glitch effects (if needed)
│   │   └── analytics.js             # Umami custom event tracking helpers
│   └── index.html                   # Single page - all sections
├── scripts/
│   └── google-apps-script.js        # Google Apps Script code for monthly email
├── .gitignore
├── netlify.toml                     # Netlify build and deploy config
├── package.json
├── vite.config.js                   # Vite build configuration
├── README.md                        # Project purpose, features, tech stack, local setup
└── SETUP.md                         # Environment variables, third-party account setup
```

### Key structural decisions

- **`theme.css` is the single colour source** - Every other CSS file references variables defined here. To change the colour scheme, only this file needs editing.
- **CSS is split by section** rather than by component - this mirrors the single-page layout and makes it easy for a developer to find the styles for any visible section.
- **`public/images/gallery/`** is an empty directory with a `.gitkeep` - the user will drop their photos in here. The gallery JS should dynamically load whatever images are present in this folder at build time (via Vite's `import.meta.glob`).
- **`scripts/google-apps-script.js`** lives outside `src/` because it is not part of the website build - it is a standalone script deployed to Google Apps Script separately.

---

## 4. Implementation Phases

### Phase 1 - MVP (Core loop functional)

**Goal:** A deployable single-page site with all sections visible and the Spotify embed working.

| # | Deliverable | Detail |
|---|---|---|
| 1.1 | Project scaffold | Initialise Vite project, install Splide.js, create folder structure, configure `vite.config.js` |
| 1.2 | `theme.css` with colour system | Define all colours from `colourScheme.txt` as CSS custom properties. Include semantic aliases (e.g., `--color-primary`, `--color-bg`, `--color-text`) mapped to the raw values |
| 1.3 | `reset.css` + `base.css` | CSS reset, base typography, global box-sizing, smooth scroll behaviour |
| 1.4 | `index.html` skeleton | Full HTML structure with all five sections as semantic landmarks (`<header>`, `<section>`, `<footer>`), placeholder content in each |
| 1.5 | Hero section | Full-viewport hero with placeholder background image, Bangeroo logo (choose appropriate variant based on background), placeholder bio text, email `mailto:` icon link, telephone `tel:` icon link. Use inline SVG or a lightweight icon set (Lucide or Phosphor via CDN) for the icons |
| 1.6 | Spotify embed section | Embedded Spotify player via iframe. Use the Spotify artist embed URL format: `https://open.spotify.com/embed/artist/{ARTIST_ID}`. Set `allow="encrypted-media"` on the iframe. Apply a CSS filter overlay to shift the Spotify green accent towards the site's colour palette (see Technical Decisions §5). Wrap in a container that is initially hidden and loaded via Intersection Observer |
| 1.7 | Photo gallery section | Initialise Splide.js carousel with autoplay, loop, and responsive breakpoints. Load placeholder images. Configure touch/swipe support for mobile |
| 1.8 | Easter egg section | "Click for upcoming gig dates" text. On click, apply a CSS class that hazes/blurs the text and transitions to "You're having a laugh" |
| 1.9 | Lazy loading | Implement Intersection Observer in `lazy-load.js` to defer loading of the Spotify iframe, gallery images, and all below-fold sections until they enter the viewport |
| 1.10 | Netlify deployment | Create `netlify.toml`, connect Git repository, deploy. Confirm the site loads and all sections render |

### Phase 2 - Hardening (Robustness and tracking)

**Goal:** Analytics integrated, error states handled, accessibility baseline met, mobile fully tested.

| # | Deliverable | Detail |
|---|---|---|
| 2.1 | Umami analytics setup | Create Umami Cloud account (or self-hosted instance). Add the Umami tracking script to `index.html`. Verify page views are recording |
| 2.2 | Custom event tracking | Add `data-umami-event` attributes to: each interactive element in the Spotify section, the email icon, the telephone icon, the "upcoming gig dates" Easter egg. Implement programmatic tracking in `analytics.js` for events that need custom data (e.g., which song was clicked) |
| 2.3 | Google Apps Script monthly email | Write the Apps Script that: (a) calls the Umami API to fetch the previous month's data, (b) formats a summary (total visitors, top pages, song click counts, Easter egg clicks), (c) sends it via Gmail to a configurable email address, (d) runs on a monthly time-driven trigger. Save the script in `scripts/google-apps-script.js` with full setup instructions in `SETUP.md` |
| 2.4 | Error/fallback states | Handle: Spotify embed failing to load (show a "Listen on Spotify" text link fallback), gallery with no images (show a placeholder message), hero video failing to load (fall back to static image) |
| 2.5 | Accessibility pass | Ensure all images have `alt` text, the carousel has ARIA labels, the Easter egg is keyboard-accessible, colour contrast ratios meet WCAG AA, and the glitch animations respect `prefers-reduced-motion` (disable or reduce animations when this media query is active) |
| 2.6 | Mobile testing | Test on iOS Safari, Android Chrome, and Firefox mobile. Fix any viewport, touch, scroll, or iframe sizing issues. Ensure the Spotify embed is responsive and usable on small screens |
| 2.7 | Performance baseline | Run Lighthouse audit. Target: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+. Fix any flagged issues |

### Phase 3 - Polish (Visual refinement and nice-to-haves)

**Goal:** The glitch/static aesthetic is fully realised, the site feels finished and distinctive.

| # | Deliverable | Detail |
|---|---|---|
| 3.1 | Glitch animations - text | Implement CSS keyframe animations for the hero heading and section titles: horizontal displacement (translateX jitter), RGB colour split (text-shadow with offset red/blue channels), opacity flicker, and clip-path scan-line reveal. These should fire on page load and on scroll-into-view |
| 3.2 | Glitch animations - ambient | Add a subtle full-page scan-line overlay (repeating-linear-gradient with thin semi-transparent lines) and occasional static noise flashes (a small CSS background-image of noise that briefly appears via animation) |
| 3.3 | Hero video integration | When the final hero video/image is provided, integrate it. If video: autoplay, muted, loop, `playsinline` for iOS. Add a dark overlay gradient so text remains legible |
| 3.4 | Gallery refinement | Add transition effects between slides, a subtle glitch transition, and optional fullscreen lightbox on tap |
| 3.5 | Spotify section visual polish | Refine the colour filter overlay on the Spotify embed. Add a glitch border or frame effect around the player. Ensure the section heading has the static interference style |
| 3.6 | Easter egg polish | Add a glitch/haze CSS transition when the text changes. Maybe a brief screen-shake or static burst on click for dramatic effect |
| 3.7 | Favicon and meta tags | Add proper Open Graph meta tags (title, description, image) for social sharing. Create a favicon from the Bangeroo logo. Add `meta` viewport, charset, description |
| 3.8 | Final performance pass | Optimise all images (WebP with fallback), ensure hero LCP is under 2.5s, verify total bundle size, enable Vite's built-in code splitting and asset hashing |

---

## 5. Key Technical Decisions

### 5.1 Spotify artist ID

The Spotify embed requires the artist's Spotify ID. The coding agent must:

1. Search the Spotify Web search (`https://open.spotify.com/search/The%20Bangs%20Collective`) to find the correct artist profile.
2. Extract the artist ID from the URL (format: `https://open.spotify.com/artist/{ID}`).
3. Use the embed URL: `https://open.spotify.com/embed/artist/{ID}?utm_source=generator&theme=0`

The `theme=0` parameter sets the embed to dark mode, which will better match the site's dark aesthetic.

> **If the artist cannot be found on Spotify**, add a placeholder embed using a known artist ID and leave a clearly marked `TODO` comment for the user to replace it.

### 5.2 Overriding Spotify embed colours

The Spotify iframe is a cross-origin embed - its internal CSS cannot be directly modified. To shift the green accent towards the site's palette, apply a CSS filter to the iframe's container:

```css
.spotify-embed-wrapper {
  position: relative;
}

.spotify-embed-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-navy-blue);
  mix-blend-mode: hue;
  opacity: 0.4;
  pointer-events: none; /* Critical: allows clicks to pass through to the iframe */
}
```

This approach overlays a colour via `mix-blend-mode: hue` which shifts the green towards navy blue while preserving the embed's visual structure. The `pointer-events: none` ensures the overlay does not block interaction with the Spotify player.

**Alternative approach:** Use a CSS `filter: hue-rotate()` on the iframe itself. A hue rotation of approximately `140deg` shifts Spotify green towards blue. However, this affects all colours in the embed, not just the green, so it may produce unwanted tints on album art. Test both approaches and choose the one that looks best.

### 5.3 Colour system architecture

The `theme.css` file must be structured as follows:

```css
:root {
  /* ── Raw palette (from colourScheme.txt) ── */
  --palette-red: #FF0000;
  --palette-black: #000000;
  --palette-yellow: #FFD700;
  --palette-grey: #A9A9A9;
  --palette-white: #FFFFFF;
  --palette-navy-blue: #132257;
  --palette-mushroom: #BCABA0;

  /* ── Semantic tokens (change these to re-theme the site) ── */
  --color-bg-primary: var(--palette-black);
  --color-bg-secondary: var(--palette-navy-blue);
  --color-bg-tertiary: var(--palette-mushroom);
  --color-text-primary: var(--palette-white);
  --color-text-secondary: var(--palette-grey);
  --color-accent: var(--palette-red);
  --color-accent-secondary: var(--palette-yellow);
  --color-glitch-r: var(--palette-red);
  --color-glitch-b: var(--palette-navy-blue);

  /* ── Spacing scale ── */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  /* ── Typography scale ── */
  --font-family-heading: 'system-ui', -apple-system, sans-serif;
  --font-family-body: 'system-ui', -apple-system, sans-serif;
  --font-size-hero: clamp(3rem, 8vw, 7rem);
  --font-size-h2: clamp(2rem, 5vw, 4rem);
  --font-size-body: clamp(1rem, 2vw, 1.25rem);

  /* ── Animation timing ── */
  --glitch-duration: 3s;
  --glitch-interval: 5s;
}
```

All other CSS files must **only** reference these variables - never hard-coded colour values.

### 5.4 Lazy loading strategy

- **Hero section:** Loads immediately (above the fold). No lazy loading.
- **Spotify embed:** The iframe `src` is not set in HTML. Instead, a `data-src` attribute holds the URL. When the Intersection Observer detects the section entering the viewport (with a `rootMargin` of `200px` to start loading slightly before it's visible), `lazy-load.js` copies `data-src` to `src`.
- **Gallery images:** Use native `loading="lazy"` on `<img>` tags. Splide.js also supports lazy loading natively via its `lazyLoad` option.
- **Below-fold sections:** Each section below the hero has an `opacity: 0; transform: translateY(20px)` initial state and transitions in when observed.

### 5.5 Gallery image loading at build time

Use Vite's `import.meta.glob` to dynamically import all images from the gallery directory:

```js
const galleryImages = import.meta.glob('/public/images/gallery/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default'
});
```

This means the user simply drops images into `public/images/gallery/` and they automatically appear in the carousel on next build. No configuration or manifest file needed.

### 5.6 Easter egg interaction

The "Click for upcoming gig dates" element should:

1. Start as a styled `<button>` (for accessibility and keyboard support), not a `<div>`.
2. On click, apply a CSS class that triggers: a brief glitch animation, a blur/haze transition, and text content swap to "You're having a laugh".
3. Track the click as a custom Umami event: `data-umami-event="easter-egg-click"`.
4. Remain in the "revealed" state for the rest of the session (do not reset on scroll).

### 5.7 `prefers-reduced-motion` handling

All glitch animations must be wrapped in a motion-safe check:

```css
@media (prefers-reduced-motion: no-preference) {
  .glitch-text {
    animation: glitch-anim var(--glitch-duration) infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glitch-text {
    animation: none;
  }
}
```

This is non-negotiable for accessibility.

### 5.8 Mobile-first responsive approach

Write all base CSS for mobile (viewport ≤ 480px). Use `min-width` media queries to scale up:

```css
/* Base: mobile */
.hero-title { font-size: var(--font-size-hero); }

/* Tablet and up */
@media (min-width: 768px) { ... }

/* Desktop and up */
@media (min-width: 1024px) { ... }
```

The Spotify embed should be `width: 100%; height: 352px` on mobile and `height: 352px` (compact) or `height: 752px` (full) on desktop. Test both and choose what feels right.

---

## 6. Testing Strategy

Given the app's complexity (single static page, no backend, no auth), a lightweight testing approach is appropriate.

### Unit tests

**Tool:** Vitest (ships with Vite, zero-config)

| What to test | Why |
|---|---|
| `lazy-load.js` - Observer callback logic | Ensure elements get their `src` set when `isIntersecting` is true |
| `easter-egg.js` - State toggle | Ensure the text swaps, the CSS class is applied, and it doesn't toggle back |
| `analytics.js` - Event tracking helpers | Ensure `umami.track()` is called with correct event names and data |
| Colour theme variables | A snapshot test that `theme.css` contains all required variable declarations |

### Integration tests

**Tool:** Vitest with happy-dom or jsdom

| What to test | Why |
|---|---|
| Gallery initialisation | Ensure Splide mounts, correct number of slides render, autoplay starts |
| Lazy loading flow | Simulate intersection events, verify iframe `src` is set |
| Easter egg full flow | Simulate click, verify DOM state change, verify analytics event fires |

### E2E tests

**Tool:** Playwright (if the project warrants it - optional for MVP)

| Critical journey | Steps |
|---|---|
| Page load and hero | Navigate to site, verify hero is visible, logo loads, bio text present |
| Spotify embed | Scroll to Spotify section, verify iframe loads, verify it has correct artist URL |
| Gallery | Scroll to gallery, verify images render, verify auto-rotation starts |
| Easter egg | Click the gig dates text, verify text changes to "You're having a laugh" |
| Mobile viewport | Run all above at 375px width |

### Edge cases to test explicitly

- **No gallery images:** Gallery section should show a graceful fallback, not a broken carousel.
- **Spotify embed blocked:** Some browsers or ad-blockers block third-party iframes. The fallback link should appear.
- **Slow network:** Lazy-loaded content should show skeleton/placeholder states, not layout shift.
- **Reduced motion preference:** Verify all animations are disabled when `prefers-reduced-motion: reduce` is active.

---

## 7. First Coding Task

> **Instruction for the coding agent:**
>
> Initialise the Bangeroo project from scratch. Complete the following steps in order:
>
> 1. **Create the project** using `npm create vite@latest bangeroo -- --template vanilla`. Then `cd bangeroo` and run `npm install`.
>
> 2. **Install dependencies:** `npm install @splidejs/splide`
>
> 3. **Create the full folder structure** exactly as defined in §3 of this plan. Create all directories and empty files with the correct names.
>
> 4. **Copy the logo files** from the provided assets into `public/images/logos/`.
>
> 5. **Populate `theme.css`** with the complete CSS custom properties block defined in §5.3 - including the raw palette, semantic tokens, spacing scale, typography scale, and animation timing variables.
>
> 6. **Populate `reset.css`** with a modern CSS reset (use Andy Bell's modern CSS reset as a base).
>
> 7. **Populate `base.css`** with global styles: body background using `var(--color-bg-primary)`, text colour using `var(--color-text-primary)`, font-family using the heading/body variables, smooth scroll behaviour, and `box-sizing: border-box` on all elements.
>
> 8. **Build `index.html`** with the complete HTML structure:
>    - A `<header>` hero section containing: a full-viewport container for the background video/image (use a placeholder dark gradient for now), the Bangeroo logo (white text on blue background variant), a `<h1>` with "Bangeroo" styled with a `glitch-text` class, a short placeholder bio paragraph ("Influenced by the raw energy of [placeholder artists], The Bangs Collective brings..."), an email icon link (`mailto:placeholder@email.com`), and a phone icon link (`tel:+440000000000`). Use inline SVGs for the email and phone icons.
>    - A `<section id="music">` for the Spotify embed with a heading "The Music" and a placeholder `<iframe>` with `data-src` (not `src`) pointing to `https://open.spotify.com/embed/artist/PLACEHOLDER_ID?utm_source=generator&theme=0`. Set the iframe dimensions to `width="100%" height="352"` with `frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"`. Wrap it in a `.spotify-embed-wrapper` div.
>    - A `<section id="gallery">` for the photo carousel with a heading "Gallery" and a Splide container structure.
>    - A `<section id="gigs">` with a `<button>` element containing the text "Click for upcoming gig dates", with `data-umami-event="easter-egg-click"`.
>    - Link all CSS files in the `<head>` (theme first, then reset, base, and section-specific files). Load `main.js` as a module at the end of `<body>`.
>
> 9. **Populate `main.js`** as the entry point that imports and initialises: `lazy-load.js`, `gallery.js`, `easter-egg.js`, and `analytics.js`.
>
> 10. **Populate `lazy-load.js`** with an Intersection Observer that:
>     - Targets all elements with `data-src` attributes and all elements with a `.lazy-section` class.
>     - When an element with `data-src` enters the viewport (rootMargin: `200px`), copies `data-src` to `src` and removes `data-src`.
>     - When a `.lazy-section` enters the viewport, adds a `.is-visible` class to trigger a fade-in transition.
>
> 11. **Populate `easter-egg.js`** with a click handler for the gig dates button that:
>     - Adds a `.revealed` class to the button.
>     - Changes the button's `textContent` to "You're having a laugh".
>     - Prevents re-triggering on subsequent clicks.
>
> 12. **Populate `gallery.js`** with Splide initialisation:
>     - Mount Splide on the `.splide` container.
>     - Config: `type: 'loop'`, `autoplay: true`, `interval: 3000`, `pauseOnHover: true`, `lazyLoad: 'nearby'`, `perPage: 1`, `gap: '1rem'`.
>     - Add 3 placeholder slides with coloured gradient backgrounds (as stand-ins until real photos are provided).
>
> 13. **Populate `analytics.js`** with helper functions:
>     - A `trackEvent(eventName, eventData)` function that calls `window.umami?.track(eventName, eventData)` with a safety check.
>     - Export this function for use in other modules.
>
> 14. **Create `netlify.toml`**:
>     ```toml
>     [build]
>       command = "npm run build"
>       publish = "dist"
>
>     [[headers]]
>       for = "/*"
>       [headers.values]
>         X-Frame-Options = "DENY"
>         X-Content-Type-Options = "nosniff"
>         Referrer-Policy = "strict-origin-when-cross-origin"
>     ```
>
> 15. **Create `README.md`** with: project name and one-line description, feature list, tech stack summary, local development instructions (`npm install`, `npm run dev`), build instructions (`npm run build`), and deployment notes for Netlify.
>
> 16. **Create `SETUP.md`** with sections for:
>     - **Spotify:** Instructions to find The Bangs Collective artist ID on Spotify and replace `PLACEHOLDER_ID` in `index.html`.
>     - **Umami Analytics:** Instructions to create an Umami Cloud account, create a website, and add the tracking script to `index.html`.
>     - **Google Apps Script:** Instructions to create a new Google Apps Script project, paste the code from `scripts/google-apps-script.js`, set the Umami API credentials and recipient email as script properties, and configure a monthly time-driven trigger.
>     - **Hero media:** Instructions to replace the placeholder hero with the final video or image file.
>     - **Gallery photos:** Instructions to add photos to `public/images/gallery/`.
>     - **Contact details:** Instructions to replace the placeholder email and phone number in the hero section.
>
> 17. **Create `scripts/google-apps-script.js`** with the complete Google Apps Script code:
>     - A `sendMonthlyReport()` function that:
>       - Reads `UMAMI_API_URL`, `UMAMI_API_TOKEN`, `UMAMI_WEBSITE_ID`, and `RECIPIENT_EMAIL` from script properties.
>       - Calls the Umami API stats endpoint for the previous calendar month.
>       - Calls the Umami API events endpoint for the previous calendar month.
>       - Formats the data into a readable HTML email with: total page views, unique visitors, top referrers, song click counts, and Easter egg click count.
>       - Sends the email via `GmailApp.sendEmail()`.
>     - A `createMonthlyTrigger()` function that creates a time-driven trigger to run `sendMonthlyReport` on the 1st of each month.
>     - Clear comments explaining each step and the required script properties.
>
> 18. **Verify the build** by running `npm run build` and confirming it completes without errors. Then run `npm run dev` and confirm the page loads in a browser at `localhost:5173` with all sections visible (even if content is placeholder).
>
> **Do not** add any glitch CSS animations yet - those come in Phase 3. Focus on structure, content, and functionality.

---

## Files to Generate at Initialisation

As specified in the first coding task above, the following files must be generated during project setup:

- **`README.md`** - Project purpose, feature summary, tech stack overview, local development and build instructions, Netlify deployment notes.
- **`SETUP.md`** - Step-by-step configuration guide for: Spotify artist ID, Umami Analytics account and tracking script, Google Apps Script setup and monthly trigger, hero media replacement, gallery photo upload, and contact detail replacement.

---

## Appendix A - Glitch Animation Reference

The following CSS provides the foundation for the glitch/static interference effect to be implemented in Phase 3. This is reference material for the coding agent - do not implement until Phase 3.

```css
/* glitch.css - Phase 3 implementation */

@media (prefers-reduced-motion: no-preference) {
  .glitch-text {
    position: relative;
    display: inline-block;
    animation: glitch-skew var(--glitch-interval) infinite alternate-reverse;
  }

  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .glitch-text::before {
    color: var(--color-glitch-r);
    clip-path: inset(0 0 60% 0);
    animation: glitch-top var(--glitch-duration) infinite linear alternate-reverse;
  }

  .glitch-text::after {
    color: var(--color-glitch-b);
    clip-path: inset(40% 0 0 0);
    animation: glitch-bottom var(--glitch-duration) infinite linear alternate-reverse;
  }

  @keyframes glitch-top {
    0%   { transform: translate(0); }
    20%  { transform: translate(-3px, 3px); }
    40%  { transform: translate(3px, -2px); }
    60%  { transform: translate(-2px, 1px); }
    80%  { transform: translate(2px, -3px); }
    100% { transform: translate(0); }
  }

  @keyframes glitch-bottom {
    0%   { transform: translate(0); }
    20%  { transform: translate(3px, -2px); }
    40%  { transform: translate(-3px, 3px); }
    60%  { transform: translate(2px, -1px); }
    80%  { transform: translate(-2px, 2px); }
    100% { transform: translate(0); }
  }

  @keyframes glitch-skew {
    0%   { transform: skew(0deg); }
    2%   { transform: skew(2deg); }
    4%   { transform: skew(0deg); }
    98%  { transform: skew(0deg); }
    100% { transform: skew(-1deg); }
  }
}
```

For the horizontal scan-line displacement seen in the logo (where horizontal bands of text shift left/right), use `clip-path: inset()` with multiple pseudo-elements, each offset by a different `translateX` value. This creates the "horizontal tearing" effect visible in the Bangeroo logo imagery.

---

## Appendix B - Spotify Embed Colour Filter Options

Two approaches to test for overriding the Spotify green:

**Option A - CSS mix-blend-mode overlay:**
```css
.spotify-embed-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.spotify-embed-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-bg-secondary); /* navy blue */
  mix-blend-mode: hue;
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
}
```

**Option B - CSS filter on iframe:**
```css
.spotify-embed-wrapper iframe {
  filter: hue-rotate(140deg) saturate(0.8);
}
```

Option A is preferred as it only shifts the hue of coloured elements without affecting album artwork as severely. Option B is simpler but tints everything. The coding agent should implement Option A first and fall back to Option B if the visual result is unsatisfactory.

---

*End of implementation plan.*
