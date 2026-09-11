/**
 * One-off helper: build public/clubs.json from trf-project sample data.
 * Usage: node scripts/bootstrap-sample-clubs.mjs [path-to-crest-sample-clubs.json]
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const defaultPath = join(
  process.cwd(),
  "../trf-project/public/crest-sample-clubs.json",
);
const input = process.argv[2] ?? defaultPath;

const FIELDS = [
  "slug",
  "name",
  "city",
  "country",
  "cluster",
  "tier",
  "competition",
  "vector",
  "confidence",
  "identity_summary",
  "exclusion_clubs",
  "badge_url",
  "archetype",
  "uae",
  "trf_film_youtube_id",
  "research_status",
];

const raw = JSON.parse(readFileSync(input, "utf8"));
const out = raw.map((row) => {
  const club = {};
  for (const key of FIELDS) {
    club[key] = row[key] ?? null;
  }
  if (!club.tier) club.tier = "A";
  return club;
});

const dest = join(process.cwd(), "public/clubs.json");
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${out.length} clubs to ${dest}`);
