/** Minimum raw-fit lead required for a Tier B club to become primary over Tier A. */
export const TIER_B_PRIMARY_MARGIN = 0.02;

/**
 * @param {{ tier?: string|null }} club
 * @returns {'A' | 'B'}
 */
export function tierOf(club) {
  return club.tier === "B" ? "B" : "A";
}

/**
 * Optional league or division label for result copy (Tier B imports).
 * @param {{ competition?: string|null; tier?: string|null }} club
 */
export function competitionLabel(club) {
  if (club.competition && String(club.competition).trim()) {
    return String(club.competition).trim();
  }
  return null;
}
