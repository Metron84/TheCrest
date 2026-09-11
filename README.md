# The Crest (standalone PWA)

Installable, offline-first quiz flow for The Reflective Football. Section 3 ships the flow only; scoring and results are Section 4.

## Setup

```bash
npm install
node scripts/bootstrap-sample-clubs.mjs   # or npm run snapshot with .env.local
npm run icons
npm run dev    # http://localhost:4350
```

## Club data

- **`public/clubs.json`** is committed and required at build time.
- Refresh from Supabase: `npm run snapshot` (service role in `.env.local`).
- Enrichment stays in **`trf-project`** (`scripts/crest/enrich-sportmonks.mjs`).

## Deploy (Vercel)

This app uses Next.js **static export** (`output: 'export'` in `next.config.mjs`).

Create a **new** Vercel project from [github.com/Metron84/TheCrest](https://github.com/Metron84/TheCrest), then use these settings:

| Setting | Value |
|--------|--------|
| Framework Preset | **Next.js** (not “Other”) |
| Root Directory | *(empty)* |
| Build Command | `npm run build` (default is fine) |
| Output Directory | **leave empty** (do not set `out`) |
| Install Command | `npm ci` or default |
| Production Branch | `main` |

If the dashboard says **No Production Deployment**, open **Deployments** and check the latest build on `main`. A failed build blocks production until it passes. After a green deploy, assign `crest.thereflectivefootball.com` under **Domains**.

`public/clubs.json` is committed, so the build does not need Supabase env vars on Vercel.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run snapshot` | Pull `crest_clubs` from Supabase |
| `npm run icons` | PNG icons from `assets/crest-mark.svg` |
| `postinstall` | Copy self-hosted woff2 fonts to `public/fonts/` |
