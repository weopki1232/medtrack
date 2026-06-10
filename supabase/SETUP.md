# MedTrack — Account & Sync setup (one-time, ~15 minutes)

The app works fully offline without this. Completing these steps turns on
"Sign in with Google" + automatic cross-device sync on the hosted web app.

## 1. Create the Supabase project (free)
1. Go to https://supabase.com → Sign in (GitHub login is easiest) → **New project**.
2. Name: `medtrack` · Region: Southeast Asia (Singapore) · Generate a database password (save it anywhere safe; the app never uses it).
3. Wait ~2 minutes for the project to provision.

## 2. Create the sync table
1. In the project: **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/schema.sql` from this repo → **Run**.
   It should say "Success. No rows returned".

## 3. Turn on Google sign-in
1. In Google Cloud Console (https://console.cloud.google.com):
   - Create a project (e.g. `medtrack`) → **APIs & Services → OAuth consent screen** → External → fill app name `MedTrack` + your email → Save.
   - **APIs & Services → Credentials → Create credentials → OAuth client ID** → Web application.
   - Authorized redirect URI: paste the **Callback URL** shown in Supabase under
     **Authentication → Sign In / Up → Google** (looks like
     `https://<project-ref>.supabase.co/auth/v1/callback`).
   - Create → copy the **Client ID** and **Client secret**.
2. Back in Supabase: **Authentication → Sign In / Up → Google** → enable, paste
   Client ID + Client secret → Save.
3. In Supabase **Authentication → URL Configuration**:
   - Site URL: `https://weopki1232.github.io/medtrack/`
   - Additional redirect URLs: add the same URL.

## 4. Wire the app to the project
1. In Supabase: **Settings → API** (now called *Project Settings → Data API*) — copy
   the **Project URL** and the **anon public** key.
2. Put them into `js/sync/supabase-config.js`:
   ```js
   var SUPABASE_URL = 'https://<project-ref>.supabase.co';
   var SUPABASE_ANON_KEY = '<anon key>';
   ```
   (The anon key is safe to commit — RLS protects the data.)
3. Commit + push. Done — the web app now shows "Sign in with Google" in
   Settings and a ☁️ chip in the sidebar.

## Notes
- The **desktop Electron app stays local-only** (Google blocks OAuth inside
  desktop webviews). Use the web app on any browser/phone for synced data; move
  desktop history once via Settings → Export → Import.
- Sync model: offline-first, last-write-wins per data key; session/task/score/
  mistake/formula/diagram lists are merged by record id so two devices can't
  wipe each other's entries.
