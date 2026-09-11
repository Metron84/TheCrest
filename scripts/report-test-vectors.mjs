import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { selectMatches } from "../lib/select.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(
  readFileSync(join(root, "public/clubs.json"), "utf8"),
);

const equalPillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };
const all7 = Array(12).fill(7);
const all1 = Array(12).fill(1);
const everton = clubs.find((c) => c.slug === "everton").vector;

function topThree(label, vector) {
  const r = selectMatches(vector, clubs, equalPillar, []);
  const names = [
    r.primary?.club.name,
    ...r.neighbours.map((n) => n.club.name),
  ].filter(Boolean);
  console.log(`\n${label}`);
  console.log("  Top three:", names.join(", ") || "(none)");
  if (r.admireFromAfar) {
    console.log("  Admire from afar:", r.admireFromAfar.club.name);
  }
}

topThree("All 7 vector", all7);
topThree("All 1 vector", all1);
topThree("Everton exact vector", everton);
