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

## Deploy

Static export (`output: 'export'`). Own Vercel project. Suggested host: `crest.thereflectivefootball.com`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run snapshot` | Pull `crest_clubs` from Supabase |
| `npm run icons` | PNG icons from `assets/crest-mark.svg` |
| `postinstall` | Copy self-hosted woff2 fonts to `public/fonts/` |
