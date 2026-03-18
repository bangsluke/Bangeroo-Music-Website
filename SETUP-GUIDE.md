# Bangeroo V2 Setup Guide

## 1) Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project. Note the **Project URL** and **Service Role Key** from Settings > API.
3. Open SQL Editor and run:

```sql
-- Guest book table
CREATE TABLE guestbook (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL CHECK (char_length(message) <= 100),
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor counter table
CREATE TABLE visitor_count (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER DEFAULT 0
);

-- Initialize visitor counter
INSERT INTO visitor_count (id, count) VALUES (1, 0);

-- Enable Row Level Security
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_count ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role full access" ON guestbook FOR ALL USING (true);
CREATE POLICY "Service role full access" ON visitor_count FOR ALL USING (true);
```

4. Add Netlify environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

## 2) Spotify Tune-In Setup

Prerequisite: Spotify Premium account.

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URI: `http://localhost:8888/callback`.
3. Copy Client ID and Client Secret.
4. Generate refresh token with one-time auth:

```text
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-read-currently-playing user-read-playback-state
```

5. After redirect to `http://localhost:8888/callback?code=...`, exchange code:

```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://localhost:8888/callback&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

6. Add Netlify environment variables:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`

## 3) Spotify Embed Artist ID

1. Open the artist page on [open.spotify.com](https://open.spotify.com).
2. Copy ID from `https://open.spotify.com/artist/XXXXXXX`.
3. Update `src/config/site-config.js` in:
   - `streamingLinks.spotify`
   - `spotifyEmbed.artistId`

## 4) Adding Your Music

1. Place MP3 files in `public/songs/`.
2. Add/update entries in `src/config/track-data.js`.

## 5) Adding Gallery Photos

1. Place gallery images in `public/images/gallery/`.
2. Rebuild or run dev server to load new slides.

## 6) Customize Streaming Links

Edit `src/config/site-config.js` `streamingLinks` object.

## 7) Customize Contact Details

Edit `src/config/site-config.js` `contact` object.

## 8) Local Development

```bash
npm install
npm run dev
netlify dev
```

## 9) Deployment

Push to your connected repository. Netlify will build/deploy automatically. Ensure all Supabase and Spotify env vars are set before enabling backend features.
