import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { countryForClub } from "../lib/club-country.js";
import { filterByColours, isColor3Club } from "../lib/colour-veto.js";
import { resetVarianceCache } from "../lib/scoring.js";
import { selectMatches } from "../lib/select.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(readFileSync(join(root, "public/clubs.json"), "utf8"));
const equalPillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };

function club(slug, kit, competition, extras = {}) {
  return {
    slug,
    name: slug,
    cluster: `test-${slug}`,
    tier: "A",
    competition,
    kit_family: kit,
    vector: Array(12).fill(4),
    confidence: Array(12).fill(3),
    identity_summary: "Test club.",
    exclusion_clubs: [],
    research_status: "draft",
    ...extras,
  };
}

test("first-ranked colour is always out", () => {
  const { pool } = filterByColours(
    [club("r", "red", "Premier League"), club("b", "blue", "Serie A")],
    ["red", "green", "yellow"],
  );
  assert.deepEqual(pool.map((c) => c.slug), ["b"]);
});

test("second-ranked colour is out when the country still has another kit", () => {
  const pool = [
    club("eng-red", "red", "Premier League"),
    club("eng-blue", "blue", "Premier League"),
    club("eng-green", "green", "Premier League"),
    club("ita-white", "white", "Serie A"),
  ];
  const { pool: left, color2Kept } = filterByColours(pool, ["red", "blue", "yellow"]);
  assert.ok(!left.some((c) => c.slug === "eng-blue"));
  assert.ok(left.some((c) => c.slug === "eng-green"));
  assert.equal(color2Kept.size, 0);
});

test("second-ranked colour is kept when it is the only kit left in that country", () => {
  const pool = [
    club("eng-red", "red", "Premier League"),
    club("eng-blue", "blue", "Premier League"),
    club("ita-white", "white", "Serie A"),
  ];
  const { pool: left, color2Kept } = filterByColours(pool, ["red", "blue", "yellow"]);
  assert.ok(!left.some((c) => c.slug === "eng-red"));
  const englandOnlyBlue = [
    club("eng-red", "red", "Premier League"),
    club("eng-blue", "blue", "Premier League"),
  ];
  const kept = filterByColours(englandOnlyBlue, ["red", "blue", "yellow"]);
  assert.ok(kept.color2Kept.has("eng-blue"));
  assert.ok(kept.pool.some((c) => c.slug === "eng-blue"));
});

test("third-ranked colour stays in the pool and only hurts fit", () => {
  resetVarianceCache();
  const yellow = club("eng-yellow", "yellow", "Premier League", {
    vector: Array(12).fill(4),
  });
  const white = club("eng-white", "white", "Premier League", {
    vector: Array(12).fill(5),
    cluster: "test-white",
  });
  const user = Array(12).fill(4);
  const withPenalty = selectMatches(
    user,
    [yellow, white],
    equalPillar,
    [],
    ["red", "blue", "yellow"],
  );
  const without = selectMatches(user, [yellow, white], equalPillar, [], ["red", "blue", "green"]);
  assert.ok(withPenalty.byCountry.some((row) => row.match.club.slug === "eng-yellow"));
  assert.ok(isColor3Club(yellow, ["red", "blue", "yellow"]));
  assert.ok(withPenalty.primary.raw < without.primary.raw || withPenalty.primary.club.slug === "eng-white");
});

test("three common colours still return five countries on the live set", () => {
  resetVarianceCache();
  const everton = clubs.find((c) => c.slug === "everton");
  const result = selectMatches(
    everton.vector,
    clubs,
    equalPillar,
    [],
    ["red", "blue", "white"],
  );
  assert.equal(result.byCountry.length, 5);
  for (const row of result.byCountry) {
    assert.ok(countryForClub(row.match.club));
    assert.notEqual(row.match.club.kit_family, "red");
  }
});
