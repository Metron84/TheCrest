import { DIMS } from "./quiz-content.js";
import { weightFor } from "./scoring.js";

/**
 * Two dimensions with the smallest weighted gap, as the pole the club sits on.
 * @param {number[]} userVector
 * @param {{ vector: number[]; confidence: number[] }} club
 * @param {{ Heart: number; Mind: number; Soul: number }} pillarWeights
 * @param {number[]} varianceW
 */
export function reasonFor(userVector, club, pillarWeights, varianceW) {
  const gaps = DIMS.map((dim, i) => {
    const gap =
      Math.abs(userVector[i] - club.vector[i]) *
      weightFor(i, pillarWeights, club.confidence, varianceW);
    return { dim, i, gap };
  })
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 2);

  return gaps
    .map(({ dim, i }) => {
      const val = club.vector[i];
      if (val >= 5) return dim.high.toLowerCase();
      if (val <= 3) return dim.low.toLowerCase();
      return "balance";
    })
    .join(" and ");
}
