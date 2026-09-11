import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  displayPercent,
  rank,
  rawFit,
  resetVarianceCache,
  varianceWeights,
} from "../lib/scoring.js";
import { selectMatches } from "../lib/select.js";

resetVarianceCache();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(
  readFileSync(join(root, "public/clubs.json"), "utf8"),
);

const equalPillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };

test("identical vector ranks that club first", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  const ranked = rank(everton.vector, clubs, equalPillar);
  assert.equal(ranked[0].club.slug, "everton");
});

test("excluded owned club never appears in selections", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  const result = selectMatches(everton.vector, clubs, equalPillar, ["everton"]);
  assert.ok(result.primary);
  assert.notEqual(result.primary.club.slug, "everton");
});

test("derby rivals do not appear together as primary and neighbour", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  const result = selectMatches(everton.vector, clubs, equalPillar, []);
  assert.equal(result.primary.club.slug, "everton");
  const neighbourSlugs = result.neighbours.map((n) => n.club.slug);
  assert.ok(!neighbourSlugs.includes("liverpool"));
});

test("display percentages never fall below 60", () => {
  for (let lo = 0.5; lo <= 0.95; lo += 0.05) {
    for (let hi = lo; hi <= 0.99; hi += 0.05) {
      for (const raw of [lo, (lo + hi) / 2, hi]) {
        assert.ok(displayPercent(raw, lo, hi) >= 60);
      }
    }
  }
});

test("rawFit is perfect for identical vectors", () => {
  const club = clubs[0];
  const fit = rawFit(club.vector, club, equalPillar, varianceWeights(clubs));
  assert.ok(Math.abs(fit - 1) < 1e-9);
});
