import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { countryForClub, CREST_COUNTRIES } from "../lib/club-country.js";
import { comparePathEntries, resetVarianceCache } from "../lib/scoring.js";
import { pickCountryMatches, selectMatches } from "../lib/select.js";

resetVarianceCache();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(
  readFileSync(join(root, "public/clubs.json"), "utf8"),
);

const equalPillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };

test("countryForClub maps leagues and leaves Celtic and Ajax out", () => {
  assert.equal(
    countryForClub({ competition: "Premier League" }),
    "england",
  );
  assert.equal(countryForClub({ competition: "Serie A" }), "italy");
  assert.equal(countryForClub({ competition: "Ligue 1" }), "france");
  assert.equal(countryForClub({ competition: "LaLiga" }), "spain");
  assert.equal(countryForClub({ competition: "Bundesliga" }), "germany");
  assert.equal(countryForClub({ slug: "everton" }), "england");
  assert.equal(countryForClub({ slug: "celtic" }), null);
  assert.equal(countryForClub({ slug: "ajax" }), null);
});

test("the live club set has at least one club in each of the five countries", () => {
  const found = new Set();
  for (const club of clubs) {
    const id = countryForClub(club);
    if (id) found.add(id);
  }
  for (const country of CREST_COUNTRIES) {
    assert.ok(found.has(country.id), `missing ${country.id}`);
  }
});

test("selectMatches always returns five country clubs with percentages", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  const result = selectMatches(everton.vector, clubs, equalPillar, []);
  assert.equal(result.byCountry.length, 5);
  assert.deepEqual(
    result.byCountry.map((row) => row.id),
    CREST_COUNTRIES.map((c) => c.id),
  );
  for (const row of result.byCountry) {
    assert.ok(row.match.club);
    assert.equal(countryForClub(row.match.club), row.id);
    assert.ok(row.match.percent >= 60);
    assert.ok(row.match.percent <= 97);
  }
});

test("primary is the strongest of the five country clubs", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  const result = selectMatches(everton.vector, clubs, equalPillar, []);
  const best = result.byCountry.reduce((a, b) =>
    comparePathEntries(b.match, a.match) < 0 ? b : a,
  );
  assert.equal(result.primary.club.slug, best.match.club.slug);
});

test("an owned England club is skipped for England and never primary", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  const result = selectMatches(everton.vector, clubs, equalPillar, ["everton"]);
  const england = result.byCountry.find((row) => row.id === "england");
  assert.ok(england);
  assert.notEqual(england.match.club.slug, "everton");
  assert.notEqual(result.primary.club.slug, "everton");
  const slugs = result.byCountry.map((row) => row.match.club.slug);
  assert.ok(!slugs.includes("everton"));
});

test("pickCountryMatches scales percentages among the five only", () => {
  const identity = (entry) => ({ ...entry, reason: "" });
  const ranked = [
    { club: { slug: "a", competition: "Premier League", tier: "A" }, raw: 0.9 },
    { club: { slug: "b", competition: "Serie A", tier: "A" }, raw: 0.8 },
    { club: { slug: "c", competition: "Ligue 1", tier: "A" }, raw: 0.7 },
    { club: { slug: "d", competition: "LaLiga", tier: "A" }, raw: 0.6 },
    { club: { slug: "e", competition: "Bundesliga", tier: "A" }, raw: 0.5 },
  ];
  const rows = pickCountryMatches(ranked, identity);
  assert.equal(rows.find((r) => r.id === "england").match.percent, 97);
  assert.equal(rows.find((r) => r.id === "germany").match.percent, 60);
});
