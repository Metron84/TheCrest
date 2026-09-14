import { nearestArchetype } from "./archetype.js";
import { countryForClub, CREST_COUNTRIES } from "./club-country.js";
import { reasonFor } from "./reason.js";
import {
  comparePathEntries,
  displayPercent,
  getVarianceWeights,
  pillarFit,
  rank,
} from "./scoring.js";
import { inBestStratum } from "./survival.js";
import { TIER_B_PRIMARY_MARGIN, tierOf } from "./tier.js";

/**
 * @typedef {Object} ClubMatch
 * @property {object} club
 * @property {number} raw
 * @property {number} [percent]
 * @property {string} reason
 */

/**
 * @typedef {Object} CrestResult
 * @property {{ name: string; reading: string }} archetype
 * @property {ClubMatch|null} primary
 * @property {ClubMatch[]} neighbours
 * @property {ClubMatch|null} admireFromAfar
 * @property {string|null} admireLine
 * @property {boolean} showSampleNotice
 * @property {string|null} emptyMessage
 * @property {{ id: string; label: string; match: ClubMatch }[]} byCountry
 */

/**
 * @param {object[]} ranked
 * @param {Set<string>} slugSet
 * @param {Set<string>} owned
 */
function pickPrimaryEntry(ranked, slugSet, owned) {
  const eligible = ranked.filter((r) => !owned.has(r.club.slug));
  if (!eligible.length) return { primaryEntry: null, demotedTierB: null };

  const stratum = inBestStratum(eligible);
  let primaryEntry = stratum[0];
  const bestTierA = stratum.find((r) => tierOf(r.club) === "A");

  let demotedTierB = null;
  if (
    bestTierA &&
    tierOf(primaryEntry.club) === "B" &&
    primaryEntry.raw <= bestTierA.raw + TIER_B_PRIMARY_MARGIN
  ) {
    demotedTierB = primaryEntry;
    primaryEntry = bestTierA;
  }

  return { primaryEntry, demotedTierB };
}

/**
 * @param {number[]} userVector
 * @param {object[]} clubs
 * @param {{ Heart: number; Mind: number; Soul: number }} pillarWeights
 * @param {string[]} ownedSlugs
 * @param {string|null} [hatedColor]
 * @returns {CrestResult}
 */
