# Deploying Cognita — the no-terminal path

You do not need Node, npm, or git installed on your computer. Vercel does the build.

## Step 1 — Put the code on GitHub (in the browser)

1. Go to github.com → **New repository** → name it `cognita` → Create.
2. On the empty repo page, click **"uploading an existing file"**.
3. Open the unzipped folder on your computer, select **everything inside it**
   (index.html, package.json, src, public, etc.) and drag it into the upload box.
   ⚠️ Drag the *contents*, not the folder itself. After uploading, `package.json`
   must be visible on the repo's front page — not inside a subfolder.
   If it's nested, Vercel's build will fail.
4. Click **Commit changes**.

## Step 2 — Deploy on Vercel

1. Go to vercel.com → sign in **with GitHub**.
2. **Add New → Project** → Import the `cognita` repo.
3. Vercel auto-detects Vite (Framework Preset: Vite). Change nothing. Click **Deploy**.
4. ~60 seconds later you get a live URL. Open it on your phone →
   browser menu → **Add to Home Screen**.

## If something fails

- **"No package.json found" / build error** → your files are nested one folder
  deep. Either re-upload the contents at the root, or in Vercel:
  Project → Settings → **Root Directory** → set it to the folder name → redeploy.
- **Blank page after double-clicking index.html on your computer** → that's
  expected. This app runs from the Vercel URL (or `npm run dev` locally),
  not by opening the file directly.
- **Changes not saving** → the app stores data in the browser you're using.
  Private/incognito windows wipe it when closed. Use a normal window.

## Running locally (optional, needs Node 18+)

```bash
npm install
npm run dev      # opens on localhost:5173
npm test         # runs the interaction test suite (7 tests)
```
