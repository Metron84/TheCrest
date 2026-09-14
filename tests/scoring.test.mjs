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

test("Tier B cannot be primary unless it clearly beats the best Tier A in the same stratum", () => {
  resetVarianceCache();
  const userVector = Array(12).fill(4);
  const tierA = {
    slug: "tier-a-test",
    name: "Tier A Test",
    city: "A",
    country: "X",
    cluster: "test-a",
    tier: "A",
    vector: Array(12).fill(4),
    confidence: Array(12).fill(3),
    identity_summary: "Tier A control club.",
    exclusion_clubs: [],
    research_status: "draft",
  };
  const tierB = {
    slug: "tier-b-test",
    name: "Tier B Test",
    city: "B",
    country: "X",
    cluster: "test-b",
    tier: "B",
    vector: Array(12).fill(4.3),
    confidence: Array(12).fill(1),
    identity_summary: "Tier B club with a slightly closer vector.",
    exclusion_clubs: [],
    research_status: "draft",
  };
  const result = selectMatches(userVector, [tierA, tierB], equalPillar, []);
  assert.equal(result.primary.club.slug, "tier-a-test");
  assert.ok(result.neighbours.some((n) => n.club.slug === "tier-b-test"));
});

test("hated colour hard-vetoes clubs with that kit_family", () => {
  resetVarianceCache();
  const red = {
    slug: "red-test",
    name: "Red Test",
    cluster: "test-red",
    tier: "A",
    competition: "Serie A",
    kit_family: "red",
    vector: Array(12).fill(4),
    confidence: Array(12).fill(3),
    identity_summary: "Control red club.",
    exclusion_clubs: [],
    research_status: "draft",
  };
  const blue = {
    ...red,
    slug: "blue-test",
    name: "Blue Test",
    cluster: "test-blue",
    kit_family: "blue",
    vector: Array(12).fill(3),
  };
  const result = selectMatches(red.vector, [red, blue], equalPillar, [], "red");
  assert.equal(result.primary.club.slug, "blue-test");
  assert.ok(!result.byCountry.some((row) => row.match.club.slug === "red-test"));
});
