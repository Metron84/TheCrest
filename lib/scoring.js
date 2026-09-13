import { DIMS } from "./quiz-content.js";

const CONFIDENCE_FACTOR = { 3: 1.0, 2: 0.8, 1: 0.6 };

/** @param {number} level */
export function confidenceFactor(level) {
  if (level == null) return 1.0;
  return CONFIDENCE_FACTOR[level] ?? 1.0;
}

/**
 * @param {{ vector: number[] }[]} clubs
 * @returns {number[]}
 */
export function varianceWeights(clubs) {
  if (!clubs?.length) return Array(12).fill(1);
  const weights = DIMS.map((_, d) => {
    const col = clubs.map((c) => c.vector[d]);
    const mean = col.reduce((a, b) => a + b, 0) / col.length;
    const variance =
      col.reduce((a, b) => a + (b - mean) ** 2, 0) / col.length;
    return Math.sqrt(variance);
  });
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
  return weights.map((x) => (mean > 0 ? x / mean : 1));
}

let cachedVariance = null;

/** Variance weights for the committed club set, computed once per load. */
export function getVarianceWeights(clubs) {
  if (!clubs?.length) return Array(12).fill(1);
  if (!cachedVariance) {
    cachedVariance = varianceWeights(clubs);
  }
  return cachedVariance;
}

export function resetVarianceCache() {
  cachedVariance = null;
}

/**
 * @param {number} dimensionIndex
 * @param {{ Heart: number; Mind: number; Soul: number }} pillarWeights
 * @param {number[]} clubConfidence
 * @param {number[]} varianceW
 */
export function weightFor(
  dimensionIndex,
  pillarWeights,
  clubConfidence,
  varianceW,
) {
  const pillar = DIMS[dimensionIndex].pillar;
  const pillarShare = pillarWeights[pillar] / 4;
  const conf = confidenceFactor(clubConfidence?.[dimensionIndex]);
  return pillarShare * varianceW[dimensionIndex] * conf;
}

/**
 * @param {number[]} userVector
 * @param {{ vector: number[]; confidence: number[] }} club
 * @param {{ Heart: number; Mind: number; Soul: number }} pillarWeights
 * @param {number[]} [varianceW]
 */
export function rawFit(userVector, club, pillarWeights, varianceW) {
  if (!varianceW) throw new Error("varianceW is required");
  const vw = varianceW;
  let num = 0;
  let den = 0;
  for (let d = 0; d < 12; d++) {
    const sim = 1 - Math.abs(userVector[d] - club.vector[d]) / 6;
    const w = weightFor(d, pillarWeights, club.confidence, vw);
    num += w * sim;
    den += w;
  }
  return den > 0 ? num / den : 0;
}

/**
 * @param {number[]} userVector
 * @param {{ slug: string; vector: number[]; confidence: number[] }[]} clubs
 * @param {{ Heart: number; Mind: number; Soul: number }} pillarWeights
 * @param {number[]} [varianceW]
 */
export function rank(userVector, clubs, pillarWeights, varianceW) {
  const vw = varianceW ?? getVarianceWeights(clubs);
  return clubs
    .map((club) => ({ club, raw: rawFit(userVector, club, pillarWeights, vw) }))
    .sort((a, b) => {
      if (b.raw !== a.raw) return b.raw - a.raw;
      return a.club.slug.localeCompare(b.club.slug);
    });
}

/**
 * Rank using only answered affinity dimensions (null = skip).
 * @param {(number|null)[]} scores
 */
export function rawFitPartial(scores, club, pillarWeights, varianceW) {
  if (!varianceW) throw new Error("varianceW is required");
  const vw = varianceW;
  let num = 0;
  let den = 0;
  for (let d = 0; d < 12; d++) {
    if (scores[d] == null) continue;
    const sim = 1 - Math.abs(scores[d] - club.vector[d]) / 6;
    const w = weightFor(d, pillarWeights, club.confidence, vw);
    num += w * sim;
    den += w;
  }
  return den > 0 ? num / den : 0;
}

/**
 * @param {(number|null)[]} scores
 */
export function rankPartial(scores, clubs, pillarWeights, varianceW) {
  const vw = varianceW ?? getVarianceWeights(clubs);
  return clubs
    .map((club) => ({
      club,
      raw: rawFitPartial(scores, club, pillarWeights, vw),
    }))
    .sort((a, b) => {
      if (b.raw !== a.raw) return b.raw - a.raw;
      return a.club.slug.localeCompare(b.club.slug);
    });
}

/**
 * @param {number} raw
 * @param {number} lowest
 * @param {number} highest
 */
export function displayPercent(raw, lowest, highest) {
  if (highest === lowest) return 80;
  const scaled = 60 + ((raw - lowest) / (highest - lowest)) * 37;
  return Math.max(60, Math.round(scaled));
}

/**
 * @param {number[]} userVector
 * @param {{ vector: number[] }} club
 * @param {"Heart"|"Mind"|"Soul"} pillar
 */
export function pillarFit(userVector, club, pillar) {
  const indices = DIMS.map((d, i) => (d.pillar === pillar ? i : -1)).filter(
    (i) => i >= 0,
  );
  if (!indices.length) return 0;
  const sum = indices.reduce(
    (acc, d) => acc + (1 - Math.abs(userVector[d] - club.vector[d]) / 6),
    0,
  );
  return sum / indices.length;
}
