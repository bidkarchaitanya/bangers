# Bangers

An inspiration board of the best of design Twitter. Nothing-inspired design language: dot-matrix display type (Doto), Geist body, off-white canvas, single red accent. Built by Kizo Design.

## Pages

- `/` — **The Board**: curated design tweets in a masonry layout, rendered live with `react-tweet` (no X API key needed). Paste any tweet link in the hero to pull it in and preview it with the "Certified Banger" stamp.
- `/sites` — **The Sites**: curated best-designed websites. Paste any URL — `/api/inspect` extracts title, description, favicon, and theme color server-side, plus a live screenshot (WordPress mShots, free).

## Curate

- **Visual tweets only**: submissions are checked (client and server-side, via Twitter's syndication data) and rejected unless the tweet contains at least one photo, video, or GIF. The media previews in the pull-in card, on the admin desk, and on the board.
- `/admin` — **The Desk**: review submissions. Visitors pull in a tweet and hit "Submit to the board"; it lands in your pending queue. Approve → it appears on the board; reject → gone. You can also remove approved tweets.
- Passcode: set `ADMIN_KEY` in `.env.local` (required — also set it as an env var on your host before deploying).
- Seed tweets: edit `SEEDS` in `app/page.js` (the number at the end of a tweet URL).
- Sites: edit `PICKS` in `app/sites/page.js`.

Submissions persist in `data/board.json`. Fine for local use and a single server; on serverless hosts (Vercel) the filesystem is ephemeral, so swap `lib/store.js` for a real store (Vercel KV, Supabase) before going live — it's the only file that needs changing.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
```

Deploys to Vercel/Netlify with no env vars.
