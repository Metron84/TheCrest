import { hexToRgb } from "./color-utils.js";
import { resolveClubGround } from "./club-ground-meta.js";
import { rankPartial, getVarianceWeights } from "./scoring.js";
import { tierOf, TIER_B_PRIMARY_MARGIN } from "./tier.js";

/** @type {{ Heart: number; Mind: number; Soul: number }} */
export const DEFAULT_PILLAR = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };

/**
 * @param {object[]} ranked
 * @param {Set<string>} owned
 */
function pickPrimaryClub(ranked, owned) {
  const eligible = ranked.filter((r) => !owned.has(r.club.slug));
  if (!eligible.length) return null;

  let primaryEntry = eligible[0];
  const bestTierA = eligible.find((r) => tierOf(r.club) === "A");

  if (
    bestTierA &&
    tierOf(primaryEntry.club) === "B" &&
    primaryEntry.raw <= bestTierA.raw + TIER_B_PRIMARY_MARGIN
  ) {
    primaryEntry = bestTierA;
  }

  return primaryEntry.club;
}

/**
 * Leading club while the quiz is in progress (updates after each affinity answer).
 * @param {{ scores: (number|null)[]; pillar: object|null; ownedSlugs: string[] }} state
 * @param {object[]} clubs
 * @returns {{ club: object; raw: number } | null}
 */
export function provisionalDestination(state, clubs) {
  if (!clubs?.length) return null;
  const hasAffinity = state.scores.some((s) => s != null);
  if (!hasAffinity) return null;

  const pillar = state.pillar ?? DEFAULT_PILLAR;
  const owned = new Set(state.ownedSlugs ?? []);
  const ranked = rankPartial(
    state.scores,
    clubs,
    pillar,
    getVarianceWeights(clubs),
  );
  const club = pickPrimaryClub(ranked, owned);
  if (!club) return null;
  const entry = ranked.find((r) => r.club.slug === club.slug);
  return { club, raw: entry?.raw ?? 0 };
}

/**
 * @param {object | null | undefined} club
 */
export function destinationGlowColors(club) {
  if (!club) {
    return { primary: "216, 35, 42", secondary: "10, 17, 31" };
  }
  const ground = resolveClubGround(club);
  const p = hexToRgb(ground.primary);
  const s = hexToRgb(ground.secondary);
  return {
    primary: p ? `${p.r}, ${p.g}, ${p.b}` : "216, 35, 42",
    secondary: s ? `${s.r}, ${s.g}, ${s.b}` : "10, 17, 31",
  };
}
