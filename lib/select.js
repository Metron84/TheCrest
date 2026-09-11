import { nearestArchetype } from "./archetype.js";
import { reasonFor } from "./reason.js";
import {
  displayPercent,
  getVarianceWeights,
  pillarFit,
  rank,
} from "./scoring.js";

/**
 * @typedef {Object} ClubMatch
 * @property {import('./scoring.js').Club} club
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
 */

/**
 * @param {number[]} userVector
 * @param {object[]} clubs
 * @param {{ Heart: number; Mind: number; Soul: number }} pillarWeights
 * @param {string[]} ownedSlugs
 * @returns {CrestResult}
 */
export function selectMatches(userVector, clubs, pillarWeights, ownedSlugs = []) {
  const varianceW = getVarianceWeights(clubs);
  const slugSet = new Set(clubs.map((c) => c.slug));
  const owned = new Set(ownedSlugs);

  const ranked = rank(userVector, clubs, pillarWeights, varianceW).filter(
    (r) => !owned.has(r.club.slug),
  );

  const archetype = nearestArchetype(userVector);

  if (!ranked.length) {
    return {
      archetype,
      primary: null,
      neighbours: [],
      admireFromAfar: null,
      admireLine: null,
      showSampleNotice: clubs.some((c) => c.research_status !== "validated"),
      emptyMessage:
        "Every club in the set is one you already support. Your answers still shape your crest and archetype above.",
    };
  }

  const lo = ranked[ranked.length - 1].raw;
  const hi = ranked[0].raw;

  function enrich(entry) {
    return {
      ...entry,
      percent: displayPercent(entry.raw, lo, hi),
      reason: reasonFor(userVector, entry.club, pillarWeights, varianceW),
    };
  }

  const primary = enrich(ranked[0]);
  const banned = new Set([primary.club.slug]);
  for (const slug of primary.club.exclusion_clubs ?? []) {
    if (slugSet.has(slug)) banned.add(slug);
  }

  const chosenClusters = new Set([primary.club.cluster]);
  /** @type {ClubMatch[]} */
  const neighbours = [];

  for (const entry of ranked) {
    if (neighbours.length >= 2) break;
    if (banned.has(entry.club.slug)) continue;
    if (entry.club.slug === primary.club.slug) continue;
    if (chosenClusters.has(entry.club.cluster)) continue;
    const match = enrich(entry);
    neighbours.push(match);
    chosenClusters.add(entry.club.cluster);
    for (const slug of entry.club.exclusion_clubs ?? []) {
      if (slugSet.has(slug)) banned.add(slug);
    }
  }

  const shown = new Set([
    primary.club.slug,
    ...neighbours.map((n) => n.club.slug),
  ]);

  const afarCandidates = ranked.filter(
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
  };
}
