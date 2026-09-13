/**
 * Adds primary, secondary, stadiumName, skylineVariant to public/clubs.json
 * from lib/club-ground-meta presets. Run: node scripts/enrich-club-ground.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CLUB_GROUND_BY_SLUG } from "../lib/club-ground-meta.js";
import { CLUSTER_PRIMARY } from "../lib/club-color.js";
import { hashSlug } from "../lib/color-utils.js";

const path = join(process.cwd(), "public/clubs.json");
const clubs = JSON.parse(readFileSync(path, "utf8"));

const enriched = clubs.map((club) => {
  const preset = CLUB_GROUND_BY_SLUG[club.slug];
  const primary =
    preset?.primary ||
    (club.cluster && CLUSTER_PRIMARY[club.cluster]) ||
    "#0A111F";
  const secondary = preset?.secondary || "#1a2438";
  const stadiumName = preset?.stadiumName || "Home ground";
  const skylineVariant =
    preset?.skylineVariant ?? (hashSlug(club.slug) % 6) + 1;

  return {
    ...club,
    city: club.city || "Unknown",
    primary,
    secondary,
    stadiumName,
    skylineVariant,
  };
});

writeFileSync(path, `${JSON.stringify(enriched, null, 2)}\n`);
console.log(`Enriched ${enriched.length} clubs → ${path}`);
