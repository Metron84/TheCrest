import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { countryForClub } from "../lib/club-country.js";
import { rank, rankPartial, resetVarianceCache, varianceWeights } from "../lib/scoring.js";
import { pathFitPartial } from "../lib/scoring.js";
import { selectMatches } from "../lib/select.js";
import { provisionalDestination } from "../lib/provisional-match.js";
import {
  applyDiscordance,
  discordance,
  isHardVeto,
  vetoCount,
} from "../lib/survival.js";

resetVarianceCache();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(readFileSync(join(root, "public/clubs.json"), "utf8"));
const equalPillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };
const vw = varianceWeights(clubs);

function club({ slug, vector, confidence, tier = "A", ...rest }) {
  return {
    slug,
    name: slug,
    city: "Test",
    country: "England",
    cluster: `test-${slug}`,
    tier,
    competition: "Premier League",
    vector,
    confidence,
    identity_summary: "Test club.",
    exclusion_clubs: [],
    research_status: "draft",
    ...rest,
  };
}

test("neutral never hard-vetoes", () => {
  assert.equal(isHardVeto(4, 7, 3), false);
  assert.equal(isHardVeto(1, 4, 3), false);
  assert.equal(isHardVeto(7, 4, 3), false);
});

test("confidence 1 cannot hard-veto", () => {
  assert.equal(isHardVeto(1, 7, 1), false);
  const c = club({
    slug: "thin",
    vector: [7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  });
  assert.equal(vetoCount([1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], c), 0);
});

test("confidence 2 does not hard-veto but attenuates opposite mismatch", () => {
  assert.equal(isHardVeto(1, 7, 2), false);
  const D = discordance(1, 7, 2);
  assert.ok(D > 0);
  const c = club({
    slug: "mid-conf",
    vector: [7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  });
  const scores = [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
  const F = 0.8;
  const sigma = applyDiscordance(F, scores, c);
  assert.ok(sigma < F);
});

test("answer two revokes a confidence-3 opposite-pole leader", () => {
  const calm = club({
    slug: "calm-success",
    vector: [1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: Array(12).fill(3),
  });
  const chaos = club({
    slug: "volatile-success",
    vector: [1, 7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: Array(12).fill(3),
  });
  const pool = [calm, chaos];
  const afterOne = rankPartial(
    [1, null, null, null, null, null, null, null, null, null, null, null],
    pool,
    equalPillar,
    vw,
  );
  assert.equal(afterOne[0].club.slug, "calm-success");

  const afterTwo = rankPartial(
    [1, 7, null, null, null, null, null, null, null, null, null, null],
    pool,
    equalPillar,
    vw,
  );
  assert.ok(afterTwo.find((r) => r.club.slug === "calm-success").vetoCount >= 1);
  assert.equal(afterTwo[0].club.slug, "volatile-success");
  assert.equal(afterTwo[0].vetoCount, 0);
});

test("winning then chaos leaves a calm success club", () => {
  const calm = club({
    slug: "calm-giant",
    vector: [2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: Array(12).fill(3),
  });
  const volatile = club({
    slug: "volatile-giant",
    vector: [2, 7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: Array(12).fill(3),
  });
  const scores = [1, 7, null, null, null, null, null, null, null, null, null, null];
  assert.ok(vetoCount(scores, calm) >= 1);
  assert.equal(vetoCount(scores, volatile), 0);
  const hud = provisionalDestination(
    { scores, pillar: equalPillar, ownedSlugs: [], hatedColor: null },
    [calm, volatile],
  );
  assert.equal(hud.club.slug, "volatile-giant");
});

test("zero-veto Tier B beats a one-veto Tier A", () => {
  resetVarianceCache();
  const user = [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
  const tierA = club({
    slug: "vetoed-a",
    tier: "A",
    vector: [7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: Array(12).fill(3),
  });
  const tierB = club({
    slug: "living-b",
    tier: "B",
    vector: Array(12).fill(4),
    confidence: Array(12).fill(1),
    cluster: "test-living-b",
  });
  const result = selectMatches(user, [tierA, tierB], equalPillar, []);
  assert.equal(result.primary.club.slug, "living-b");
});

test("Tier A/B margin still applies inside the same stratum", () => {
  resetVarianceCache();
  const user = Array(12).fill(4);
  const tierA = club({
    slug: "same-a",
    tier: "A",
    vector: Array(12).fill(4.2),
    confidence: Array(12).fill(3),
  });
  const tierB = club({
    slug: "same-b",
    tier: "B",
    vector: Array(12).fill(4.14),
    confidence: Array(12).fill(1),
    cluster: "test-same-b",
  });
  const result = selectMatches(user, [tierA, tierB], equalPillar, []);
  assert.equal(result.primary.club.slug, "same-a");
});

test("zero-veto club beats a higher-fit one-veto club in another country", () => {
  resetVarianceCache();
  const user = [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
  const england = club({
    slug: "eng-safe",
    tier: "B",
    vector: Array(12).fill(4),
    confidence: Array(12).fill(1),
  });
  const italy = club({
    slug: "ita-veto",
    name: "ita-veto",
    country: "Italy",
    competition: "Serie A",
    tier: "A",
    vector: [7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    confidence: Array(12).fill(3),
    cluster: "test-ita-veto",
  });
  const result = selectMatches(user, [england, italy], equalPillar, []);
  assert.equal(result.primary.club.slug, "eng-safe");
});

test("live set still returns five countries on an extreme path", () => {
  resetVarianceCache();
  const extreme = [1, 7, 1, 1, 7, 1, 1, 7, 1, 1, 7, 7];
  const result = selectMatches(extreme, clubs, equalPillar, []);
  assert.equal(result.byCountry.length, 5);
});

test("HUD stays inside the five countries and moves after a chaos answer", () => {
  resetVarianceCache();
  const h1 = [1, null, null, null, null, null, null, null, null, null, null, null];
  const h1h2 = [1, 7, null, null, null, null, null, null, null, null, null, null];
  const state = (scores) => ({
    scores,
    pillar: equalPillar,
    ownedSlugs: [],
    hatedColor: null,
  });
  const first = provisionalDestination(state(h1), clubs);
  const next = provisionalDestination(state(h1h2), clubs);
  assert.ok(first && countryForClub(first.club));
  assert.ok(next && countryForClub(next.club));
  assert.notEqual(first.club.slug, next.club.slug);

  const england = clubs.filter((c) => countryForClub(c) === "england");
  const eng1 = provisionalDestination(state(h1), england);
  const eng2 = provisionalDestination(state(h1h2), england);
  assert.notEqual(eng1.club.slug, eng2.club.slug);
  assert.ok(eng2.club.vector[1] > eng1.club.vector[1]);
});

test("identical Everton vector still ranks Everton first", () => {
  resetVarianceCache();
  const everton = clubs.find((c) => c.slug === "everton");
  const ranked = rank(everton.vector, clubs, equalPillar);
  assert.equal(ranked[0].club.slug, "everton");
  assert.equal(ranked[0].vetoCount, 0);
});

test("pathFitPartial is defined for a single answered pillar", () => {
  const clubRow = club({
    slug: "one-pillar",
    vector: Array(12).fill(4),
    confidence: Array(12).fill(3),
  });
  const scores = [4, null, null, null, null, null, null, null, null, null, null, null];
  const fit = pathFitPartial(scores, clubRow, equalPillar, vw);
  assert.ok(fit > 0.99);
});
