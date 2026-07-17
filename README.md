# Cognita

A one-person study log and spaced-repetition tool. Three features, on purpose:

1. **Study log** — one line per session: topic, minutes, one takeaway.
2. **Flashcards** — hand-written, scheduled with a simplified SM-2 algorithm.
3. **Today view** — the two-week test strip, your streak, and the single next action.

No accounts, no backend, no tracking. Data lives in your browser's localStorage. Use **Export** (bottom of the page) to back it up or move it between devices.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Cognita v1"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cognita.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project**, and import the repo.
3. Vercel auto-detects Vite. Accept the defaults and click **Deploy**. Done — you'll get a URL like `cognita-xxx.vercel.app`.

On your phone, open the URL and use **Add to Home Screen** — it installs like an app.

## Things to know

- **Data is per-browser.** Phone and laptop each have their own data. Pick one device as home, or use Export/Import to move data. Sync is deliberately not built yet.
- **The streak** survives until midnight — an unlogged today doesn't break it until tomorrow.
- **"Again" cards** cycle back into the same review session until you get them right.

## Roadmap discipline

The rule this project lives by: **no new feature until the two-week test strip is full.** If you've logged study sessions for 14 days, the tool has earned an upgrade. If you haven't, more features wouldn't have saved it.

Earned-upgrade candidates, in order:
1. Supabase (free tier) for cross-device sync + auth
2. AI-graded active recall via the Anthropic API (needs a Vercel serverless function to keep the key off the client)
3. Weekly stats view

## Stack

Vite + React 18, plain CSS. Two runtime dependencies. That's the point.
