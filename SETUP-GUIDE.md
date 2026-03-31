# Bangeroo Setup Guide (Spotify + Supabase + Local Debugging)

This guide focuses on the two backend integrations used by the app:
- Supabase for `guestbook` and `visitor_count`
- Spotify Web API for the now-playing status in the navigation

This guide intentionally does not cover Spotify embed artist ID setup.

## 1) Before You Start

### Required accounts and tools
- A Supabase account and project: [https://supabase.com](https://supabase.com)
- A Spotify account (Premium recommended for consistent now-playing behavior) and a developer app: [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
- Node.js 18+ and npm
- Netlify CLI (install globally if needed): `npm install -g netlify-cli`

### Environment variable locations
- **Local development:** create a `.env` file in the repo root (same folder as `package.json`)
- **Netlify deployed site:** set the same keys in Netlify Site Settings -> Environment variables

### Environment keys used by this project
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## 2) Supabase Setup (Guestbook + Visitor Counter)

### Step 1: Create project and get API credentials
1. In Supabase, create a new project.
2. In the left sidebar, go to **Settings -> General** and find **Project URL**.
   - Copy this value and use it as `SUPABASE_URL` (for example `https://YOUR_PROJECT_REF.supabase.co`).
3. In the left sidebar, go to **Settings -> API Keys**.
   - Under **Secret keys**, copy the `default` secret key (starts with `sb_secret_...`) and use it as `SUPABASE_SERVICE_KEY`.

Use the secret `default` key (service-role equivalent), not the anonymous/public key. Netlify functions perform inserts and updates server-side.

### Step 2: Create required tables and seed data
Open Supabase SQL Editor and run:

```sql
-- Guestbook entries
create table if not exists guestbook (
  id bigserial primary key,
  message text not null check (char_length(message) <= 100),
  ip_hash text,
  created_at timestamptz not null default now()
);

-- Single-row visitor counter
create table if not exists visitor_count (
  id integer primary key,
  count integer not null default 0
);

-- Ensure row id=1 exists for upsert flow in visitor-count function
insert into visitor_count (id, count)
values (1, 0)
on conflict (id) do nothing;
```

### Step 3: Enable RLS and create policies
The functions use the service role key (which bypasses RLS), but enabling RLS is still good baseline practice.

```sql
alter table guestbook enable row level security;
alter table visitor_count enable row level security;

-- Optional but recommended if you later query these tables from clients.
-- Service role still has full access regardless.
drop policy if exists "service role full access guestbook" on guestbook;
create policy "service role full access guestbook"
on guestbook
for all
using (true)
with check (true);

drop policy if exists "service role full access visitor_count" on visitor_count;
create policy "service role full access visitor_count"
on visitor_count
for all
using (true)
with check (true);
```

### Step 4: Add Supabase env vars
In local `.env` and Netlify env settings, set:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### Step 5: What features this powers
- `/.netlify/functions/guestbook-read` reads latest 50 guestbook messages
- `/.netlify/functions/guestbook-write` inserts a new message (1-100 chars, with IP hash rate limit)
- `/.netlify/functions/visitor-count` reads and increments `visitor_count.id=1`

## 3) Spotify Setup (Now Playing API)

This project uses Spotify only for the `spotify-now-playing` Netlify function and the nav online/offline indicator.

### Step 1: Create Spotify app
1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app.
3. Add redirect URI: `http://127.0.0.1:8888/callback`
4. Save and copy:
   - Client ID -> `SPOTIFY_CLIENT_ID`
   - Client Secret -> `SPOTIFY_CLIENT_SECRET`

### Step 2: Authorize scopes and get one-time code
Open this URL in your browser (replace placeholders):

```text
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://127.0.0.1:8888/callback&scope=user-read-currently-playing%20user-read-playback-state
```

After login/consent, browser redirects to:

```text
http://127.0.0.1:8888/callback?code=YOUR_AUTH_CODE
```

Copy `YOUR_AUTH_CODE`.

### Step 3: Exchange auth code for refresh token (PowerShell)
Run in PowerShell:

```powershell
$Body = "grant_type=authorization_code&code=YOUR_AUTH_CODE&redirect_uri=http://127.0.0.1:8888/callback&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
Invoke-RestMethod -Method Post `
  -Uri "https://accounts.spotify.com/api/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $Body
```

From the JSON response, copy `refresh_token` -> `SPOTIFY_REFRESH_TOKEN`.

### Step 4: Add Spotify env vars
In local `.env` and Netlify env settings:

```env
SPOTIFY_CLIENT_ID=YOUR_CLIENT_ID
SPOTIFY_CLIENT_SECRET=YOUR_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN=YOUR_REFRESH_TOKEN
```

### Step 5: What this powers
- `/.netlify/functions/spotify-now-playing`
  - Refreshes access token with your refresh token
  - Calls `GET /v1/me/player/currently-playing`
  - Returns `{ isPlaying: true/false, ... }`
- Frontend polls this endpoint (default every 30s) and updates nav status (`MB Online` / `MB Offline`)

## 4) Run Locally and Verify Both Integrations

### Step 1: Install dependencies

```powershell
npm install
```

### Step 2: Start local app + functions through Netlify

```powershell
npm run dev:netlify
```

Expected:
- Netlify serves site (usually `http://localhost:8888`)
- Netlify proxies/functions available under `/.netlify/functions/*`

### Step 3: Browser verification checklist
1. Open the local URL printed by Netlify CLI.
2. Scroll to **Shout Wall**:
   - Post a short message
   - Confirm it appears immediately
   - Refresh page and confirm it still loads from backend
3. Scroll footer:
   - Confirm visitor counter text loads (not `Visitor counter offline`)
4. Check nav now-playing chip:
   - Displays `MB Online` when currently playing
   - Displays `MB Offline` when nothing is currently playing

### Step 4: Endpoint verification checklist (PowerShell)

Read guestbook:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8888/.netlify/functions/guestbook-read"
```

Write guestbook:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8888/.netlify/functions/guestbook-write" `
  -ContentType "application/json" `
  -Body '{"message":"Setup test message"}'
```

Increment visitor counter:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8888/.netlify/functions/visitor-count"
```

Check Spotify now-playing:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8888/.netlify/functions/spotify-now-playing"
```

## 5) Debugging and Common Issues

### Supabase errors
- **Symptom:** `Supabase is not configured`
  - **Cause:** Missing `SUPABASE_URL` or `SUPABASE_SERVICE_KEY`
  - **Fix:** Set both env vars, restart `netlify dev`

- **Symptom:** `relation "guestbook" does not exist` or `relation "visitor_count" does not exist`
  - **Cause:** SQL schema not created in your current Supabase project
  - **Fix:** Re-run SQL setup in Section 2, then test endpoints again

- **Symptom:** Posting fails with 500 or generic unavailable message
  - **Cause:** Wrong service key, project URL mismatch, or table constraint mismatch
  - **Fix:** Re-copy credentials from Supabase Settings -> API and verify message length <= 100

- **Symptom:** 429 `Please wait before posting again`
  - **Cause:** `guestbook-write` rate limit by IP hash (one post per ~60s)
  - **Fix:** Wait a minute before retrying

### Spotify errors
- **Symptom:** Endpoint returns `{ isPlaying: false, error: "Spotify environment variables are missing" }`
  - **Cause:** Missing Spotify env vars
  - **Fix:** Set all 3 Spotify keys and restart `netlify dev`

- **Symptom:** Always `isPlaying: false` with no error
  - **Cause:** Spotify returns 204 when nothing is actively playing
  - **Fix:** Start playback on the authorized account and test again

- **Symptom:** Token refresh failures (`Failed to refresh Spotify token`)
  - **Cause:** Invalid client secret, expired/invalid refresh token, or app credentials mismatch
  - **Fix:** Re-run auth code flow and generate a fresh refresh token

### Local runtime issues
- **Symptom:** Frontend works but function endpoints 404
  - **Cause:** Running `npm run dev` (Vite only) instead of Netlify dev
  - **Fix:** Use `npm run dev:netlify` when testing backend integrations

- **Symptom:** Changes to `.env` do not take effect
  - **Cause:** Dev server already running with old environment
  - **Fix:** Stop and restart Netlify dev

- **Symptom:** Visitor or guestbook UI shows offline/unavailable text
  - **Cause:** Function returned non-200 or network error
  - **Fix:** Call endpoint directly with `Invoke-RestMethod` to inspect returned error details first

## 6) Other Project Setup

### Add music tracks
1. Put audio files in `public/songs/`
2. Update `src/config/track-data.js`

### Add gallery photos
1. Put images in `public/images/gallery/`
2. Refresh local app

### Customize links and contact
- Edit `src/config/site-config.js`:
  - `streamingLinks`
  - `contact`

## 7) Deployment Checklist

Before deploy, verify:
- Supabase env vars set in Netlify (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)
- Spotify env vars set in Netlify (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`)
- Local endpoint tests pass in Section 4

Then push to your connected repository. Netlify will build and deploy automatically.

## 8) Keep Supabase Free Project Active (Heartbeat Automation)

Free-tier Supabase projects can pause after inactivity. This repo includes an automated heartbeat:
- Netlify function: `/.netlify/functions/supabase-heartbeat`
- Friendly route alias: `/api/supabase-heartbeat` (rewrites to the Netlify function)
- GitHub Actions schedule: `.github/workflows/supabase-heartbeat.yml` (every 3 days)

### Step 1: Add Netlify environment variable
In Netlify Site Settings -> Environment variables, add:

```env
HEARTBEAT_TOKEN=YOUR_LONG_RANDOM_TOKEN
```

Use a high-entropy token (for example, 32+ random characters).

### Step 2: Add GitHub repository secrets
In GitHub -> Settings -> Secrets and variables -> Actions, add:

- `HEARTBEAT_URL` = `https://YOUR_SITE_DOMAIN/.netlify/functions/supabase-heartbeat`
- Recommended: `https://YOUR_SITE_DOMAIN/api/supabase-heartbeat`
- `HEARTBEAT_TOKEN` = same value as Netlify `HEARTBEAT_TOKEN`

### Step 3: Verify once manually
Run the workflow manually from GitHub Actions (`workflow_dispatch`) and confirm it succeeds.

If you get a 404:
- Confirm the latest commit is deployed on Netlify (the function and redirect must exist in that deploy).
- Confirm `HEARTBEAT_URL` points to your deployed production domain and exact path:
  - `https://YOUR_SITE_DOMAIN/api/supabase-heartbeat`

If you get a 500 with `fetch failed`:
- Confirm Netlify has valid production env values for:
  - `SUPABASE_URL` (must be `https://YOUR_PROJECT_REF.supabase.co`)
  - `SUPABASE_SERVICE_KEY` (secret key, typically starts with `sb_secret_`)
- Make sure those values are not wrapped in quotes and have no trailing spaces.
- If you changed env vars, trigger a fresh Netlify deploy so functions pick up updated values.
- Test endpoint directly:
  - `https://YOUR_SITE_DOMAIN/api/supabase-heartbeat` with header `x-heartbeat-token`.
- Check Supabase project status in dashboard and unpause first if needed.

### Step 4: Confirm no caching and DB access
The heartbeat endpoint is protected by a token and performs a real Supabase table read (`visitor_count`) with `Cache-Control: no-store`.
This is intentional to ensure a real backend/database activity signal.
