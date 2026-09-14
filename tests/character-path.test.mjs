import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  characterTable,
  resolveClubCharacter,
} from "../lib/club-character.js";
import { provisionalDestination } from "../lib/provisional-match.js";
import { resetVarianceCache } from "../lib/scoring.js";
import { characterVetoCount } from "../lib/survival.js";

resetVarianceCache();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(readFileSync(join(root, "public/clubs.json"), "utf8"));
const equalPillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };
const affinity = Array(12).fill(4);

test("thin clubs stay neutral and cannot character-veto", () => {
  const civic = clubs.find((c) => c.slug === "barnsley");
  const resolved = resolveClubCharacter(civic);
  assert.equal(resolved.values.power, 4);
  assert.equal(resolved.confidence.power, 1);
  assert.equal(
    characterVetoCount({ integrity: 1, decency: 1, respect: 1, power: 7 }, civic),
    0,
  );
});

test("a confidence-3 opposite tension revokes that club", () => {
  const everton = clubs.find((c) => c.slug === "everton");
  assert.equal(resolveClubCharacter(everton).values.decency, 2);
  assert.ok(
    characterVetoCount(
      { integrity: 4, decency: 7, respect: 4, power: 4 },
      everton,
    ) >= 1,
  );
});

test("character answers can revoke a club after the twelve affinity questions", () => {
  resetVarianceCache();
  const reform = {
    slug: "reform-club",
    name: "Reform Club",
    cluster: "test-reform",
    tier: "A",
    competition: "Premier League",
    vector: Array(12).fill(4),
    confidence: Array(12).fill(3),
    kit_family: "green",
    identity_summary: "Works inside the system.",
    exclusion_clubs: [],
    research_status: "draft",
    character: { integrity: 4, decency: 4, respect: 4, power: 2 },
    character_confidence: { integrity: 1, decency: 1, respect: 1, power: 3 },
  };
  const resist = {
    ...reform,
    slug: "resist-club",
    name: "Resist Club",
    cluster: "test-resist",
    character: { integrity: 4, decency: 4, respect: 4, power: 7 },
    character_confidence: { integrity: 1, decency: 1, respect: 1, power: 3 },
  };
  const state = {
    scores: affinity,
    pillar: equalPillar,
    ownedSlugs: [],
    hatedColors: [],
  };
  const before = provisionalDestination(
    { ...state, character: { integrity: null, decency: null, respect: null, power: null } },
    [reform, resist],
  );
  const after = provisionalDestination(
    { ...state, character: { integrity: 4, decency: 4, respect: 4, power: 7 } },
    [reform, resist],
  );
  assert.equal(before.club.slug, "reform-club");
  assert.equal(after.club.slug, "resist-club");
  assert.ok(characterVetoCount(after && { power: 7 }, reform) >= 1);
});

test("St Pauli power pole is resistance, Bayern is reform", () => {
  assert.equal(resolveClubCharacter(clubs.find((c) => c.slug === "st-pauli")).values.power, 7);
  assert.equal(resolveClubCharacter(clubs.find((c) => c.slug === "bayern-munich")).values.power, 2);
});

test("every live club has an explicit character row", () => {
  const table = characterTable();
  assert.equal(Object.keys(table).length, clubs.length);
  for (const club of clubs) {
    const row = table[club.slug];
    assert.ok(row, club.slug);
    for (const key of ["integrity", "decency", "respect", "power"]) {
      assert.ok(row.values[key] >= 1 && row.values[key] <= 7, club.slug);
      assert.ok(row.confidence[key] >= 1 && row.confidence[key] <= 3, club.slug);
    }
  }
});

test("most civic clubs stay flat and the three anchors stay locked", () => {
  const table = characterTable();
  let flat = 0;
  for (const club of clubs) {
    const row = table[club.slug];
    const allFour =
      row.values.integrity === 4 &&
      row.values.decency === 4 &&
      row.values.respect === 4 &&
      row.values.power === 4;
    const allThin =
      row.confidence.integrity === 1 &&
      row.confidence.decency === 1 &&
      row.confidence.respect === 1 &&
      row.confidence.power === 1;
    if (allFour && allThin) flat += 1;
  }
  assert.ok(flat > clubs.length / 2, `flat count ${flat}`);

  assert.deepEqual(table.everton.values, {
    integrity: 4,
    decency: 2,
    respect: 4,
    power: 4,
  });
  assert.equal(table.everton.confidence.decency, 3);
  assert.deepEqual(table["real-madrid"].values, {
    integrity: 2,
    decency: 4,
    respect: 4,
    power: 2,
  });
  assert.deepEqual(table["st-pauli"].values, {
    integrity: 6,
    decency: 4,
    respect: 6,
    power: 7,
  });
  assert.equal(table["st-pauli"].confidence.power, 3);
});