export function selectMatches(
  userVector,
  clubs,
  pillarWeights,
  ownedSlugs = [],
  hatedColor = null,
) {
  const pool = hatedColor
    ? clubs.filter((c) => c.kit_family !== hatedColor)
    : clubs;
  const varianceW = getVarianceWeights(pool);
  const slugSet = new Set(pool.map((c) => c.slug));
  const owned = new Set(ownedSlugs);

  const ranked = rank(userVector, pool, pillarWeights, varianceW);
  const eligible = ranked.filter((r) => !owned.has(r.club.slug));
  const archetype = nearestArchetype(userVector);

  if (!eligible.length) {
    return {
      archetype,
      primary: null,
      neighbours: [],
      admireFromAfar: null,
      admireLine: null,
      showSampleNotice: pool.some((c) => c.research_status !== "validated"),
      emptyMessage: hatedColor
        ? "No club in this set survived your colour veto. Your answers still shape your crest and archetype above."
        : "Every club in the set is one you already support. Your answers still shape your crest and archetype above.",
      byCountry: [],
    };
  }

  const lo = eligible[eligible.length - 1].raw;
  const hi = eligible[0].raw;

  function enrich(entry) {
    return {
      ...entry,
      percent: displayPercent(entry.raw, lo, hi),
      reason: reasonFor(userVector, entry.club, pillarWeights, varianceW),
    };
  }

  const byCountry = scoreCountryMatches(eligible, enrich);
  const { primaryEntry, demotedTierB } = pickPrimaryEntry(ranked, slugSet, owned);
  let primary = byCountry.length
    ? byCountry.reduce(
        (best, row) =>
          comparePathEntries(row.match, best) < 0 ? row.match : best,
        byCountry[0].match,
      )
    : primaryEntry
      ? enrich(primaryEntry)
      : null;

  if (!primary) {
    return {
      archetype,
      primary: null,
      neighbours: [],
      admireFromAfar: null,
      admireLine: null,
      showSampleNotice: pool.some((c) => c.research_status !== "validated"),
      emptyMessage: hatedColor
        ? "No club in this set survived your colour veto. Your answers still shape your crest and archetype above."
        : "Every club in the set is one you already support. Your answers still shape your crest and archetype above.",
      byCountry: [],
    };
  }
  const banned = new Set([primary.club.slug]);
  for (const slug of primary.club.exclusion_clubs ?? []) {
    if (slugSet.has(slug)) banned.add(slug);
  }

  const chosenClusters = new Set([primary.club.cluster]);
  /** @type {ClubMatch[]} */
  const neighbours = [];

  function tryAddNeighbour(entry) {
    if (neighbours.length >= 2) return;
    if (banned.has(entry.club.slug)) return;
    if (entry.club.slug === primary.club.slug) return;
    if (chosenClusters.has(entry.club.cluster)) return;
    const match = enrich(entry);
    neighbours.push(match);
    chosenClusters.add(entry.club.cluster);
    for (const slug of entry.club.exclusion_clubs ?? []) {
      if (slugSet.has(slug)) banned.add(slug);
    }
  }

  const neighbourPool = inBestStratum(eligible);

  if (demotedTierB && neighbourPool.includes(demotedTierB)) {
    tryAddNeighbour(demotedTierB);
  }

  for (const entry of neighbourPool) {
    tryAddNeighbour(entry);
  }

  const shown = new Set([
    primary.club.slug,
    ...neighbours.map((n) => n.club.slug),
  ]);

  const afarCandidates = eligible.filter(
    (r) => !shown.has(r.club.slug) && !banned.has(r.club.slug),
  );

  let admireFromAfar = null;
  let admireLine = null;

  if (afarCandidates.length) {
    const scored = afarCandidates
      .map((r) => ({
        entry: r,
        score:
          pillarFit(userVector, r.club, "Mind") -
          Math.min(
            pillarFit(userVector, r.club, "Heart"),
            pillarFit(userVector, r.club, "Soul"),
          ),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.entry.club.slug.localeCompare(b.entry.club.slug);
      });
    admireFromAfar = {
      ...scored[0].entry,
      reason: reasonFor(
        userVector,
        scored[0].entry.club,
        pillarWeights,
        varianceW,
      ),
    };
    admireLine =
      "You would respect how they think. Living with them is another matter.";
  }

  const displayedClubs = [
    primary.club,
    ...neighbours.map((n) => n.club),
    admireFromAfar?.club,
    ...byCountry.map((row) => row.match.club),
  ].filter(Boolean);

  const showSampleNotice = displayedClubs.some(
    (c) => c.research_status !== "validated",
  );

  return {
    archetype,
    primary,
    neighbours,
    admireFromAfar,
    admireLine,
    showSampleNotice,
    emptyMessage: null,
    byCountry,
  };
}

/**
 * Best eligible club in England, Italy, France, Spain, Germany.
 * Percentages are relative fit among those five clubs.
 * @param {{ club: object; raw: number }[]} eligible
 * @param {(entry: { club: object; raw: number }) => ClubMatch} enrich
 */
export function pickCountryMatches(eligible, enrich) {
  return scoreCountryMatches(eligible, enrich);
}

/**
 * @param {{ club: object; raw: number }[]} eligible
 * @param {(entry: { club: object; raw: number }) => ClubMatch} enrich
 */
function scoreCountryMatches(eligible, enrich) {
  const rows = CREST_COUNTRIES.map((country) => {
    const inCountry = eligible.filter(
      (r) => countryForClub(r.club) === country.id,
    );
    const { primaryEntry } = pickPrimaryEntry(inCountry, new Set(), new Set());
    return {
      id: country.id,
      label: country.label,
      match: primaryEntry ? enrich(primaryEntry) : null,
    };
  }).filter((row) => row.match);

  if (!rows.length) return rows;

  const raws = rows.map((row) => row.match.raw);
  const lo = Math.min(...raws);
  const hi = Math.max(...raws);

  return rows.map((row) => ({
    ...row,
    match: {
      ...row.match,
      percent: displayPercent(row.match.raw, lo, hi),
    },
  }));
}
