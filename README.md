# MedTrack 🩺 — TCAS Study Tracker

A customizable study tracker for the Thai university admission system (TCAS):
**TGAT 1–3, TPAT 1–5, and all A-Level subjects** — for any track (medicine,
engineering, science, arts, architecture, education, humanities) and any
generation (dek 70, 71, 72, …).

**Use it now:** https://weopki1232.github.io/medtrack/ — on a phone or iPad,
open it in the browser and *Add to Home Screen* to install it as an app
(works offline).

## Features
- 📚 24 subjects with full topic checklists (EN/ไทย), pick yours via track presets
- ⏱ Study timer (Pomodoro + custom), per-topic time tracking
- 📊 Dashboard, analytics, heatmaps, exam-score tracker, smart insights
- 🗓 Auto-generated weekly study schedule + behind-schedule warnings
- 🎓 Generation system: set your dek (70, 71, …) and all default exam dates
  shift to your year; every date individually editable; customizable sidebar countdown
- ⭐ Per-subject priority (critical/high/medium/low) — your call, not hardcoded
- 🧠 Formula vault with flashcards & spaced review, mistake log, diagrams, tasks
- ☁️ Optional Google sign-in with automatic cross-device sync (Supabase)
- 🌗 8 themes, EN/ไทย interface, ambient focus modes

## Project layout
```
index.html        app shell (pages, modals, script includes)
css/styles.css    all styles & themes
js/
  data/           subjects & topics, exam dates, generations, i18n strings
  core/           storage, i18n, router, helpers, state
  pages/          one module per page (dashboard, timer, subjects, …)
  features/       focus mode, achievements, flashcards, ambient effects, …
  sync/           Supabase auth + offline-first sync engine
  app.js, boot.js init & startup
main.js           Electron shell (desktop app)
sw.js, manifest.webmanifest, icons/   PWA install & offline
supabase/         sync schema + one-time setup guide (SETUP.md)
tools/            split/parity test harnesses used during the refactor
legacy: medtrack.html is the pre-refactor single-file build (kept for rollback)
```
No build step: edit a file, reload. Plain scripts share one global scope in
the order listed in `index.html`.

## Run locally
- **Browser:** open `index.html` (everything except Google sign-in works on `file://`)
- **Desktop (Electron):** `npm install && npm start`
- **Windows installer:** `npm run build:win`

## Enable accounts & sync
Follow `supabase/SETUP.md` (one-time, ~15 min), then put your project URL +
anon key in `js/sync/supabase-config.js`. Without it the app simply runs
offline-only.

---
Built by Wesley & Claude ✦
