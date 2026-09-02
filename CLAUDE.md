# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this app is

A personal catalogue of wifi performance at venues (coffee shops, co-working spaces, libraries).
Log a visit: run a client-side speed test, capture the venue via GPS + Google Places lookup (or
manual entry), and record wifi SSID/auth/password, toilet door code, and amenity ratings (seating,
power outlets, noise, food/coffee quality, wifi cost). A venue can have many visits over time — the
list/map view shows the latest speed and aggregate ratings per venue.

Part of the fleet of independent apps behind nginx/PM2 — see `/root/SYSTEM.md` for the shared
architecture (base path, port, PM2, nginx conventions) and `/root/CLAUDE.md` for the fleet index.
This file covers only what's specific to `wifiscout` (port 3010, base `/wifiscout`).

## Commands

```bash
npm run dev      # concurrently runs server (Express) + client (Vite)
npm run build    # vite build, output to server/public/
npm run start    # starts Express server
```

No test suite yet — this is a personal single-user app; see the plan doc for what's proportionate to add.

## Architecture

- `server/db.js` — SQLite (`better-sqlite3`), two tables: `venues` (catalogue) and `visits`
  (one row per test, FK to venue, `ON DELETE CASCADE`).
- `server/lib/repo.js` — read-side aggregation (`getVenuesWithSummary`, `getVenueWithVisits`) kept
  out of route handlers.
- `server/lib/googlePlaces.js` + `server/routes/places.js` — proxies Google Places Nearby Search
  and Text Search so the API key (`GOOGLE_PLACES_API_KEY` in `.env`) never reaches the client.
- `server/routes/visits.js` — accepts `multipart/form-data` (via `multer`) so a visit and its
  optional photo save atomically; photos live on disk under `server/data/uploads/` (gitignored),
  never base64-in-DB.
- Client speed test (`client/src/lib/speedtest.js`) runs entirely in the browser against
  Cloudflare's public speed-test infrastructure (`@cloudflare/speedtest`) — deliberately not
  against our own server, since that would measure home broadband instead of the venue's wifi.
- `client/src/lib/urlParams.js` — the integration point for external launchers (an iPhone
  Shortcut, documented on the in-app Setup page): `LogVisit` reads `?ssid=&lat=&lng=` from the
  URL to pre-fill the form and skip the in-page GPS prompt when present.

## Gotchas

- Google Places API requires billing enabled on the GCP project even for free-tier personal use.
- `wifi_password` and `toilet_door_code` are stored **plain text** — deliberate trade-off for a
  personal single-user app on your own server, not an oversight.
- There is no pre-built `.shortcut` file to download — Apple's Shortcuts binary format can't be
  hand-authored reliably without a real device to verify against. The Setup page instead walks
  through building the 3-action shortcut manually (~60 seconds).
