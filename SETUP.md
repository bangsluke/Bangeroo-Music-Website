# Bangeroo Setup Guide

## Spotify

1. Open [https://open.spotify.com/search/The%20Bangs%20Collective](https://open.spotify.com/search/The%20Bangs%20Collective).
2. Open the correct artist page and copy the artist ID from:
   `https://open.spotify.com/artist/{ID}`.
3. The current site is already set to:
   `https://open.spotify.com/artist/0gXu1oMsNf8fnRY0NPCoSw`.
4. If needed, replace the artist ID in `src/index.html` (embed URL and fallback link URL).

## Umami Analytics

1. Create an Umami Cloud account and create a website project.
2. Copy the website ID.
3. In `src/index.html`, replace `UMAMI_WEBSITE_ID` in the Umami script tag.
4. Optional: add more custom events by calling `trackEvent()` in `src/js/analytics.js`.

## Google Apps Script

1. Open [https://script.google.com](https://script.google.com) and create a new project.
2. Paste the contents of `scripts/google-apps-script.js`.
3. Add Script Properties:
   - `UMAMI_API_URL` (example: `https://api.umami.is/v1`)
   - `UMAMI_API_TOKEN`
   - `UMAMI_WEBSITE_ID`
   - `RECIPIENT_EMAIL`
4. Run `createMonthlyTrigger()` once to schedule reports on the 1st of each month.
5. Authorize permissions when prompted.

## Hero Media

- Replace `public/images/hero/hero-placeholder.jpg` with your final fallback image.
- Add your video as `public/images/hero/hero.mp4` for autoplay background.

## Gallery Photos

- Add photos to `public/images/gallery/` (`.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif`).
- Rebuild or restart dev server so Vite can include new files.

## Contact Details

- Edit `public/config/site-config.json`:
  - `contact.email` for the footer mailto link
  - `contact.telephone` for the footer tel link
  - `artist.bio` for hero bio text
